const API_URL = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === "production"
    ? "https://api-vitali.serverpalmas.cloud"
    : "http://localhost:8080");

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (response.status === 204) return null as T;

  const contentType = response.headers.get("content-type") || "";
  const payload: unknown = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      if (token) sessionStorage.setItem("sessionExpired", "expired");
      localStorage.removeItem("lastActivity");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      // Sesión vencida o token inválido: volver al login (excepto en el propio login).
      if (!endpoint.startsWith("/api/auth/") && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const errorPayload = typeof payload === "object" && payload !== null
      ? payload as Record<string, unknown>
      : {};
    const apiMessage = [errorPayload.message, errorPayload.error, errorPayload.detail]
      .find((value): value is string => typeof value === "string");
    const message = typeof payload === "string"
      ? payload
      : apiMessage || `Error del servidor (${response.status})`;
    const error = new Error(message) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return payload as T;
}
