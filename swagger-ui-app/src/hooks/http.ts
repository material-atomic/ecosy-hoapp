import { Http } from "@ecosy/core/http";
import { useMemo } from "react";

const httpMap = new Map<string, Http>();

function createHttp(url: string) {
  const instance = new Http(url);

  // TODO: add configs

  return instance;
}

export function useHttp(url: string) {
  const http = useMemo(() => {
    if (httpMap.has(url)) {
      return httpMap.get(url);
    }

    const instance = createHttp(url);
    httpMap.set(url, instance);
    return instance;
  }, [url]);

  return http;
}
