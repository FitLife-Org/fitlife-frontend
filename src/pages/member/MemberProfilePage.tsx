import { 
  Camera, User, Calendar, Activity, Lock, ChevronRight, CheckCircle2, 
  Image as ImageIcon, Edit3, ShieldCheck, Info as InfoIcon, Crown, Ruler, Weight 
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";

export default function MemberProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Hồ sơ cá nhân" 
        description="Quản lý thông tin tài khoản, sức khỏe và mục tiêu tập luyện" 
      />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr] items-start">
        {/* Left Column: Profile Card */}
        <Card className="p-6">
          <div className="relative mx-auto h-32 w-32">
            <div className="h-full w-full overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100">
              <img 
                src="https://i.pravatar.cc/150?u=minh" 
                alt="Avatar" 
                className="h-full w-full object-cover" 
              />
            </div>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Minh Nguyễn</h2>
            <div className="mt-2 flex justify-center">
              <Badge variant="success">
                <span className="flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" /> Thành viên Premium
                </span>
              </Badge>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" /> Tuổi
              </span>
              <span className="font-medium text-slate-900">28</span>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="flex items-center gap-2 text-slate-500">
                <Ruler className="h-4 w-4" /> Chiều cao
              </span>
              <span className="font-medium text-slate-900">175 cm</span>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="flex items-center gap-2 text-slate-500">
                <Weight className="h-4 w-4" /> Cân nặng
              </span>
              <span className="font-medium text-slate-900">68 kg</span>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" /> Thành viên từ
              </span>
              <span className="font-medium text-slate-900">01/06/2025</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button variant="outline" className="w-full justify-center text-slate-700">
              <ImageIcon className="h-4 w-4 mr-1" /> Đổi ảnh
            </Button>
            <Button className="w-full justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500">
              <Edit3 className="h-4 w-4 mr-1" /> Chỉnh sửa hồ sơ
            </Button>
          </div>
        </Card>

        {/* Right Column: Information Forms */}
        <div className="space-y-6">
          {/* Thông tin cá nhân */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 text-emerald-600">
              <User className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="Họ và tên" defaultValue="Minh Nguyễn" />
              <Input label="Ngày sinh" icon={<Calendar className="h-4 w-4" />} defaultValue="12/06/1996" />
              <Input label="Email" defaultValue="minh.nguyen@gmail.com" />
              
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Giới tính</span>
                <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <User className="mr-3 h-4 w-4 text-blue-500" />
                  <select className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none">
                    <option>Nam</option>
                    <option>Nữ</option>
                  </select>
                </div>
              </label>
              
              <Input label="Số điện thoại" defaultValue="0987 654 321" />
            </div>
          </Card>

          {/* Thông tin sức khỏe */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 text-emerald-600">
              <Activity className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-900">Thông tin sức khỏe</h2>
            </div>
            
            <div className="mb-6 grid gap-6 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Chiều cao</span>
                <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <input className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none" defaultValue="175" />
                  <span className="text-sm text-slate-500">cm</span>
                </div>
              </label>
              
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Cân nặng</span>
                <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <input className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none" defaultValue="68" />
                  <span className="text-sm text-slate-500">kg</span>
                </div>
              </label>
              
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Mục tiêu</span>
                <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <select className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none">
                    <option>Giảm cân</option>
                    <option>Tăng cơ</option>
                  </select>
                </div>
              </label>
            </div>
            
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Mức độ vận động <InfoIcon className="inline h-3 w-3 text-slate-400"/>
              </span>
              <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <select className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none">
                  <option>Vận động vừa phải (3-5 buổi/tuần)</option>
                  <option>Ít vận động</option>
                  <option>Vận động nhiều (6-7 buổi/tuần)</option>
                </select>
              </div>
            </label>
          </Card>

          {/* Bảo mật tài khoản & Thông báo */}
          <Card className="p-6">
            <div className="grid gap-10 md:grid-cols-2">
              {/* Left: Bảo mật */}
              <div>
                <div className="mb-6 flex items-center gap-2 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                  <h2 className="text-lg font-bold text-slate-900">Bảo mật tài khoản</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Đổi mật khẩu</p>
                        <p className="text-xl leading-none tracking-[0.2em] text-slate-400">••••••••</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                  
                  <div className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.076 7.076 0 01-6.725-4.962L1.248 17.24C3.208 21.2 7.282 24 12 24c2.923 0 5.377-1.054 7.185-2.822l-3.145-3.165z"/>
                        <path fill="#4A90E2" d="M23.989 12.276c0-.81-.073-1.589-.208-2.333H12v4.61h6.716c-.29 1.498-1.123 2.768-2.362 3.61l3.146 3.165C21.343 19.62 23.989 16.335 23.989 12.276z"/>
                        <path fill="#FBBC05" d="M5.275 14.128A7.067 7.067 0 014.922 12c0-.735.13-1.444.353-2.115L1.24 6.65C.448 8.243 0 10.05 0 12c0 1.95.448 3.757 1.24 5.35l4.035-3.222z"/>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Liên kết Google</p>
                        <p className="flex items-center gap-1 text-sm text-emerald-600">Đã liên kết</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </div>
              
              {/* Right: Thông báo */}
              <div>
                <div className="hidden h-7 md:block mb-6"></div> 
                
                <div className="space-y-6 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">Thông báo qua email</p>
                      <p className="text-sm text-slate-500">Nhận thông báo về lịch tập, ưu đãi</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-emerald-500 transition-colors">
                      <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                    </div>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">Nhắc nhở tập luyện</p>
                      <p className="text-sm text-slate-500">Nhận nhắc nhở theo lịch tập cá nhân</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-emerald-500 transition-colors">
                      <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button className="w-full sm:w-auto min-w-[140px]">Lưu thay đổi</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
