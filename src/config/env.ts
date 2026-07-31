type AppEnvironment = {
  apiBaseUrl: string;
  googleClientId: string;
  isDevelopment: boolean;
  isProduction: boolean;
};

function requireEnvironmentValue(
    value: string | undefined,
    variableName: string,
): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(
        `Thiếu biến môi trường ${variableName}.`,
    );
  }

  return normalizedValue;
}

function normalizeApiBaseUrl(
    value: string,
): string {
  return value.replace(/\/+$/, "");
}

const rawApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL;

export const env: AppEnvironment = {
  apiBaseUrl: normalizeApiBaseUrl(
      requireEnvironmentValue(
          rawApiBaseUrl,
          "VITE_API_BASE_URL",
      ),
  ),

  googleClientId:
      import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ??
      "",

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};