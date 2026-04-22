/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from "react";
import { useHttp } from "./http";
import { useUrls } from "./schema";
import { dispatch, useSelector } from "@/store";
import type { Http } from "@ecosy/core/http";
import { openApiAction, type OpenApi, type OpenApiPathInfo } from "@/store/openapis";

async function fetchOpenApi(url: string, http: Http) {
  const result = await http.get<OpenApi>("/docs/openapi.json");

  if (result.success) {
    dispatch(openApiAction.setOpenApi(result.data, url))
  }
}

export function useOpenApi(url: string) {
  const http = useHttp(url);
  const openApis = useSelector((state) => state.openApis);

  const json = useMemo(() => {
    return openApis[url];
  }, [url, openApis]);

  useEffect(() => {
    if (json) {
      return;
    }

    if (url) {
      fetchOpenApi(url, http);
    }
  }, [json, url]);

  return json;
}

export type AuthType = "basic" | "bearer" | "public";

export interface EndpointItem {
  path: string;
  method: string;
  summary?: string;
  authType: AuthType;
  info: OpenApiPathInfo;
}

export interface TaggedEndpoints {
  tag: string;
  endpoints: EndpointItem[];
}

export function useGroupedEndpoints() {
  const { selectedUrl } = useUrls();
  const openApiData = useOpenApi(selectedUrl);

  const grouped = useMemo(() => {
    const paths = openApiData?.paths;
    if (!paths) return [];

    const tagMap = new Map<string, EndpointItem[]>();

    Object.entries(paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, info]) => {
        // Group by the first tag, or "default" if no tags exist
        const tag = info.tags && info.tags.length > 0 ? info.tags[0] : "default";

        const security = info.security;
        let authType: AuthType = "public";

        if (security && security.length > 0) {
          const hasBearer = security.some(s => Object.keys(s).some(k => k.toLowerCase().includes('bearer')));
          const hasBasic = security.some(s => Object.keys(s).some(k => k.toLowerCase().includes('basic') || k.toLowerCase().includes('login')));

          if (hasBearer) authType = "bearer";
          else if (hasBasic) authType = "basic";
          else authType = "bearer"; // Fallback if exact match not found but security is required
        }

        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push({
          path,
          method,
          summary: info.summary,
          authType,
          info,
        });
      });
    });

    return Array.from(tagMap.entries()).map(([tag, endpoints]) => ({
      tag,
      endpoints,
    }));
  }, [openApiData]);

  return grouped;
}

export interface TreeNode {
  name: string;
  fullPath: string;
  endpoints: EndpointItem[];
  children: TreeNode[];
}

interface TreeNodeBuilder {
  name: string;
  fullPath: string;
  endpoints: EndpointItem[];
  children: Record<string, TreeNodeBuilder>;
}

export function useTreeEndpoints() {
  const { selectedUrl } = useUrls();
  const openApiData = useOpenApi(selectedUrl);

  const tree = useMemo(() => {
    const paths = openApiData?.paths;
    if (!paths) return [];

    const root: Record<string, TreeNodeBuilder> = {};

    Object.entries(paths).forEach(([path, methods]) => {
      const segments = path.split('/').filter(Boolean);
      
      let currentLevel = root;
      let currentPath = '';

      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        
        if (!currentLevel[segment]) {
          currentLevel[segment] = {
            name: segment,
            fullPath: currentPath,
            endpoints: [],
            children: {},
          };
        }

        if (index === segments.length - 1) {
          Object.entries(methods).forEach(([method, info]) => {
            const security = info.security;
            let authType: AuthType = "public";

            if (security && security.length > 0) {
              const hasBearer = security.some(s => Object.keys(s).some(k => k.toLowerCase().includes('bearer')));
              const hasBasic = security.some(s => Object.keys(s).some(k => k.toLowerCase().includes('basic') || k.toLowerCase().includes('login')));

              if (hasBearer) authType = "bearer";
              else if (hasBasic) authType = "basic";
              else authType = "bearer"; 
            }

            currentLevel[segment].endpoints.push({
              path,
              method,
              summary: info.summary,
              authType,
              info,
            });
          });
        }

        currentLevel = currentLevel[segment].children;
      });
    });

    const buildTree = (nodes: Record<string, TreeNodeBuilder>): TreeNode[] => {
      return Object.values(nodes).map(node => ({
        name: node.name,
        fullPath: node.fullPath,
        endpoints: node.endpoints,
        children: buildTree(node.children),
      }));
    };

    return buildTree(root);
  }, [openApiData]);

  return tree;
}