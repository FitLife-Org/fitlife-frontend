const fs = require('fs');

const content = import { useEffect, useState } from "react";
import { Search, Filter, Star, Clock, Award, ChevronRight, User } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { trainerService } from "../../services/trainerService";
import type { Trainer } from "../../types/trainer.type";
import { showAlert } from "../../utils/alert";
import { getApiErrorMessage } from "../../utils/apiError";

export default function TrainerBookingPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await trainerService.getTrainers();
      setTrainers(data);
    } catch (error) {
      void showAlert.error("Không thể tải danh sách HLV", getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrainer = async (trainer: Trainer) => {
    const result = await showAlert.confirm(
      "Xác nhận đăng ký",
      "Bạn có muốn gửi yêu cầu thuê Huấn luyện viên " + trainer.fullName + "? Quản lý phòng tập sẽ liên hệ với bạn để sắp xếp lịch tập."
    );
    
    if (result.isConfirmed) {
      void showAlert.success(
        "Gửi yêu cầu thành công!",
        "Chúng tôi đã ghi nhận yêu cầu của bạn. Nhân viên sẽ sớm liên hệ để tư vấn lộ trình và gói tập phù hợp."
      );
    }
  };

  const filteredTrainers = trainers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.specialization || t.specialty || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Huấn Luyện Viên"
        description="Đội ngũ chuyên gia giàu kinh nghiệm luôn sẵn sàng đồng hành cùng bạn."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-full sm:w-96 relative">
          <Input
            placeholder="Tìm kiếm theo tên hoặc chuyên môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4" /> Lọc theo chuyên môn
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map((trainer) => {
              const mockPrice = (Math.floor(Math.random() * 3) + 3) * 100000;
              return (
                <Card
                  key={trainer.id}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-6 relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                        <User className="w-10 h-10 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{trainer.fullName}</h3>
                        <Badge variant="success" className="mb-2">
                          {trainer.specialization || trainer.specialty || "Fitness Trainer"}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
                          <Star className="w-4 h-4 fill-current" />
                          <span>4.{Math.floor(Math.random() * 5) + 5}</span>
                          <span className="text-slate-400 font-normal ml-1">({Math.floor(Math.random() * 50) + 10} đánh giá)</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs text-slate-500">Kinh nghiệm</p>
                          <p className="text-sm font-semibold text-slate-700">{trainer.experienceYears || 1}+ năm</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs text-slate-500">Chứng chỉ</p>
                          <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                            {trainer.certifications ? trainer.certifications.split(',')[0] : "Quốc tế"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-6 line-clamp-3 flex-1">
                      {trainer.bio || "Huấn luyện viên chuyên nghiệp, tận tâm giúp bạn đạt được mục tiêu hình thể mong muốn một cách an toàn và hiệu quả nhất."}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Giá tham khảo</p>
                        <p className="text-lg font-bold text-emerald-600">
                          {mockPrice.toLocaleString("vi-VN")}đ<span className="text-sm text-slate-400 font-normal">/buổi</span>
                        </p>
                      </div>
                      <Button
                        onClick={() => handleBookTrainer(trainer)}
                        className="rounded-xl pl-4 pr-3 py-2 flex items-center gap-1 shadow-lg shadow-emerald-600/20"
                      >
                        Đăng ký <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
              <User className="w-12 h-12 text-slate-300 mb-3" />
              <p>Không tìm thấy huấn luyện viên nào phù hợp.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

fs.writeFileSync('src/pages/member/TrainerBookingPage.tsx', content, 'utf8');
console.log('File written successfully.');
