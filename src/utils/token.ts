const ACCESS_TOKEN_KEY =
    "fitlife.accessToken";

const REFRESH_TOKEN_KEY =
    "fitlife.refreshToken";

function canUseStorage(): boolean {
  return (
      typeof window !== "undefined" &&
      typeof window.localStorage !==
      "undefined"
  );
}

function getStorageValue(
    key: string,
): string | null {
  if (!canUseStorage()) {
    return null;
  }

  const value =
      window.localStorage.getItem(key);

  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function setStorageValue(
    key: string,
    value: string,
): void {
  if (!canUseStorage()) {
    return;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(
      key,
      normalizedValue,
  );
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return getStorageValue(
        ACCESS_TOKEN_KEY,
    );
  },

  getRefreshToken(): string | null {
    return getStorageValue(
        REFRESH_TOKEN_KEY,
    );
  },

  setAccessToken(
      accessToken: string,
  ): void {
    setStorageValue(
        ACCESS_TOKEN_KEY,
        accessToken,
    );
  },

  setRefreshToken(
      refreshToken: string,
  ): void {
    setStorageValue(
        REFRESH_TOKEN_KEY,
        refreshToken,
    );
  },

  setTokens(
      accessToken: string,
      refreshToken: string,
  ): void {
    setStorageValue(
        ACCESS_TOKEN_KEY,
        accessToken,
    );

    setStorageValue(
        REFRESH_TOKEN_KEY,
        refreshToken,
    );
  },

  clearAccessToken(): void {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(
        ACCESS_TOKEN_KEY,
    );
  },

  clearRefreshToken(): void {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(
        REFRESH_TOKEN_KEY,
    );
  },

  clear(): void {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(
        ACCESS_TOKEN_KEY,
    );

    window.localStorage.removeItem(
        REFRESH_TOKEN_KEY,
    );

    /*
     * Xóa key cũ để tránh xung đột sau khi migrate.
     */
    window.localStorage.removeItem(
        "accessToken",
    );

    window.localStorage.removeItem(
        "refreshToken",
    );
  },

  migrateLegacyTokens(): void {
    if (!canUseStorage()) {
      return;
    }

    const currentAccessToken =
        getStorageValue(
            ACCESS_TOKEN_KEY,
        );

    const currentRefreshToken =
        getStorageValue(
            REFRESH_TOKEN_KEY,
        );

    const legacyAccessToken =
        window.localStorage.getItem(
            "accessToken",
        );

    const legacyRefreshToken =
        window.localStorage.getItem(
            "refreshToken",
        );

    if (
        !currentAccessToken &&
        legacyAccessToken
    ) {
      setStorageValue(
          ACCESS_TOKEN_KEY,
          legacyAccessToken,
      );
    }

    if (
        !currentRefreshToken &&
        legacyRefreshToken
    ) {
      setStorageValue(
          REFRESH_TOKEN_KEY,
          legacyRefreshToken,
      );
    }

    window.localStorage.removeItem(
        "accessToken",
    );

    window.localStorage.removeItem(
        "refreshToken",
    );
  },
};

tokenStorage.migrateLegacyTokens();