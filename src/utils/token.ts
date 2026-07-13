const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  setTokens(
      accessToken: string,
      refreshToken: string,
  ): void {
    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        accessToken,
    );

    localStorage.setItem(
        REFRESH_TOKEN_KEY,
        refreshToken,
    );
  },

  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};