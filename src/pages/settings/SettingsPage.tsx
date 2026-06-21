import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Globe, Bell, Moon, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="pb-10">
      <PageHeader title="Cài đặt hệ thống" description="Quản lý tùy chọn ngôn ngữ, giao diện và tài khoản của bạn" />
      
      <div className="mt-6 space-y-6 max-w-4xl">
        <Card className="p-6 transition-shadow hover:shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-fit-primary" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Ngôn ngữ & Khu vực</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Ngôn ngữ hiển thị</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all font-medium text-slate-700 bg-slate-50">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Múi giờ</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all font-medium text-slate-700 bg-slate-50">
                <option value="GMT+7">Giờ Đông Dương (GMT+7)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Moon className="h-6 w-6 text-fit-primary" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Chủ đề giao diện</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="flex-1 min-w-[120px] py-3 rounded-xl border-2 border-fit-primary bg-fit-primarySoft text-fit-primary font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Sáng (Light)</button>
            <button className="flex-1 min-w-[120px] py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-900 hover:text-white transition-all hover:scale-105 active:scale-95">Tối (Dark)</button>
            <button className="flex-1 min-w-[120px] py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all hover:scale-105 active:scale-95">Theo hệ thống</button>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-fit-primary" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tùy chọn thông báo</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-base">Thông báo qua Email</p>
                <p className="text-sm font-medium text-slate-500 mt-1">Nhận lịch tập và các cập nhật mới nhất từ FitLife.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fit-primary"></div>
              </label>
            </div>
            
            <div className="w-full h-px bg-slate-100" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-base">Thông báo qua SMS</p>
                <p className="text-sm font-medium text-slate-500 mt-1">Nhận mã OTP và nhắc nhở lịch tập qua điện thoại.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fit-primary"></div>
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-lg border-rose-100 bg-rose-50/30">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Phát triển & Bảo mật</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-600">Bật các tính năng thử nghiệm đang trong quá trình phát triển (Beta).</p>
            <button className="py-2.5 px-5 rounded-xl border border-rose-200 bg-white text-rose-600 font-bold hover:bg-rose-50 transition-colors shadow-sm active:scale-95">Chương trình FitLife Beta</button>
          </div>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-end max-w-4xl">
        <Button className="px-8 h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">Lưu tất cả thay đổi</Button>
      </div>
    </div>
  );
}
