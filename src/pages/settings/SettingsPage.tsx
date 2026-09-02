import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Globe, Bell, Moon, Shield, Save, Check } from "lucide-react";
import { useSettingsLogic } from "../../utils/validators/useSettingsLogic";

export default function SettingsPage() {
  const { settings, saving, updateSetting, saveAllSettings } = useSettingsLogic();

  return (
    <div className="pb-10 space-y-6 max-w-4xl">
      <PageHeader 
        title="Cài đặt hệ thống" 
        description="Quản lý tùy chọn ngôn ngữ, giao diện, thông báo và bảo mật tài khoản" 
      />
      
      <div className="space-y-6">
        {/* Ngôn ngữ & Khu vực */}
        <Card className="p-6 transition-all hover:shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-fit-primarySoft text-fit-primary flex items-center justify-center font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Ngôn ngữ & Khu vực</h2>
              <p className="text-xs text-fit-muted">Tùy chỉnh định dạng quốc gia và múi giờ hiển thị</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Ngôn ngữ hiển thị
              </label>
              <select 
                value={settings.language}
                onChange={(e) => updateSetting("language", e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-fit-border outline-none focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all font-semibold text-slate-800 bg-slate-50"
              >
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Múi giờ
              </label>
              <select 
                value={settings.timezone}
                onChange={(e) => updateSetting("timezone", e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-fit-border outline-none focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all font-semibold text-slate-800 bg-slate-50"
              >
                <option value="GMT+7">Giờ Đông Dương (GMT+7)</option>
                <option value="UTC">Giờ Quốc tế (UTC)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Chủ đề giao diện */}
        <Card className="p-6 transition-all hover:shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-fit-primarySoft text-fit-primary flex items-center justify-center font-bold">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Chủ đề giao diện</h2>
              <p className="text-xs text-fit-muted">Chọn chế độ màu sắc hiển thị hệ thống</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              type="button"
              onClick={() => updateSetting("theme", "light")}
              className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-2xl font-bold transition-all ${
                settings.theme === "light" 
                  ? "border-2 border-fit-primary bg-fit-primarySoft text-fit-primary shadow-sm" 
                  : "border border-fit-border text-slate-600 hover:bg-slate-50"
              }`}
            >
              ☀️ Sáng (Light)
            </button>
            <button 
              type="button"
              onClick={() => updateSetting("theme", "dark")}
              className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-2xl font-bold transition-all ${
                settings.theme === "dark" 
                  ? "border-2 border-slate-900 bg-slate-900 text-white shadow-sm" 
                  : "border border-fit-border text-slate-600 hover:bg-slate-50"
              }`}
            >
              🌙 Tối (Dark)
            </button>
            <button 
              type="button"
              onClick={() => updateSetting("theme", "system")}
              className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-2xl font-bold transition-all ${
                settings.theme === "system" 
                  ? "border-2 border-fit-primary bg-slate-100 text-slate-900 shadow-sm" 
                  : "border border-fit-border text-slate-600 hover:bg-slate-50"
              }`}
            >
              💻 Theo hệ thống
            </button>
          </div>
        </Card>

        {/* Tùy chọn thông báo */}
        <Card className="p-6 transition-all hover:shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-fit-primarySoft text-fit-primary flex items-center justify-center font-bold">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Tùy chọn thông báo</h2>
              <p className="text-xs text-fit-muted">Quản lý nhận nhắc nhở lịch tập và tin tức</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-base">Thông báo qua Email</p>
                <p className="text-xs text-fit-muted mt-1">Nhận nhắc lịch tập và cập nhật hóa đơn thanh toán qua email.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotification} 
                  onChange={(e) => updateSetting("emailNotification", e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fit-primary"></div>
              </label>
            </div>
            
            <div className="w-full h-px bg-slate-100" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-base">Thông báo qua SMS</p>
                <p className="text-xs text-fit-muted mt-1">Nhận mã OTP và nhắc nhở lịch tập qua tin nhắn điện thoại.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.smsNotification} 
                  onChange={(e) => updateSetting("smsNotification", e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fit-primary"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Bảo mật & Tính năng thử nghiệm */}
        <Card className="p-6 transition-all hover:shadow-card border-fit-dangerSoft bg-fit-dangerSoft/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-fit-dangerSoft text-fit-danger flex items-center justify-center font-bold">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Tính năng nâng cao & Beta</h2>
              <p className="text-xs text-fit-muted">Trải nghiệm các tính năng thử nghiệm của FitLife AI Engine</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-bold text-slate-800 text-sm">Chương trình FitLife Beta</p>
              <p className="text-xs text-slate-500 mt-0.5">Bật cập nhật trải nghiệm giao diện và AI mới nhất trước khi phát hành.</p>
            </div>
            <button 
              type="button"
              onClick={() => updateSetting("betaFeatures", !settings.betaFeatures)}
              className={`py-2 px-4 rounded-xl font-bold text-xs transition-all ${
                settings.betaFeatures 
                  ? "bg-fit-danger text-white shadow-sm" 
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {settings.betaFeatures ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Đã tham gia</span> : "Tham gia Beta"}
            </button>
          </div>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={saveAllSettings}
          disabled={saving}
          className="px-8 h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
        </Button>
      </div>
    </div>
  );
}
