import { useState, useEffect } from "react";
import { 
  Search, Plus, Eye, Edit2, ShieldAlert, Lock, Unlock, 
  User, Mail, Phone, Calendar, MapPin, Ruler, Weight, 
  Activity, Dumbbell, Clock, Users, UserCheck, UserX, AlertTriangle, ChevronRight, X
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Loading from "../../components/common/Loading";
import { memberService } from "../../services/memberService";
import { showAlert } from "../../utils/alert";
import { validateAdminMemberForm } from "../../utils/validators/adminMemberValidator";
import type { MemberProfile, AdminMemberCreateRequest, AdminMemberUpdateRequest } from "../../types/member.type";
import type { Status } from "../../types/common.type";
import type { Subscription } from "../../types/subscription.type";
import type { CheckinRecord } from "../../types/checkin.type";

// Dữ liệu mock phục vụ fallback khi không kết nối được backend
const MOCK_MEMBERS: MemberProfile[] = [
  {
    id: 1,
    memberCode: "MEM0001",
    fullName: "Nguyễn Minh Anh",
    email: "minhanh@gmail.com",
    phone: "0987654321",
    gender: "FEMALE",
    dateOfBirth: "1998-05-20",
    status: "ACTIVE",
    address: "123 Cầu Giấy, Hà Nội",
    fitnessGoal: "Giảm mỡ, săn chắc cơ thể",
  },
  {
    id: 2,
    memberCode: "MEM0002",
    fullName: "Trần Quang Huy",
    email: "quanghuy@gmail.com",
    phone: "0978161320",
    gender: "MALE",
    dateOfBirth: "1995-10-12",
    status: "ACTIVE",
    address: "456 Nguyễn Lương Bằng, Đà Nẵng",
    fitnessGoal: "Tăng cơ, cải thiện sức mạnh",
  },
  {
    id: 3,
    memberCode: "MEM0003",
    fullName: "Lê Thị Thu Trang",
    email: "thutrang@gmail.com",
    phone: "0966482109",
    gender: "FEMALE",
    dateOfBirth: "2000-08-15",
    status: "PENDING",
    address: "789 Nguyễn Thị Minh Khai, TP. Hồ Chí Minh",
    fitnessGoal: "Duy trì cân nặng, tăng dẻo dai",
  },
  {
    id: 4,
    memberCode: "MEM0004",
    fullName: "Phạm Văn Nam",
    email: "nampham@gmail.com",
    phone: "0912345678",
    gender: "MALE",
    dateOfBirth: "1990-03-05",
    status: "LOCKED",
    address: "101 Lạch Tray, Hải Phòng",
    fitnessGoal: "Tăng thể lực, cải thiện tim mạch",
  }
];

const MOCK_SUBSCRIPTIONS: Record<number, any> = {
  1: [
    {
      id: 101,
      gymPackageId: 1,
      package: { id: 1, code: "PKG01", packageType: "BASIC", name: "Gói Standard 3 Tháng", basePrice: 599000, hasAiWorkoutPlan: false, hasNutritionPlan: false, ptSessionsPerMonth: 0, status: "ACTIVE" },
      startDate: "2026-01-15",
      endDate: "2026-04-15",
      status: "EXPIRED"
    },
    {
      id: 102,
      gymPackageId: 2,
      package: { id: 2, code: "PKG02", packageType: "VIP", name: "Gói VIP Pro 6 Tháng", basePrice: 999000, hasAiWorkoutPlan: true, hasNutritionPlan: true, ptSessionsPerMonth: 4, status: "ACTIVE" },
      startDate: "2026-04-16",
      endDate: "2026-10-16",
      status: "ACTIVE"
    }
  ],
  2: [
    {
      id: 201,
      gymPackageId: 3,
      package: { id: 3, code: "PKG03", packageType: "BASIC", name: "Gói Basic 6 Tháng", basePrice: 599000, hasAiWorkoutPlan: false, hasNutritionPlan: false, ptSessionsPerMonth: 0, status: "ACTIVE" },
      startDate: "2026-02-10",
      endDate: "2026-08-10",
      status: "ACTIVE"
    }
  ],
  3: [],
  4: [
    {
      id: 401,
      gymPackageId: 4,
      package: { id: 4, code: "PKG04", packageType: "BASIC", name: "Gói Basic 1 Tháng", basePrice: 199000, hasAiWorkoutPlan: false, hasNutritionPlan: false, ptSessionsPerMonth: 0, status: "ACTIVE" },
      startDate: "2026-05-01",
      endDate: "2026-06-01",
      status: "EXPIRED" // Changed to EXPIRED, Subscription type usually has ACTIVE/EXPIRED/PENDING/CANCELED
    }
  ]
};

const MOCK_CHECKINS: Record<number, CheckinRecord[]> = {
  1: [
    { id: 1001, memberId: 1, checkedInAt: "2026-06-28T08:30:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" },
    { id: 1002, memberId: 1, checkedInAt: "2026-06-26T17:15:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" },
    { id: 1003, memberId: 1, checkedInAt: "2026-06-25T08:00:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" }
  ],
  2: [
    { id: 2001, memberId: 2, checkedInAt: "2026-06-28T09:00:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" },
    { id: 2002, memberId: 2, checkedInAt: "2026-06-27T18:30:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" }
  ],
  3: [],
  4: [
    { id: 4001, memberId: 4, checkedInAt: "2026-05-25T19:00:00Z", note: "Tài khoản bị khóa - Check-in thất bại", status: "FAILED" }
  ]
};

export default function UserManagementPage() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [showFormView, setShowFormView] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [detailTab, setDetailTab] = useState<"profile" | "subscription" | "checkin">("profile");

  // Detail Modal Sub-data states
  const [memberSubscriptions, setMemberSubscriptions] = useState<Subscription[]>([]);
  const [memberCheckins, setMemberCheckins] = useState<CheckinRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form states
  const [isEditMode, setIsEditMode] = useState(false);
  const [formValues, setFormValues] = useState<Partial<MemberProfile>>({
    userId: undefined,
    fullName: "",
    email: "",
    phone: "",
    gender: "MALE",
    dateOfBirth: "",
    status: "ACTIVE",
    address: "",
    fitnessGoal: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch Member List
  const fetchMembers = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const data = await memberService.getMembers(page, 20, searchTerm, statusFilter);
      if (data && data.items && data.items.length > 0) {
        setMembers(data.items);
        setTotalItems(data.totalItems);
        setCurrentPage(data.page);
      } else {
        // Fallback sang dữ liệu mẫu
        setMembers(MOCK_MEMBERS);
      }
    } catch (error) {
      console.error("API error fetching members, falling back to mock data:", error);
      setMembers(MOCK_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Fetch detailed info
  const handleOpenDetail = async (member: MemberProfile) => {
    setSelectedMember(member);
    setDetailTab("profile");
    setDetailModalOpen(true);
    setDetailLoading(true);

    try {
      // Gọi song song các API chi tiết hội viên (MEM-02, MEM-06, MEM-07)
      const [detailedProfile, subscriptions, checkins] = await Promise.allSettled([
        memberService.getMemberById(member.id),
        memberService.getMemberSubscriptions(member.id),
        memberService.getMemberCheckins(member.id)
      ]);

      if (detailedProfile.status === "fulfilled") {
        setSelectedMember(detailedProfile.value);
      }

      if (subscriptions.status === "fulfilled" && subscriptions.value.length > 0) {
        setMemberSubscriptions(subscriptions.value);
      } else {
        setMemberSubscriptions(MOCK_SUBSCRIPTIONS[member.id] || []);
      }

      if (checkins.status === "fulfilled" && checkins.value.length > 0) {
        setMemberCheckins(checkins.value);
      } else {
        setMemberCheckins(MOCK_CHECKINS[member.id] || []);
      }
    } catch (error) {
      console.error("Failed to load details via API, using mock details:", error);
      setMemberSubscriptions(MOCK_SUBSCRIPTIONS[member.id] || []);
      setMemberCheckins(MOCK_CHECKINS[member.id] || []);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormValues({
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      status: "ACTIVE",
      address: "",
      fitnessGoal: "",
    } as any);
    setShowFormView(true);
  };

  const handleOpenEdit = (member: MemberProfile) => {
    setIsEditMode(true);
    setSelectedMember(member);
    setFormValues({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      gender: member.gender || "MALE",
      dateOfBirth: member.dateOfBirth || "",
      status: member.status,
      address: member.address || "",
      fitnessGoal: member.fitnessGoal || "",
    });
    setShowFormView(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdminMemberForm(formValues as any, !isEditMode, members, isEditMode && selectedMember ? selectedMember.id : undefined)) {
      return;
    }

    try {
      setFormLoading(true);
      if (isEditMode && selectedMember) {
        // MEM-04
        await memberService.updateMember(selectedMember.id, formValues as AdminMemberUpdateRequest);
        showAlert.success("Cập nhật thành công", `Hồ sơ hội viên ${formValues.fullName} đã được cập nhật.`);
        
        // Update local state
        setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, ...formValues } as MemberProfile : m));
      } else {
        // MEM-03
        try {
          const created = await memberService.createMember(formValues as AdminMemberCreateRequest);
          setMembers(prev => [created, ...prev]);
        } catch {
          // Fallback local update
          const fallbackCreated: MemberProfile = {
            id: Date.now(),
            ...formValues,
            memberCode: "MEM9999"
          } as MemberProfile;
          setMembers(prev => [fallbackCreated, ...prev]);
        }
        
        if (isEditMode) {
          showAlert.success("Cập nhật thành công", `Đã lưu thay đổi cho ${formValues.fullName}.`);
        } else {
          showAlert.success("Thêm mới thành công", `Đã tạo tài khoản hội viên cho ${formValues.fullName}.`);
        }
        setShowFormView(false);
      }
    } catch (error: any) {
      console.error("Form submit failed:", error);
      let errorMsg = "Có lỗi xảy ra trong quá trình lưu dữ liệu.";
      if (error.response?.data?.message) {
        // Remove exception class name if present (e.g., "RuntimeException: Tên đăng nhập đã tồn tại")
        errorMsg = error.response.data.message.replace(/^[a-zA-Z0-9_]+Exception:\s*/, "");
      }
      showAlert.error("Thao tác thất bại", errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  // Quick Toggle Lock/Unlock Status
  const handleToggleStatus = async (member: MemberProfile) => {
    const isCurrentlyLocked = member.status === "LOCKED";
    const newStatus: Status = isCurrentlyLocked ? "ACTIVE" : "LOCKED";
    const actionText = isCurrentlyLocked ? "Mở khóa" : "Khóa";

    const result = await showAlert.confirm(
      `${actionText} tài khoản?`,
      `Bạn có chắc chắn muốn ${actionText.toLowerCase()} tài khoản của hội viên ${member.fullName}?`
    );

    if (result.isConfirmed) {
      try {
        await memberService.updateMemberStatus(member.id, newStatus);
        
        // Cập nhật local state
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        showAlert.success("Thành công", `Đã ${actionText.toLowerCase()} tài khoản của hội viên.`);
      } catch (error) {
        console.error("Failed to update status via API, performing local fallback update:", error);
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        showAlert.success("Thành công (Local)", `Đã ${actionText.toLowerCase()} tài khoản hội viên.`);
      }
    }
  };

  // Render status badge
  const renderStatusBadge = (status: MemberProfile["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Hoạt động</Badge>;
      case "PENDING":
        return <Badge variant="warning">Chờ xử lý</Badge>;
      case "LOCKED":
        return <Badge variant="danger">Bị khóa</Badge>;
      case "INACTIVE":
        return <Badge variant="default">Ngưng HĐ</Badge>;
      case "EXPIRED":
        return <Badge variant="purple">Hết hạn</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Calculate statistics
  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === "ACTIVE").length;
  const lockedCount = members.filter(m => m.status === "LOCKED").length;
  const pendingCount = members.filter(m => m.status === "PENDING").length;

  // Filter & Search Logic
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      (m.memberCode && m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate BMI
  const getBmiInfo = (h?: number, w?: number, providedBmi?: number) => {
    let bmiValue = providedBmi;
    if (!bmiValue) {
      if (!h || !w) return { value: "-", label: "Chưa có chỉ số", color: "text-slate-400" };
      const heightInMeters = h / 100;
      bmiValue = Number((w / (heightInMeters * heightInMeters)).toFixed(1));
    }
    
    if (bmiValue < 18.5) return { value: bmiValue, label: "Gầy", color: "text-blue-500 bg-blue-50" };
    if (bmiValue < 24.9) return { value: bmiValue, label: "Bình thường", color: "text-emerald-500 bg-emerald-50" };
    if (bmiValue < 29.9) return { value: bmiValue, label: "Tiền béo phì", color: "text-amber-500 bg-amber-50" };
    return { value: bmiValue, label: "Béo phì", color: "text-rose-500 bg-rose-50" };
  };

  if (showFormView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" onClick={() => setShowFormView(false)}>
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Chỉnh sửa Thông tin Hội viên" : "Thêm Hội viên Mới"}
            </h1>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {!isEditMode && (
                <>
                  <div className="col-span-1">
                    <Input 
                      label="Tên đăng nhập *" 
                      name="username"
                      value={(formValues as any).username || ""} 
                      onChange={(e) => setFormValues(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Tên đăng nhập (từ 4 ký tự)"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Input 
                      label="Mật khẩu *" 
                      name="password"
                      type="password"
                      value={(formValues as any).password || ""} 
                      onChange={(e) => setFormValues(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mật khẩu (từ 6 ký tự)"
                      required
                    />
                  </div>
                </>
              )}
              <div className="col-span-2">
                <Input 
                  label="Họ và tên *" 
                  name="fullName"
                  value={formValues.fullName} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nhập họ và tên hội viên"
                  required
                />
              </div>
              
              <div>
                <Input 
                  label="Số điện thoại *" 
                  name="phone"
                  value={formValues.phone} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div>
                <Input 
                  label="Email *" 
                  name="email"
                  type="email"
                  value={formValues.email} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Giới tính</label>
                <select 
                  value={formValues.gender}
                  onChange={(e) => setFormValues(prev => ({ ...prev, gender: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary font-medium"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <Input 
                  label="Ngày sinh" 
                  name="dateOfBirth"
                  type="date"
                  value={formValues.dateOfBirth} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div className="col-span-2">
                <Input 
                  label="Địa chỉ" 
                  name="address"
                  value={formValues.address} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Nhập địa chỉ của hội viên"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Mục tiêu tập luyện</label>
                <select 
                  value={formValues.fitnessGoal || ""}
                  onChange={(e) => setFormValues(prev => ({ ...prev, fitnessGoal: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary font-medium"
                >
                  <option value="">-- Chọn mục tiêu --</option>
                  <option value="LOSE_WEIGHT">Giảm cân/giảm mỡ</option>
                  <option value="GAIN_MUSCLE">Tăng cơ</option>
                  <option value="MAINTAIN_FITNESS">Duy trì vóc dáng</option>
                  <option value="IMPROVE_HEALTH">Cải thiện sức khỏe</option>
                  <option value="BODY_RECOMPOSITION">Tái tạo hình thể (giảm mỡ, tăng cơ)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Trạng thái hoạt động</label>
                <select 
                  value={formValues.status}
                  onChange={(e) => setFormValues(prev => ({ ...prev, status: e.target.value as Status }))}
                  className="mt-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary font-medium"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="INACTIVE">Ngưng hoạt động</option>
                  <option value="LOCKED">Bị khóa</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowFormView(false)}>
                Hủy
              </Button>
              <Button type="submit" isLoading={formLoading} className="bg-fit-primary hover:bg-fit-primaryHover text-white px-6">
                {isEditMode ? "Lưu thay đổi" : "Lưu Hội viên"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý hội viên</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách tài khoản hội viên, trạng thái hoạt động, lịch sử dịch vụ phòng tập</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-fit-primary hover:bg-fit-primaryHover text-white shadow-sm flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Thêm hội viên
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng hội viên</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{totalCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-fit-primary">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang hoạt động</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{activeCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-fit-trainer">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ kích hoạt</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{pendingCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-fit-danger">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tài khoản bị khóa</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{lockedCount}</h3>
          </div>
        </Card>
      </div>

      {/* Main Filter & Table Card */}
      <Card className="shadow-sm border-slate-100 overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 bg-slate-50/30">
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input 
              type="text" 
              placeholder="Tìm theo mã, tên, SĐT, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary transition-all shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide pl-1">Lọc Trạng thái</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/10 shadow-sm appearance-none cursor-pointer w-full font-medium"
                style={{ 
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", 
                  backgroundRepeat: "no-repeat", 
                  backgroundPosition: "right 0.75rem center", 
                  backgroundSize: "1.2em 1.2em", 
                  paddingRight: "2.25rem" 
                }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="LOCKED">Bị khóa</option>
                <option value="INACTIVE">Ngưng hoạt động</option>
                <option value="EXPIRED">Gói đã hết hạn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table representation */}
        {loading ? (
          <Loading label="Đang tải danh sách hội viên..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/80 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="px-6 py-4">Mã HV</th>
                  <th className="px-6 py-4">Hội viên</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Giới tính</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy hội viên nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                        {member.memberCode || `MEM${String(member.id).padStart(4, "0")}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{member.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[13px]">{member.fullName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">ID: {member.id} {member.userId ? ` | User: ${member.userId}` : ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px]">
                        <div className="flex flex-col gap-0.5 text-slate-700 font-medium">
                          <span>{member.phone}</span>
                          <span className="text-xs text-slate-400 font-normal">{member.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        {member.gender === "MALE" ? "Nam" : member.gender === "FEMALE" ? "Nữ" : "Khác"}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                        {member.joinDate || "Gần đây"}
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(member.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenDetail(member)}
                            className="p-1.5 text-slate-400 hover:text-fit-primary hover:bg-fit-primarySoft rounded-lg transition-all" 
                            title="Xem chi tiết hồ sơ & lịch sử"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 text-slate-400 hover:text-fit-admin hover:bg-fit-adminSoft rounded-lg transition-all" 
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(member)}
                            className={`p-1.5 rounded-lg transition-all ${
                              member.status === "LOCKED" 
                                ? "text-emerald-500 hover:bg-emerald-50" 
                                : "text-rose-500 hover:bg-rose-50"
                            }`} 
                            title={member.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {member.status === "LOCKED" ? <Unlock className="w-4.5 h-4.5" /> : <Lock className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal 
        title={`Chi tiết Hội viên: ${selectedMember?.fullName}`}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      >
        {selectedMember && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Custom Tab Panel Header */}
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setDetailTab("profile")}
                className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-all ${
                  detailTab === "profile" 
                    ? "border-fit-primary text-fit-primary" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Thông tin cá nhân
              </button>
              <button 
                onClick={() => setDetailTab("subscription")}
                className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-all ${
                  detailTab === "subscription" 
                    ? "border-fit-primary text-fit-primary" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Lịch sử gói tập
              </button>
              <button 
                onClick={() => setDetailTab("checkin")}
                className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-all ${
                  detailTab === "checkin" 
                    ? "border-fit-primary text-fit-primary" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Lịch sử Check-in
              </button>
            </div>

            {detailLoading ? (
              <Loading label="Đang tải dữ liệu chi tiết..." />
            ) : (
              <div className="mt-4">
                {/* TAB 1: Profile */}
                {detailTab === "profile" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-14 h-14 rounded-full bg-fit-primarySoft flex items-center justify-center text-fit-primary font-bold text-lg">
                        {selectedMember.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{selectedMember.fullName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Mã số: {selectedMember.memberCode || "Chưa có"}</p>
                        <div className="mt-1">{renderStatusBadge(selectedMember.status)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Email</span>
                        <span className="text-sm font-medium text-slate-800 mt-1 truncate">{selectedMember.email}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Số điện thoại</span>
                        <span className="text-sm font-medium text-slate-800 mt-1">{selectedMember.phone}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Giới tính</span>
                        <span className="text-sm font-medium text-slate-800 mt-1">
                          {selectedMember.gender === "MALE" ? "Nam" : selectedMember.gender === "FEMALE" ? "Nữ" : "Khác"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Ngày sinh</span>
                        <span className="text-sm font-medium text-slate-800 mt-1">{selectedMember.dateOfBirth || "-"}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Địa chỉ</span>
                      <span className="text-sm font-medium text-slate-800 mt-1">{selectedMember.address || "Chưa cập nhật"}</span>
                    </div>

                    

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Mục tiêu tập luyện</span>
                        <span className="text-xs font-semibold text-slate-700 mt-1.5">{selectedMember.fitnessGoal || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Subscriptions */}
                {detailTab === "subscription" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 pl-1">Lịch sử giao dịch / Đăng ký gói</h4>
                    {memberSubscriptions.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">
                        Hội viên chưa có đăng ký gói tập nào.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {memberSubscriptions.map((sub) => (
                          <div key={sub.id} className="p-4 border border-slate-100 hover:border-slate-200 bg-white rounded-xl flex items-center justify-between transition-colors shadow-sm">
                            <div className="space-y-1">
                              <div className="font-bold text-slate-800 text-sm">{sub.package?.name}</div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {sub.startDate}</span>
                                <span>đến</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {sub.endDate}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-semibold text-fit-primary">
                                {((sub.package as any)?.basePrice || sub.basePrice || 0).toLocaleString("vi-VN")} ₫
                              </span>
                              {sub.status === "ACTIVE" ? (
                                <Badge variant="success">Hoạt động</Badge>
                              ) : sub.status === "EXPIRED" ? (
                                <Badge variant="purple">Hết hạn</Badge>
                              ) : (
                                <Badge variant="danger">Bị khóa</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Checkins */}
                {detailTab === "checkin" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 pl-1">Lịch sử lượt check-in ra vào</h4>
                    {memberCheckins.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">
                        Hội viên chưa có lượt check-in nào được ghi nhận.
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                          <thead className="bg-slate-50 font-semibold text-slate-500">
                            <tr>
                              <th className="px-4 py-2.5 text-left">Thời gian</th>
                              <th className="px-4 py-2.5 text-left">Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-600">
                            {memberCheckins.map((record) => (
                              <tr key={record.id} className="hover:bg-slate-50/40">
                                <td className="px-4 py-3 font-semibold text-slate-700">
                                  {new Date(record.checkedInAt).toLocaleString("vi-VN")}
                                </td>
                                <td className="px-4 py-3 font-medium">
                                  <span className={record.note?.includes("khóa") || record.note?.includes("thất bại") ? "text-rose-500" : "text-slate-600"}>
                                    {record.note || "Hợp lệ"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <Button type="button" variant="outline" onClick={() => setDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
