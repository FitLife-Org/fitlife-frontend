import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface SettingsState {
  language: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  emailNotification: boolean;
  smsNotification: boolean;
  betaFeatures: boolean;
}

const SETTINGS_KEY = "fitlife_user_settings";

const DEFAULT_SETTINGS: SettingsState = {
  language: "vi",
  timezone: "GMT+7",
  theme: "light",
  emailNotification: true,
  smsNotification: false,
  betaFeatures: false,
};

export function useSettingsLogic() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to persist settings", e);
    }
  }, [settings]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveAllSettings = async () => {
    setSaving(true);
    await new Promise((res) => setTimeout(res, 400));
    setSaving(false);
    toast.success("Đã lưu tất cả thay đổi cài đặt hệ thống!");
  };

  return {
    settings,
    saving,
    updateSetting,
    saveAllSettings,
  };
}
