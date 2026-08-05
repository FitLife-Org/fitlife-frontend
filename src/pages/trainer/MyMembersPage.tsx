import { useEffect, useState } from "react";
import { Users, Search, Activity, UserCircle2, Salad } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import { trainerService } from "../../services/trainerService";
import type { TrainerMember } from "../../types/trainer.type";

export default function MyMembersPage() {
  const [members, setMembers] = useState<TrainerMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await trainerService.getMyMembers();
        setMembers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    (m.fullName || "").toLowerCase().includes(search.toLowerCase()) || 
    (m.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-fit-primary/10 to-blue-600/10 rounded-2xl border border-fit-primary/20 shadow-sm backdrop-blur-sm">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fit-primary to-blue-600">Hội viên của tôi</h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">Danh sách các hội viên bạn đang phụ trách huấn luyện</p>
        </div>
        <div className="w-full sm:w-72">
          <Input 
            icon={<Search className="w-5 h-5 text-slate-400" />}
            placeholder="Tìm kiếm theo tên hoặc SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-fit-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <Card key={member.id} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fit-primary to-blue-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.fullName} className="w-12 h-12 rounded-full object-cover shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shadow-sm">
                        <UserCircle2 className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{member.fullName}</h3>
                      <p className="text-sm text-slate-500">{member.phone || "Chưa có SĐT"}</p>
                    </div>
                  </div>
                  <Badge variant={member.status === "ACTIVE" ? "success" : "danger"}>
                    {member.status === "ACTIVE" ? "Đang tập" : "Tạm nghỉ"}
                  </Badge>
                </div>
                
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Gói tập:</span>
                    <span className="font-bold text-slate-700">{member.packageName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Ngày tham gia:</span>
                    <span className="font-bold text-slate-700">{member.joinDate}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500 font-medium">Tiến độ PT:</span>
                      <span className="font-bold text-fit-primary">{member.sessionsCompleted} / {member.sessionsTotal} buổi</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-fit-primary to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (member.sessionsCompleted / member.sessionsTotal) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <button className="flex-[2] flex items-center justify-center gap-2 py-2 text-sm font-semibold text-fit-primary bg-fit-primary/10 rounded-lg hover:bg-fit-primary hover:text-white transition-colors duration-300">
                    <Activity className="w-4 h-4" />
                    Tiến độ
                  </button>
                  <Link to={`/trainer/members/${member.id}/nutrition`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-300">
                      <Salad className="w-4 h-4" />
                      Dinh dưỡng
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Không tìm thấy hội viên nào khớp với tìm kiếm.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
