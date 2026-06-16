const TOKEN_KEY = "accessToken";

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token") || localStorage.getItem("auth_token");
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
  },
};
