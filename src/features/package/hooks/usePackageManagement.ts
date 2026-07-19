import { useState } from "react";

export function usePackageManagement() {
  const [activeTab, setActiveTab] = useState<"packages" | "durations">("packages");

  return {
    activeTab,
    setActiveTab
  };
}
