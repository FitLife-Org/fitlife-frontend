const ACCESS_TOKEN_KEY =
    "fitlife.accessToken";

const REFRESH_TOKEN_KEY =
    "fitlife.refreshToken";

const REMEMBER_ME_KEY =
    "fitlife.rememberMe";

const LEGACY_ACCESS_TOKEN_KEY =
    "accessToken";

const LEGACY_REFRESH_TOKEN_KEY =
    "refreshToken";

function canUseStorage(): boolean {
  return (
      typeof window !== "undefined" &&
      typeof window.localStorage !==
      "undefined" &&
      typeof window.sessionStorage !==
      "undefined"
  );
}

function normalizeValue(
    value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const normalized =
      value.trim();

  return normalized || null;
}

function getValueFromStorage(
    storage: Storage,
    key: string,
): string | null {
  return normalizeValue(
      storage.getItem(key),
  );
}

function removeKeyFromBothStorages(
    key: string,
): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

function setValue(
    storage: Storage,
    key: string,
    value: string,
): void {
  const normalized =
      value.trim();

  if (!normalized) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(
      key,
      normalized,
  );
}

function getRememberMeFlag():
    boolean {
  if (!canUseStorage()) {
    return false;
  }

  return (
      window.localStorage.getItem(
          REMEMBER_ME_KEY,
      ) === "true"
  );
}

function getCurrentSessionStorage():
    Storage | null {
  if (!canUseStorage()) {
    return null;
  }

  return getRememberMeFlag()
      ? window.localStorage
      : window.sessionStorage;
}

export const tokenStorage = {
  getAccessToken():
      string | null {
    if (!canUseStorage()) {
      return null;
    }

    return (
        getValueFromStorage(
            window.localStorage,
            ACCESS_TOKEN_KEY,
        ) ??
        getValueFromStorage(
            window.sessionStorage,
            ACCESS_TOKEN_KEY,
        )
    );
  },

  getRefreshToken():
      string | null {
    if (!canUseStorage()) {
      return null;
    }

    return (
        getValueFromStorage(
            window.localStorage,
            REFRESH_TOKEN_KEY,
        ) ??
        getValueFromStorage(
            window.sessionStorage,
            REFRESH_TOKEN_KEY,
        )
    );
  },

  isRemembered(): boolean {
    return getRememberMeFlag();
  },

  setRemembered(
      rememberMe: boolean,
  ): void {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(
        REMEMBER_ME_KEY,
        String(rememberMe),
    );
  },

  setAccessToken(
      accessToken: string,
  ): void {
    const storage =
        getCurrentSessionStorage();

    if (!storage) {
      return;
    }

    removeKeyFromBothStorages(
        ACCESS_TOKEN_KEY,
    );

    setValue(
        storage,
        ACCESS_TOKEN_KEY,
        accessToken,
    );
  },

  setRefreshToken(
      refreshToken: string,
  ): void {
    const storage =
        getCurrentSessionStorage();

    if (!storage) {
      return;
    }

    removeKeyFromBothStorages(
        REFRESH_TOKEN_KEY,
    );

    setValue(
        storage,
        REFRESH_TOKEN_KEY,
        refreshToken,
    );
  },

  setTokens(
      accessToken: string,
      refreshToken: string,
      rememberMe = false,
  ): void {
    if (!canUseStorage()) {
      return;
    }

    removeKeyFromBothStorages(
        ACCESS_TOKEN_KEY,
    );

    removeKeyFromBothStorages(
        REFRESH_TOKEN_KEY,
    );

    this.setRemembered(
        rememberMe,
    );

    const storage = rememberMe
        ? window.localStorage
        : window.sessionStorage;

    setValue(
        storage,
        ACCESS_TOKEN_KEY,
        accessToken,
    );

    setValue(
        storage,
        REFRESH_TOKEN_KEY,
        refreshToken,
    );
  },

  clearAccessToken(): void {
    removeKeyFromBothStorages(
        ACCESS_TOKEN_KEY,
    );
  },

  clearRefreshToken(): void {
    removeKeyFromBothStorages(
        REFRESH_TOKEN_KEY,
    );
  },

  clear(): void {
    if (!canUseStorage()) {
      return;
    }

    removeKeyFromBothStorages(
        ACCESS_TOKEN_KEY,
    );

    removeKeyFromBothStorages(
        REFRESH_TOKEN_KEY,
    );

    removeKeyFromBothStorages(
        LEGACY_ACCESS_TOKEN_KEY,
    );

    removeKeyFromBothStorages(
        LEGACY_REFRESH_TOKEN_KEY,
    );

    window.localStorage.removeItem(
        REMEMBER_ME_KEY,
    );
  },

  migrateLegacyTokens(): void {
    if (!canUseStorage()) {
      return;
    }

    const currentAccessToken =
        this.getAccessToken();

    const currentRefreshToken =
        this.getRefreshToken();

    const legacyAccessToken =
        getValueFromStorage(
            window.localStorage,
            LEGACY_ACCESS_TOKEN_KEY,
        ) ??
        getValueFromStorage(
            window.sessionStorage,
            LEGACY_ACCESS_TOKEN_KEY,
        );

    const legacyRefreshToken =
        getValueFromStorage(
            window.localStorage,
            LEGACY_REFRESH_TOKEN_KEY,
        ) ??
        getValueFromStorage(
            window.sessionStorage,
            LEGACY_REFRESH_TOKEN_KEY,
        );

    if (
        !currentAccessToken &&
        !currentRefreshToken &&
        legacyAccessToken &&
        legacyRefreshToken
    ) {
      /*
       * Token cũ nằm trong localStorage,
       * xem như phiên Remember Me.
       */
      this.setTokens(
          legacyAccessToken,
          legacyRefreshToken,
          true,
      );
    }

    removeKeyFromBothStorages(
        LEGACY_ACCESS_TOKEN_KEY,
    );

    removeKeyFromBothStorages(
        LEGACY_REFRESH_TOKEN_KEY,
    );
  },
};

tokenStorage.migrateLegacyTokens();