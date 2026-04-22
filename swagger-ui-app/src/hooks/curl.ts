/* eslint-disable @typescript-eslint/no-unused-vars */
import { Serialize } from "@ecosy/core";

export interface BuildCurlOptions {
  baseUrl: string;
  path: string;
  method: string;
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
}

export function useCurlBuilder() {
  const buildCurl = (options: BuildCurlOptions) => {
    const { baseUrl, path, method, pathParams = {}, queryParams = {}, headers = {}, body } = options;

    // Remove trailing slash from base url and leading slash from path
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    
    let fullPath = normalizedPath;
    
    // Replace variables in path
    if (Object.keys(pathParams).length > 0) {
      try {
        fullPath = Serialize.interpolate(normalizedPath, pathParams);
      } catch (e) {
        console.warn("Failed to interpolate path variables:", e);
      }
    }

    let url = `${normalizedBaseUrl}${fullPath}`;

    // Append query params
    const validQueryParams = Object.entries(queryParams).filter(([_, v]) => v !== undefined && v !== "");
    if (validQueryParams.length > 0) {
      const searchParams = new URLSearchParams();
      validQueryParams.forEach(([k, v]) => searchParams.append(k, v));
      url += (url.includes("?") ? "&" : "?") + searchParams.toString();
    }

    let curl = `curl -X ${method.toUpperCase()} \\\n  "${url}"`;

    // Process headers
    const validHeaders = Object.entries(headers).filter(([_, v]) => v !== undefined && v !== "");
    if (body && !headers["Content-Type"]) {
      validHeaders.push(["Content-Type", "application/json"]);
    }
    
    validHeaders.forEach(([key, value]) => {
      curl += ` \\\n  -H "${key}: ${value}"`;
    });

    // Add body
    if (body) {
      // Escape single quotes for POSIX shell
      const safeBody = body.replace(/'/g, "'\\''");
      curl += ` \\\n  -d '${safeBody}'`;
    }

    return curl;
  };

  return { buildCurl };
}
