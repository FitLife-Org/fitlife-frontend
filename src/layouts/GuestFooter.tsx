import { Link } from "react-router-dom";
import { HeartPulse, Mail, MapPin, Phone, Facebook, Youtube } from "lucide-react";

export default function GuestFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="w-30">
              <img
                  src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                  alt="Logo"></img>
            </div>
            <div className="flex flex-col">
                 <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                   FitLife
                 </span>
              <span className="text-[10px] text-slate-500 font-medium">Sống khỏe mỗi ngày</span>
            </div>

          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            Phần mềm quản lý phòng gym thông minh giúp bạn vận hành hiệu quả và tăng trưởng bền vững.
          </p>
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} FitLife. Tất cả quyền được bảo lưu.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Sản phẩm</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#features" className="hover:text-fit-primary transition-colors">Tính năng</a></li>
              <li><a href="#pricing" className="hover:text-fit-primary transition-colors">Gói tập</a></li>
              <li><a href="#ai" className="hover:text-fit-primary transition-colors">AI Assistant</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Công ty</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#about" className="hover:text-fit-primary transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-fit-primary transition-colors">Tin tức</a></li>
              <li><a href="#" className="hover:text-fit-primary transition-colors">Tuyển dụng</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Hỗ trợ</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#" className="hover:text-fit-primary transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-fit-primary transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-fit-primary transition-colors">Điều khoản sử dụng</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-fit-primary" />
              <span>0965 123 456</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-fit-primary" />
              <span>hello@fitlife.vn</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-fit-primary" />
              <span>Tòa nhà FitLife, 123 Nguyễn Trãi, Q.1, TP.HCM</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-sm font-semibold text-slate-900 mr-2">Kết nối với chúng tôi</div>
             <a href="#" className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-fit-primary hover:text-white transition-colors">
               <Facebook className="h-4 w-4" />
             </a>
             <a href="#" className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-fit-primary hover:text-white transition-colors">
               <Youtube className="h-4 w-4" />
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
