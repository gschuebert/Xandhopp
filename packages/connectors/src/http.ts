import pRetry from "p-retry";
import { setTimeout as wait } from "node:timers/promises";
import https from "node:https";

export type FetchOptions = {
  headers?: Record<string, string>;
  etag?: string;
  ifModifiedSince?: string;
  timeout?: number;
  retries?: number;
};

export type HttpResponse<T> = {
  status: number;
  data?: T;
  etag?: string;
  lastModified?: string;
  headers: Headers;
};

/**
 * Enhanced HTTP client with retry logic, ETag support, and rate limiting
 */
export async function httpGetJson<T>(
  url: string,
  opts: FetchOptions = {}
): Promise<HttpResponse<T>> {
  const {
    headers = {},
    etag,
    ifModifiedSince,
    timeout = 30000,
    retries = 3
  } = opts;

  return pRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const requestHeaders: Record<string, string> = {
          "User-Agent": "Portalis/1.0 (https://xandhopp.dev)",
          "Accept": "application/json",
          ...headers,
        };

        if (etag) {
          requestHeaders["If-None-Match"] = etag;
        }
        if (ifModifiedSince) {
          requestHeaders["If-Modified-Since"] = ifModifiedSince;
        }

        // Create custom agent for HTTPS requests in development
        const fetchOptions: any = {
          headers: requestHeaders,
          signal: controller.signal,
        };

        // For development: create custom HTTPS agent that ignores certificate errors
        if (process.env.NODE_ENV === 'development' && url.startsWith('https://')) {
          const agent = new https.Agent({
            rejectUnauthorized: false,
          });
          // Note: This works with node-fetch but not with native fetch
          // We'll rely on NODE_TLS_REJECT_UNAUTHORIZED instead
        }

        const response = await fetch(url, fetchOptions);

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
          console.warn(`Rate limited, waiting ${waitMs}ms before retry`);
          await wait(waitMs);
          throw new Error("Rate limited");
        }

        // Handle not modified
        if (response.status === 304) {
          return {
            status: 304,
            data: undefined,
            headers: response.headers,
          } as HttpResponse<T>;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseEtag = response.headers.get("etag") || undefined;
        const lastModified = response.headers.get("last-modified") || undefined;
        const data = await response.json() as T;

        return {
          status: response.status,
          data,
          etag: responseEtag,
          lastModified,
          headers: response.headers,
        };
      } finally {
        clearTimeout(timeoutId);
      }
    },
    {
      retries,
      onFailedAttempt: (error) => {
        console.warn(
          `HTTP request failed (attempt ${error.attemptNumber}/${retries + 1}): ${error.message}`
        );
      },
    }
  );
}

/**
 * Simple GET request for XML/HTML content
 */
export async function httpGetText(
  url: string,
  opts: FetchOptions = {}
): Promise<HttpResponse<string>> {
  const {
    headers = {},
    timeout = 30000,
    retries = 3
  } = opts;

  return pRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Portalis/1.0 (https://xandhopp.dev)",
            ...headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          await wait(1000);
          throw new Error("Rate limited");
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.text();
        return {
          status: response.status,
          data,
          headers: response.headers,
        };
      } finally {
        clearTimeout(timeoutId);
      }
    },
    { retries }
  );
}

/**
 * Utility to build query parameters
 */
export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}
