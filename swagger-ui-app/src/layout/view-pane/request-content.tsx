/* eslint-disable react-hooks/set-state-in-effect */
import { useOpenApi } from "@/hooks/openapi";
import { Button } from "@/components/button";
import { Tabs, TabList, TabItem, TabPanes, TabContent } from "@/components/tabs";
import { Resizable, ResizablePane, ResizableHandler } from "@/components/resizable";
import { JsonViewer } from "@/components/json-viewer";
import { JsonEditor } from "@/components/json-editor";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/collapsible";
import { IconChevronDown } from "@/icons/chevron-down";
import { IconX } from "@/icons/x";
import { IconPlay } from "@/icons/play";
import type { OpenApiResponse, OpenApiExample } from "@/store/openapis";
import { CurlViewer } from "@/components/curl-viewer";
import { AuthBasicForm } from "../auth/auth-basic-form";
import { AuthBearerForm } from "../auth/auth-bearer-form";
import styles from "./view-pane.module.scss";
import { useState, useEffect } from "react";
import { useCurlBuilder } from "@/hooks/curl";
import { useExecuteRequest } from "@/hooks/execute";
import { useSelector, useDispatch } from "@/store";
import { authActions } from "@/store/auth";
import { responsesActions } from "@/store/responses";
import { extractExampleFromContent } from "@/utils/schema";

export interface RequestContentProps {
  activeItem?: string;
  selectedUrl: string;
}

export function RequestContent({ activeItem, selectedUrl }: RequestContentProps) {
  const openApi = useOpenApi(selectedUrl);
  const [activeTab, setActiveTab] = useState<string>("params");
  const [activeBottomTab, setActiveBottomTab] = useState<string>("result");
  const [requestBody, setRequestBody] = useState<string>("");
  const [pathParamValues, setPathParamValues] = useState<Record<string, string>>({});
  const [queryRows, setQueryRows] = useState<{ id: string; key: string; value: string; enabled: boolean }[]>([]);
  const [cookieRows, setCookieRows] = useState<{ id: string; key: string; value: string; enabled: boolean }[]>([]);

  const [authMode, setAuthMode] = useState<"inherit" | "custom">("inherit");
  const [customBearer, setCustomBearer] = useState("");
  const [customBasic, setCustomBasic] = useState({ username: "", password: "" });

  const { execute, isLoading } = useExecuteRequest(selectedUrl);
  const { buildCurl } = useCurlBuilder();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  
  const responsesMap = useSelector((state) => state.responses);
  const currentEndpointResponse = activeItem ? responsesMap[activeItem] : null;

  useEffect(() => {
    // Reset state when changing endpoints
    setActiveTab("params");
    setActiveBottomTab("result");
    setRequestBody("");
    setPathParamValues({});
    setQueryRows([]);
    setCookieRows([]);
    setAuthMode("inherit");
    setCustomBearer("");
    setCustomBasic({ username: "", password: "" });
  }, [activeItem]);

  const method = activeItem ? activeItem.split("|")[0] : "";
  const path = activeItem ? activeItem.split("|")[1] : "";
  const pathItem = (path && method && openApi?.paths?.[path]) 
    ? openApi.paths[path][method.toLowerCase() as keyof typeof openApi.paths[string]] 
    : null;

  useEffect(() => {
    if (pathItem?.parameters) {
      setQueryRows(prev => {
        const existingKeys = new Set(prev.map(r => r.key));
        const newParams = pathItem.parameters!
          .filter(p => p.in === 'query' && !existingKeys.has(p.name))
          .map(p => ({
            id: Math.random().toString(36).substring(7),
            key: p.name,
            value: "",
            enabled: true
          }));
        
        if (newParams.length > 0) {
          return [...prev, ...newParams];
        }
        return prev;
      });
    }
  }, [pathItem]);

  const updateQueryRow = (id: string, field: keyof typeof queryRows[0], value: string | boolean) => {
    setQueryRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeQueryRow = (id: string) => {
    setQueryRows(prev => prev.filter(r => r.id !== id));
  };

  const addQueryRow = () => {
    setQueryRows(prev => [...prev, { id: Math.random().toString(36).substring(7), key: "", value: "", enabled: true }]);
  };

  const updateCookieRow = (id: string, field: keyof typeof cookieRows[0], value: string | boolean) => {
    setCookieRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeCookieRow = (id: string) => {
    setCookieRows(prev => prev.filter(r => r.id !== id));
  };

  const addCookieRow = () => {
    setCookieRows(prev => [...prev, { id: Math.random().toString(36).substring(7), key: "", value: "", enabled: true }]);
  };

  const hasBasicAuth = pathItem?.security?.some(s => Object.keys(s).includes("basicAuth")) ?? false;
  const hasBearerAuth = pathItem?.security?.some(s => Object.keys(s).includes("bearerAuth")) ?? false;
  const noAuthRequired = !hasBasicAuth && !hasBearerAuth;

  const pathParamsMatch = path.match(/\{([^}]+)\}/g);
  const pathParams = pathParamsMatch ? pathParamsMatch.map(p => p.slice(1, -1)) : [];

  let curlCommand = "";
  let currentHeaders: Record<string, string> = {};
  let currentQueryParams: Record<string, string> = {};

  if (pathItem && activeItem) {
    if (hasBearerAuth) {
      const token = authMode === "inherit" ? authState.bearer.token : customBearer;
      if (token) currentHeaders["Authorization"] = `Bearer ${token}`;
    } else if (hasBasicAuth) {
      const creds = authMode === "inherit" ? authState.basic : customBasic;
      if (creds.username && creds.password) {
        const basicBase64 = btoa(`${creds.username}:${creds.password}`);
        currentHeaders["Authorization"] = `Basic ${basicBase64}`;
      }
    }

    queryRows.forEach(row => {
      if (row.enabled && row.key.trim() !== "") {
        currentQueryParams[row.key.trim()] = row.value;
      }
    });

    const cookiePairs: string[] = [];
    cookieRows.forEach(row => {
      if (row.enabled && row.key.trim() !== "") {
        cookiePairs.push(`${row.key.trim()}=${row.value}`);
      }
    });
    if (cookiePairs.length > 0) {
      currentHeaders["Cookie"] = cookiePairs.join("; ");
    }

    curlCommand = buildCurl({
      baseUrl: selectedUrl,
      path,
      method,
      pathParams: pathParamValues,
      queryParams: currentQueryParams,
      body: requestBody,
      headers: currentHeaders
    });
  }

  const handleSend = async () => {
    if (!pathItem || !activeItem) return;

    let finalPath = path;
    Object.entries(pathParamValues).forEach(([key, value]) => {
      finalPath = finalPath.replace(`{${key}}`, value);
    });

    const { response, time } = await execute({
      method,
      path: finalPath,
      headers: currentHeaders,
      queryParams: currentQueryParams,
      body: requestBody
    });
    
    dispatch(responsesActions.setResponse({
      id: activeItem,
      response: {
        result: response,
        responseTime: time
      }
    }));
    
    setActiveBottomTab("result");
  };

  if (!activeItem) {
    return (
      <div className={styles.emptyPane}>
        Select an endpoint to view details
      </div>
    );
  }

  if (!pathItem) {
    return (
      <div className={styles.emptyPane}>
        Endpoint not found in schema
      </div>
    );
  }

  const handleTryIt = (exampleValue: unknown) => {
    setRequestBody(typeof exampleValue === 'string' ? exampleValue : JSON.stringify(exampleValue, null, 2));
    setActiveTab("body"); // Switch tab
  };

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={styles.urlBar}>
          <span className={styles.tabMethod} data-method={method}>{method}</span>
          <span className={styles.urlText}>{path}</span>
        </div>
        <Button 
          size="sm" 
          variant="solid" 
          className={styles.sendButton} 
          style={{ background: "var(--primary, #3b82f6)", color: "#fff", border: "none" }}
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>

      <div className={styles.bodySplit}>
        <Resizable orientation="vertical">
          <ResizablePane defaultSize="50%" minSize={300} className={styles.leftPane}>
            <div className={styles.docSection}>
              
              <Collapsible defaultOpen className={styles.sectionGroup}>
                <CollapsibleTrigger className={styles.sectionTrigger}>
                  <IconChevronDown size={14} /> Description
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className={styles.sectionContent}>
                     {pathItem.summary && <h3 className={styles.docTitle}>{pathItem.summary}</h3>}
                     {pathItem.description ? (
                       <MarkdownViewer content={pathItem.description} />
                     ) : (
                       <p className={styles.mutedText}>No description provided.</p>
                     )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible defaultOpen className={styles.sectionGroup}>
                <CollapsibleTrigger className={styles.sectionTrigger}>
                  <IconChevronDown size={14} /> Responses
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className={styles.sectionContent}>
                    {pathItem.responses && Object.keys(pathItem.responses).length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {Object.entries(pathItem.responses).map(([status, resp]: [string, OpenApiResponse]) => (
                          <Collapsible key={status} defaultOpen={status.startsWith("2")} className={styles.responseCollapsible}>
                            <CollapsibleTrigger className={styles.responseTrigger}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <IconChevronDown size={14} className={styles.triggerIcon} />
                                <span style={{ fontWeight: 700, color: status.startsWith("2") ? "var(--success, #10b981)" : "var(--error, #ef4444)" }}>{status}</span>
                                <span style={{ fontSize: "var(--fs-sm)", color: "var(--foreground-muted)" }}>{resp.description}</span>
                              </div>
                            </CollapsibleTrigger>
                            {resp.content && (
                              <CollapsibleContent>
                                <div className={styles.responseContent}>
                                  <JsonViewer 
                                    data={extractExampleFromContent(resp.content, openApi)} 
                                    className={styles.viewerOverride} 
                                  />
                                </div>
                              </CollapsibleContent>
                            )}
                          </Collapsible>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.mutedText}>No responses documented.</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible defaultOpen className={styles.sectionGroup}>
                <CollapsibleTrigger className={styles.sectionTrigger}>
                  <IconChevronDown size={14} /> Examples
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className={styles.sectionContent}>
                    {pathItem["x-examples"] && Object.keys(pathItem["x-examples"]).length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                         {Object.entries(pathItem["x-examples"]).map(([key, example]: [string, OpenApiExample]) => (
                           <div key={key}>
                             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                               <div style={{ fontWeight: 600, fontSize: "12px" }}>{example.summary || key}</div>
                               <Button 
                                 size="sm" 
                                 variant="solid"
                                 title="Load this example into Request Body"
                                 onClick={() => handleTryIt(example.value)}
                                 style={{ height: 24, fontSize: 11, padding: '0 8px', background: 'var(--success, #10b981)', color: '#fff', border: 'none' }}
                               >
                                 <IconPlay size={12} /> Try it
                               </Button>
                             </div>
                             <JsonViewer 
                               data={example.value} 
                               className={styles.viewerOverride} 
                             />
                           </div>
                         ))}
                      </div>
                    ) : (
                      <p className={styles.mutedText}>No examples provided.</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

            </div>
          </ResizablePane>

          <ResizableHandler />

          <ResizablePane className={styles.rightPane}>
            <Resizable orientation="horizontal">
              <ResizablePane defaultSize="60%" minSize={200} className={styles.configPane}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabList>
                <TabItem value="params">Params</TabItem>
                <TabItem value="query">Query</TabItem>
                <TabItem value="auth">Authorization</TabItem>
                <TabItem value="body">Body</TabItem>
                <TabItem value="cookies">Cookies</TabItem>
              </TabList>
              
              <TabPanes style={{ paddingTop: activeTab === 'body' ? 0 : undefined }}>
                <TabContent value="params">
                  <div className={styles.tabPanel}>
                    {pathParams.length > 0 ? (
                      <table className={styles.formTable}>
                        <thead>
                          <tr>
                            <th>Key</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pathParams.map(paramKey => (
                            <tr key={paramKey}>
                              <td className={styles.keyCell}>
                                <span className={styles.paramKey}>{paramKey}</span>
                              </td>
                              <td className={styles.valCell}>
                                <input 
                                  type="text" 
                                  placeholder={`Value for ${paramKey}`} 
                                  className={styles.paramInput}
                                  value={pathParamValues[paramKey] || ""}
                                  onChange={(e) => setPathParamValues(prev => ({ ...prev, [paramKey]: e.target.value }))}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className={styles.emptyForm}>
                        <p className={styles.mutedText}>No path parameters needed for this endpoint.</p>
                      </div>
                    )}
                  </div>
                </TabContent>
                
                <TabContent value="query">
                  <div className={styles.tabPanel}>

                    <div className={styles.excelTableWrapper}>
                      <table className={styles.excelTable}>
                        <thead>
                          <tr>
                            <th className={styles.checkCol}></th>
                            <th>Key</th>
                            <th>Value</th>
                            <th className={styles.actionCol}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {queryRows.map((row) => (
                            <tr key={row.id}>
                              <td className={styles.checkCell}>
                                <input 
                                  type="checkbox" 
                                  checked={row.enabled} 
                                  onChange={(e) => updateQueryRow(row.id, 'enabled', e.target.checked)} 
                                />
                              </td>
                              <td className={styles.inputCell}>
                                <input 
                                  type="text" 
                                  placeholder="Key" 
                                  className={styles.excelInput} 
                                  value={row.key}
                                  onChange={(e) => updateQueryRow(row.id, 'key', e.target.value)}
                                />
                              </td>
                              <td className={styles.inputCell}>
                                <input 
                                  type="text" 
                                  placeholder="Value" 
                                  className={styles.excelInput} 
                                  value={row.value}
                                  onChange={(e) => updateQueryRow(row.id, 'value', e.target.value)}
                                />
                              </td>
                              <td className={styles.actionCell}>
                                <button className={styles.removeBtn} title="Remove parameter" onClick={() => removeQueryRow(row.id)}>
                                  <IconX size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className={styles.tableFooter}>
                        <button className={styles.addButton} onClick={addQueryRow}>+ Add Parameter</button>
                      </div>
                    </div>
                  </div>
                </TabContent>
                
                <TabContent value="auth">
                  <div className={styles.tabPanel}>

                    {noAuthRequired ? (
                      <div className={styles.emptyForm}>
                        <p className={styles.mutedText}>This endpoint does not require authorization.</p>
                      </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <p className={styles.mutedText}>
                            This endpoint requires authorization. Select how you want to provide credentials:
                          </p>
                          
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                              <input type="radio" checked={authMode === "inherit"} onChange={() => setAuthMode('inherit')} />
                              Inherit from Global Auth
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                              <input type="radio" checked={authMode === "custom"} onChange={() => setAuthMode('custom')} />
                              Custom Credentials
                            </label>
                          </div>
                          
                          {authMode === "inherit" ? (
                            <div className={styles.emptyForm}>
                              <p className={styles.mutedText}>Currently utilizing Global Authorization credentials.</p>
                              <p className={styles.mutedText} style={{ fontSize: 11, marginTop: 4 }}>You can modify global credentials using the Authorize button in the sidebar.</p>
                            </div>
                          ) : (
                            <>
                              {hasBearerAuth && (
                                <AuthBearerForm 
                                  token={customBearer}
                                  onChange={(token) => setCustomBearer(token)}
                                />
                              )}
                              {hasBasicAuth && (
                                <AuthBasicForm 
                                  username={customBasic.username}
                                  password={customBasic.password}
                                  onChange={(data) => setCustomBasic(data)}
                                />
                              )}
                            </>
                          )}
                        </div>
                    )}
                  </div>
                </TabContent>
                
                <TabContent value="body" style={{ height: '100%' }}>
                  <div className={styles.tabPanel} style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <JsonEditor 
                      value={requestBody}
                      onChange={setRequestBody}
                      placeholder="Paste or write your JSON Request Body here..."
                      style={{ height: "100%", width: "100%", flex: 1, border: 'none', borderRadius: 0 }}
                    />
                  </div>
                </TabContent>

                <TabContent value="cookies">
                  <div className={styles.tabPanel}>

                    <div className={styles.excelTableWrapper}>
                      <table className={styles.excelTable}>
                        <thead>
                          <tr>
                            <th className={styles.checkCol}></th>
                            <th>Key</th>
                            <th>Value</th>
                            <th className={styles.actionCol}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cookieRows.map((row) => (
                            <tr key={row.id}>
                              <td className={styles.checkCell}>
                                <input 
                                  type="checkbox" 
                                  checked={row.enabled} 
                                  onChange={(e) => updateCookieRow(row.id, 'enabled', e.target.checked)} 
                                />
                              </td>
                              <td className={styles.inputCell}>
                                <input 
                                  type="text" 
                                  placeholder="Cookie Name" 
                                  className={styles.excelInput} 
                                  value={row.key}
                                  onChange={(e) => updateCookieRow(row.id, 'key', e.target.value)}
                                />
                              </td>
                              <td className={styles.inputCell}>
                                <input 
                                  type="text" 
                                  placeholder="Cookie Value" 
                                  className={styles.excelInput} 
                                  value={row.value}
                                  onChange={(e) => updateCookieRow(row.id, 'value', e.target.value)}
                                />
                              </td>
                              <td className={styles.actionCell}>
                                <button className={styles.removeBtn} title="Remove cookie" onClick={() => removeCookieRow(row.id)}>
                                  <IconX size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className={styles.tableFooter}>
                        <button className={styles.addButton} onClick={addCookieRow}>+ Add Cookie</button>
                      </div>
                    </div>
                  </div>
                </TabContent>
              </TabPanes>
                </Tabs>
              </ResizablePane>

              <ResizableHandler />

              <ResizablePane defaultSize="40%" minSize={100} className={styles.responsePane}>
                <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab}>
                  <TabList>
                    <TabItem value="result">Result</TabItem>
                    <TabItem value="curl">cURL</TabItem>
                  </TabList>
                  
                  <TabPanes>
                    <TabContent value="result">
                      {isLoading ? (
                        <div className={styles.emptyForm}>
                          <p className={styles.mutedText}>Sending request...</p>
                        </div>
                      ) : currentEndpointResponse?.result ? (
                        <div className={styles.responseContent} style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', padding: '0 8px' }}>
                            <span style={{ fontWeight: 600, color: currentEndpointResponse.result.status >= 200 && currentEndpointResponse.result.status < 300 ? "var(--success, #10b981)" : "var(--error, #ef4444)" }}>
                              Status: {currentEndpointResponse.result.status} {currentEndpointResponse.result.statusText}
                            </span>
                            <span className={styles.mutedText}>Time: {currentEndpointResponse.responseTime}ms</span>
                          </div>
                          
                          <div style={{ flex: 1, overflow: 'auto', borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '8px' }}>
                            {currentEndpointResponse.result.data !== undefined && currentEndpointResponse.result.data !== null ? (
                              <JsonViewer data={currentEndpointResponse.result.data} className={styles.viewerOverride} />
                            ) : currentEndpointResponse.result.error ? (
                              <JsonViewer data={currentEndpointResponse.result.error} className={styles.viewerOverride} />
                            ) : (
                              <p className={styles.mutedText} style={{ padding: '0 8px' }}>Empty response body</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.emptyForm}>
                          <p className={styles.mutedText}>Hit Send to get a response</p>
                        </div>
                      )}
                    </TabContent>
                    
                    <TabContent value="curl">
                      <CurlViewer data={curlCommand} />
                    </TabContent>
                  </TabPanes>
                </Tabs>
              </ResizablePane>
            </Resizable>
          </ResizablePane>
        </Resizable>
      </div>
    </div>
  );
}
