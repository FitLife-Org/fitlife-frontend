import { useEffect, useState } from "react";
import { Users, Search, Activity, UserCircle2, Salad, Dumbbell, Clock, Check, X, BellRing, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { trainerService } from "../../services/trainerService";
import type { TrainerMember, TrainerAssignmentRequest } from "../../types/trainer.type";
import { showAlert } from "../../utils/alert";
import { getApiErrorMessage } from "../../utils/apiError";

export default function MyMembersPage() {
  const [activeTab, setActiveTab] = useState<"active" | "requests">("active");
  const [members, setMembers] = useState<TrainerMember[]>([]);
  const [requests, setRequests] = useState<TrainerAssignmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isAccepting, setIsAccepting] = useState(true);
  const [statusToggling, setStatusToggling] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchRequests();
    fetchAcceptingStatus();
  }, []);

  const fetchAcceptingStatus = async () => {
    try {
      const status = await trainerService.getMyAcceptingStatus();
      setIsAccepting(status);
    } catch (e) {
      console.error("Lỗi khi tải trạng thái nhận học viên:", e);
    }
  };

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

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const data = await trainerService.getTrainerRequests();
      setRequests(data);
    } catch (error) {
      console.error("Lỗi khi tải yêu cầu:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApprove = async (request: TrainerAssignmentRequest) => {
    const isNew = request.requestType === "NEW_ASSIGNMENT";
    const title = isNew ? "Xác nhận nhận Hội viên" : "Xác nhận đồng ý hủy";
    const message = isNew
      ? `Bạn có chắc muốn đồng ý trở thành Huấn luyện viên cho hội viên ${request.fullName}?`
      : `Bạn có chắc muốn đồng ý kết thúc đồng hành cùng hội viên ${request.fullName}? Hội viên sẽ được giải phóng để chọn HLV mới.`;

    const result = await showAlert.confirm(title, message);
    if (result.isConfirmed) {
      try {
        setProcessingId(request.assignmentId);
        await trainerService.approveTrainerRequest(request.assignmentId);
        void showAlert.success(
          "Thành công!",
          isNew ? `Đã nhận hội viên ${request.fullName} thành công!` : `Đã xác nhận hủy cho hội viên ${request.fullName}.`
        );
        await Promise.all([fetchRequests(), fetchMembers()]);
      } catch (error) {
        void showAlert.error("Lỗi khi duyệt yêu cầu", getApiErrorMessage(error));
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async (request: TrainerAssignmentRequest) => {
    const isNew = request.requestType === "NEW_ASSIGNMENT";
    const title = isNew ? "Từ chối yêu cầu" : "Từ chối yêu cầu hủy";
    const message = isNew
      ? `Bạn có chắc muốn từ chối yêu cầu nhận HLV của hội viên ${request.fullName}?`
      : `Bạn có chắc muốn từ chối yêu cầu hủy của hội viên ${request.fullName}?`;

    const result = await showAlert.confirm(title, message);
    if (result.isConfirmed) {
      try {
        setProcessingId(request.assignmentId);
        await trainerService.rejectTrainerRequest(request.assignmentId);
        void showAlert.success("Đã từ chối yêu cầu!", "");
        await Promise.all([fetchRequests(), fetchMembers()]);
      } catch (error) {
        void showAlert.error("Lỗi khi từ chối yêu cầu", getApiErrorMessage(error));
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleToggleAccepting = async () => {
    const result = await showAlert.confirm(
      isAccepting ? "Xác nhận ngưng nhận học viên mới?" : "Xác nhận mở nhận học viên mới?",
      isAccepting
        ? "Khi ngưng nhận học viên, các hội viên khác sẽ thấy thông báo bạn đã kích hoạt ngưng nhận và không thể gửi yêu cầu chọn bạn làm HLV."
        : "Hệ thống sẽ mở lại trạng thái để các hội viên có thể gửi yêu cầu chọn bạn làm HLV."
    );

    if (result.isConfirmed) {
      try {
        setStatusToggling(true);
        const newStatus = await trainerService.toggleMyAcceptingStatus();
        setIsAccepting(newStatus);
        void showAlert.success(
          "Cập nhật thành công!",
          newStatus ? "Bạn đã mở nhận học viên mới." : "Bạn đã kích hoạt ngưng nhận học viên mới."
        );
      } catch (error) {
        void showAlert.error("Lỗi khi cập nhật trạng thái", getApiErrorMessage(error));
      } finally {
        setStatusToggling(false);
      }
    }
  };

  const filteredMembers = members.filter(m => 
    (m.fullName || "").toLowerCase().includes(search.toLowerCase()) || 
    (m.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter(r =>
    (r.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.phone || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.memberCode || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-gradient-to-r from-fit-primary/10 to-blue-600/10 rounded-2xl border border-fit-primary/20 shadow-sm backdrop-blur-sm gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fit-primary to-blue-600">
              Hội viên của tôi
            </h2>
            {/* Badge trạng thái nhận học viên */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
              isAccepting
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
                : "bg-rose-50 text-rose-800 border-rose-300 shadow-sm"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isAccepting ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              {isAccepting ? "Đang nhận học viên mới" : "Đã ngưng nhận học viên"}
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Quản lý hội viên đang huấn luyện và phê duyệt yêu cầu từ hội viên
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleToggleAccepting}
            disabled={statusToggling}
            className={`text-xs px-4 py-2 font-black border rounded-xl transition-all shadow-sm ${
              isAccepting
                ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
                : "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isAccepting ? "🛑 Ngưng nhận học viên mới" : "🟢 Mở nhận học viên mới"}
          </Button>

          <div className="w-full sm:w-64">
            <Input 
              icon={<Search className="w-5 h-5 text-slate-400" />}
              placeholder="Tìm kiếm theo tên, mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === "active"
              ? "text-fit-primary border-b-2 border-fit-primary"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Hội viên đang phụ trách ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === "requests"
              ? "text-fit-primary border-b-2 border-fit-primary"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Yêu cầu từ hội viên</span>
          {requests.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-black bg-rose-500 text-white rounded-full">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Active Members */}
      {activeTab === "active" && (
        loading ? (
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
                          style={{ width: `${Math.min(100, (member.sessionsCompleted / (member.sessionsTotal || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <button className="flex-[2] flex items-center justify-center gap-2 py-2 text-sm font-semibold text-fit-primary bg-fit-primary/10 rounded-lg hover:bg-fit-primary hover:text-white transition-colors duration-300">
                      <Activity className="w-4 h-4" />
                      Tiến độ
                    </button>
                    <Link to={`/trainer/members/${member.id}/workouts`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-600 hover:text-white transition-colors duration-300" title="Lịch tập">
                        <Dumbbell className="w-4 h-4" />
                        Lịch tập
                      </button>
                    </Link>
                    <Link to={`/trainer/members/${member.id}/nutrition`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-300" title="Dinh dưỡng">
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
        )
      )}

      {/* Tab 2: Requests */}
      {activeTab === "requests" && (
        requestsLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-fit-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map(req => {
              const isNew = req.requestType === "NEW_ASSIGNMENT";
              const isProcessing = processingId === req.assignmentId;

              return (
                <Card key={req.assignmentId} className={`relative overflow-hidden border-2 transition-all ${
                  isNew ? "border-amber-200 bg-amber-50/20" : "border-rose-200 bg-rose-50/20"
                }`}>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {req.avatarUrl ? (
                          <img src={req.avatarUrl} alt={req.fullName} className="w-12 h-12 rounded-full object-cover shadow" />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            isNew ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                          }`}>
                            <UserCircle2 className="w-8 h-8" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{req.fullName}</h3>
                          <span className="text-xs text-slate-500 font-medium">Mã HV: {req.memberCode || `#${req.memberId}`}</span>
                        </div>
                      </div>

                      <Badge variant={isNew ? "warning" : "danger"} className="font-bold">
                        {isNew ? "Xin nhận HLV" : "Yêu cầu hủy"}
                      </Badge>
                    </div>

                    <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-medium">Gói tập:</span>
                        <span className="font-bold text-slate-900">{req.packageName}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-medium flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> SĐT:</span>
                        <span className="font-bold text-slate-900">{req.phone || "Chưa có"}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày gửi:</span>
                        <span className="font-medium text-slate-700">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        onClick={() => handleApprove(req)}
                        disabled={isProcessing}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold ${
                          isNew 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                            : "bg-orange-600 hover:bg-orange-700 text-white"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {isNew ? "Chấp nhận" : "Đồng ý hủy"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleReject(req)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        <X className="w-4 h-4 text-rose-500" />
                        {isNew ? "Từ chối" : "Từ chối hủy"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredRequests.length === 0 && (
              <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Hiện không có yêu cầu nào đang chờ xử lý.</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
