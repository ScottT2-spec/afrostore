const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null, persist: boolean = true) {
    this.token = token;
    if (typeof window === "undefined") return;
    if (token) {
      if (persist) {
        localStorage.setItem("token", token);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", token);
        localStorage.removeItem("token");
      }
    } else {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token") || sessionStorage.getItem("token");
    }
    return this.token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
      });

      const text = await res.text();
      let json: any = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          // Server returned something that isn't JSON at all - an HTML
          // error page from a crash, a gateway timeout, an auth redirect,
          // etc. Log the full raw body so the real cause is inspectable
          // in devtools/log aggregation, and surface real diagnostic
          // detail (status + a snippet of the actual body) instead of
          // leaking the raw parser error ("Unrecognized token '<'") or
          // hiding it behind a fully generic message.
          console.error(`[api-client] Non-JSON response from ${path} (status ${res.status}):`, text);
          const snippet = text.replace(/\s+/g, " ").trim().slice(0, 200);
          return {
            success: false,
            error: `Server returned an invalid response (HTTP ${res.status}): ${snippet || "empty body"}`,
          };
        }
      }

      if (!res.ok) {
        return {
          success: false,
          error: json?.error || `Request failed (${res.status})`,
          details: json?.details,
        };
      }

      return json || { success: true, data: undefined };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** For multipart/form-data uploads — the browser sets the correct
   * multipart boundary itself; request() detects FormData and skips the
   * JSON Content-Type header automatically. */
  postForm<T>(path: string, formData: FormData) {
    return this.request<T>(path, { method: "POST", body: formData });
  }

  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  put<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
export type { ApiResponse };
