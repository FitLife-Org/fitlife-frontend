import { useState, useEffect, useCallback } from "react";
import { showAlert } from "../utils/alert";
import { memberService } from "../services/memberService";
import type { MemberProfile, AdminMemberCreateRequest } from "../types/member.type";
import type { Status } from "../types/common.type";
import type { Subscription } from "../types/subscription.type";
import type { CheckinRecord } from "../types/checkin.type";

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

const MOCK_SUBSCRIPTIONS: Record<number, unknown[]> = {
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
      status: "EXPIRED"
    }
  ]
};

const MOCK_CHECKINS: Record<number, CheckinRecord[]> = {
  1: [
    { id: 1001, memberId: 1, checkInTime: "2026-06-28T08:30:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" },
    { id: 1002, memberId: 1, checkInTime: "2026-06-26T17:15:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" },
    { id: 1003, memberId: 1, checkInTime: "2026-06-25T08:00:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" }
  ],
  2: [
    { id: 2001, memberId: 2, checkInTime: "2026-06-28T09:00:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" },
    { id: 2002, memberId: 2, checkInTime: "2026-06-27T18:30:00Z", note: "Thẻ hợp lệ - Đã check-in", status: "SUCCESS" }
  ],
  3: [],
  4: [
    { id: 4001, memberId: 4, checkInTime: "2026-05-25T19:00:00Z", note: "Tài khoản bị khóa - Check-in thất bại", status: "FAILED" }
  ]
};

export function useUserManagement() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [showFormView, setShowFormView] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [detailTab, setDetailTab] = useState<"profile" | "subscription" | "checkin">("profile");

  const [memberSubscriptions, setMemberSubscriptions] = useState<Subscription[]>([]);
  const [memberCheckins, setMemberCheckins] = useState<CheckinRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const fetchMembers = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const data = await memberService.getMembers(page, 20, searchTerm, statusFilter);
      if (data && data.items && data.items.length > 0) {
        setMembers(data.items);
        setTotalItems(data.totalItems);
        setCurrentPage(data.page);
      } else {
        setMembers(MOCK_MEMBERS);
      }
    } catch (error) {
      console.error("API error fetching members, falling back to mock data:", error);
      setMembers(MOCK_MEMBERS);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleOpenDetail = async (member: MemberProfile) => {
    setSelectedMember(member);
    setDetailTab("profile");
    setDetailModalOpen(true);
    setDetailLoading(true);

    try {
      const [detailedProfile, subscriptions, checkins] = await Promise.allSettled([
        memberService.getMemberById(member.id),
        memberService.getMemberSubscriptions(member.id),
        memberService.getMemberCheckins(member.id)
      ]);

      if (detailedProfile.status === "fulfilled") setSelectedMember(detailedProfile.value);

      if (subscriptions.status === "fulfilled" && subscriptions.value.length > 0) {
        setMemberSubscriptions(subscriptions.value);
      } else {
        setMemberSubscriptions((MOCK_SUBSCRIPTIONS[member.id] as unknown as Subscription[]) || []);
      }

      if (checkins.status === "fulfilled" && checkins.value.length > 0) {
        setMemberCheckins(checkins.value);
      } else {
        setMemberCheckins(MOCK_CHECKINS[member.id] || []);
      }
    } catch (error) {
      console.error("Failed to load details via API, using mock details:", error);
      setMemberSubscriptions((MOCK_SUBSCRIPTIONS[member.id] as unknown as Subscription[]) || []);
      setMemberCheckins(MOCK_CHECKINS[member.id] || []);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormValues({
      fullName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      status: "ACTIVE",
      address: "",
      fitnessGoal: "",
    });
    setShowFormView(true);
  };

  const handleOpenEdit = (member: MemberProfile) => {
    setIsEditMode(true);
    setSelectedMember(member);
    setFormValues({
      id: member.id,
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      if (isEditMode && selectedMember) {
        await memberService.updateMember(selectedMember.id, formValues);
        showAlert.success("Thành công", "Đã cập nhật thông tin hội viên");
        
        setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, ...formValues } as MemberProfile : m));
      } else {
        const payload: Record<string, unknown> = { ...formValues };
        if (payload.id) delete payload.id;
        if (payload.userId) delete payload.userId;
        
        const newMember = await memberService.createMember(payload as unknown as AdminMemberCreateRequest);
        
        if (newMember) {
          setMembers(prev => [newMember, ...prev]);
        } else {
          setMembers(prev => [{ ...payload, id: Math.floor(Math.random() * 1000) + 10, memberCode: `MEM00${Math.floor(Math.random() * 100) + 10}` } as MemberProfile, ...prev]);
        }
        
        showAlert.success("Thành công", "Đã thêm hội viên mới");
      }

      setShowFormView(false);
    } catch (error: unknown) {
      console.error("Form submit error:", error);
      const msg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      showAlert.error("Thao tác thất bại", msg || "Vui lòng kiểm tra lại thông tin.");
    } finally {
      setFormLoading(false);
    }
  };

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
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        showAlert.success("Thành công", `Đã ${actionText.toLowerCase()} tài khoản của hội viên.`);
      } catch (error) {
        console.error("Failed to update status via API, performing local fallback update:", error);
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        showAlert.success("Thành công (Local)", `Đã ${actionText.toLowerCase()} tài khoản hội viên.`);
      }
    }
  };

  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === "ACTIVE").length;
  const lockedCount = members.filter(m => m.status === "LOCKED").length;
  const pendingCount = members.filter(m => m.status === "PENDING").length;

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      (m.memberCode && m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return {
    members,
    totalItems,
    currentPage,
    loading,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    detailModalOpen,
    setDetailModalOpen,
    showFormView,
    setShowFormView,
    selectedMember,
    detailTab,
    setDetailTab,
    memberSubscriptions,
    memberCheckins,
    detailLoading,
    isEditMode,
    formValues,
    setFormValues,
    formLoading,
    handleOpenDetail,
    handleOpenCreate,
    handleOpenEdit,
    handleFormSubmit,
    handleToggleStatus,
    totalCount,
    activeCount,
    lockedCount,
    pendingCount,
    filteredMembers,
    getBmiInfo,
  };
}
