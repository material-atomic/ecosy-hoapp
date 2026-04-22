import { useState, useCallback } from "react";
import { useHttp } from "./http";
import type { HttpMethod, HttpResponse } from "@ecosy/core/http";

export interface ExecuteRequestOptions {
  method: string;
  path: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: unknown;
}

export function useExecuteRequest(baseUrl: string) {
  const http = useHttp(baseUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HttpResponse | null>(null);
  const [responseTime, setResponseTime] = useState<number>(0);

  const execute = useCallback(
    async (options: ExecuteRequestOptions) => {
      setIsLoading(true);
      setResult(null);
      setResponseTime(0);

      const startTime = performance.now();

      try {
        let parsedBody = options.body;
        
        // If it's a non-empty string and method is not GET/HEAD, try parsing as JSON
        if (
          typeof options.body === "string" && 
          options.body.trim() !== "" &&
          !['GET', 'HEAD'].includes(options.method.toUpperCase())
        ) {
          try {
            parsedBody = JSON.parse(options.body);
          } catch {
            // Keep as string if it's not valid JSON
          }
        } else if (['GET', 'HEAD'].includes(options.method.toUpperCase())) {
          parsedBody = undefined;
        }

        const response = await http.request({
          method: options.method.toUpperCase() as HttpMethod,
          url: options.path,
          headers: options.headers,
          query: options.queryParams,
          body: parsedBody,
        });

        const endTime = performance.now();
        const time = Math.round(endTime - startTime);
        setResponseTime(time);
        setResult(response);
        
        return { response, time };
      } catch (error) {
        const endTime = performance.now();
        const time = Math.round(endTime - startTime);
        setResponseTime(time);

        // Create a fallback response structure for unhandled thrown errors
        const errResponse: HttpResponse = {
          success: false,
          status: 0,
          statusText: "Error",
          data: null,
          error: error,
          headers: {},
        };
        setResult(errResponse);
        return { response: errResponse, time };
      } finally {
        setIsLoading(false);
      }
    },
    [http]
  );

  return { execute, isLoading, result, responseTime };
}
