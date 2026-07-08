import { useState } from "react";
import { Package, Clock } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import GymPackageTab from "./components/GymPackageTab";
import PackageDurationTab from "./components/PackageDurationTab";

export default function PackageManagementPage() {
  const [activeTab, setActiveTab] = useState<"packages" | "durations">("packages");

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Cấu hình Gói tập & Thời hạn" 
        description="Quản lý thông tin gói tập Gym và cấu hình thời hạn chung (1 tháng, 3 tháng...)" 
      />

      {/* Tabs */}
      <div className="relative flex space-x-2 bg-slate-900/5 p-1.5 rounded-2xl w-fit border border-white/40 shadow-sm backdrop-blur-md">
        <button
          onClick={() => setActiveTab("packages")}
          className={`relative flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === "packages"
              ? "bg-gradient-to-r from-fit-primary to-blue-600 text-white shadow-lg shadow-fit-primary/30 scale-[1.02]"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Package className={`w-5 h-5 ${activeTab === 'packages' ? 'animate-bounce' : ''}`} />
          Danh sách Gói tập
        </button>
        <button
          onClick={() => setActiveTab("durations")}
          className={`relative flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === "durations"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Clock className={`w-5 h-5 ${activeTab === 'durations' ? 'animate-pulse' : ''}`} />
          Thời hạn Gói tập
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "packages" ? <GymPackageTab /> : <PackageDurationTab />}
      </div>
    </div>
  );
}
