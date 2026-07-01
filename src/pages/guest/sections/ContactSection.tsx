import { useState } from "react";
import { motion } from "framer-motion";
import { Send, PhoneCall, Mail, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { publicService } from "../../../services/publicService";
import type { ContactRequestForm } from "../../../types/public.type";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactRequestForm>({
    fullName: "",
    phoneNumber: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber) {
      toast.error("Vui lòng nhập tên và số điện thoại.");
      return;
    }
    
    setLoading(true);
    try {
      await publicService.submitContactRequest(formData);
      toast.success("Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm nhất.");
      setFormData({ fullName: "", phoneNumber: "", email: "", message: "" });
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="contact">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Sẵn sàng thay đổi<br />cùng FitLife?</h2>
              <p className="text-lg text-slate-500">
                Để lại thông tin và nhận ngay lịch hẹn tư vấn miễn phí cùng đo chỉ số cơ thể InBody trị giá 500.000đ.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <PhoneCall className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Hotline</p>
                  <p className="text-xl font-black text-slate-900">1900 1234</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Email</p>
                  <p className="text-lg font-bold text-slate-900">hello@fitlife.vn</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Địa chỉ</p>
                  <p className="text-lg font-bold text-slate-900">123 Đường Tôn Đức Thắng, Q1, TP.HCM</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-slate-100"
          >
            <h3 className="text-2xl font-black text-slate-900 mb-6">Gửi yêu cầu tư vấn</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Họ và tên *"
                placeholder="Nhập họ và tên của bạn"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Số điện thoại *"
                  placeholder="09xx xxx xxx"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                />
                <Input
                  label="Email (không bắt buộc)"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mục tiêu của bạn</label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="Bạn muốn giảm cân, tăng cơ hay cải thiện sức khỏe?"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full rounded-full py-4 text-lg font-bold flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : (
                  <>Gửi yêu cầu ngay <Send className="w-5 h-5" /></>
                )}
              </Button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
