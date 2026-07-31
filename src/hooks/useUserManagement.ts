import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { showAlert } from "../utils/alert";
import { getApiErrorMessage } from "../utils/apiError";

import { memberService } from "../services/memberService";

import {
  validateAdminMemberForm,
} from "../utils/validators/adminMemberValidator";

import type {
  MemberProfile,
  AdminMemberCreateRequest,
  AdminMemberUpdateRequest,
} from "../types/member.type";

import type {
  Status,
} from "../types/common.type";

import type {
  Subscription,
} from "../types/subscription.type";

import type {
  CheckinRecord,
} from "../types/checkin.type";

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
            if (data && data.items) {
                setMembers(data.items);
                setTotalItems(data.totalItems);
                setCurrentPage(data.page);
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error("API error fetching members:", error);
            setMembers([]);
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

            if (subscriptions.status === "fulfilled") {
                setMemberSubscriptions(subscriptions.value);
            } else {
                setMemberSubscriptions([]);
            }

            if (checkins.status === "fulfilled") {
                setMemberCheckins(checkins.value);
            } else {
                setMemberCheckins([]);
            }
        } catch (error) {
            console.error("Failed to load details via API:", error);
            setMemberSubscriptions([]);
            setMemberCheckins([]);
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

  const handleFormSubmit = async (
      event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const validationPayload:
        | AdminMemberCreateRequest
        | AdminMemberUpdateRequest =
        isEditMode
            ? formValues as AdminMemberUpdateRequest
            : formValues as AdminMemberCreateRequest;

    const isValid =
        validateAdminMemberForm(
            validationPayload,
            !isEditMode,
            members,
            selectedMember?.id,
        );

    if (!isValid) {
      return;
    }

    try {
      setFormLoading(true);

      if (
          isEditMode &&
          selectedMember
      ) {
        const updatePayload =
            formValues as
                AdminMemberUpdateRequest;

        await memberService.updateMember(
            selectedMember.id,
            updatePayload,
        );

        showAlert.success(
            "Thành công",
            "Đã cập nhật thông tin hội viên",
        );

        setMembers((previousMembers) =>
            previousMembers.map(
                (member) =>
                    member.id ===
                    selectedMember.id
                        ? {
                          ...member,
                          ...updatePayload,
                        } as MemberProfile
                        : member,
            ),
        );
      } else {
        const createPayload: AdminMemberCreateRequest = {
          ...(formValues as
              AdminMemberCreateRequest),
        };

        const newMember =
            await memberService.createMember(
                createPayload,
            );

        if (!newMember) {
          showAlert.error(
              "Lỗi",
              "Không nhận được phản hồi tạo mới từ máy chủ.",
          );

          return;
        }

        setMembers(
            (previousMembers) => [
              newMember,
              ...previousMembers,
            ],
        );

        showAlert.success(
            "Thành công",
            "Đã thêm hội viên mới",
        );
      }

      setShowFormView(false);

      await fetchMembers();
    } catch (error: unknown) {
      console.error(
          "Form submit error:",
          error,
      );

      showAlert.error(
          "Thao tác thất bại",
          getApiErrorMessage(
              error,
              "Vui lòng kiểm tra lại thông tin.",
          ),
      );
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
                setMembers(prev => prev.map(m => m.id === member.id ? {...m, status: newStatus} : m));
                showAlert.success("Thành công", `Đã ${actionText.toLowerCase()} tài khoản của hội viên.`);
            } catch (error: unknown) {
              console.error(
                  "Failed to update status via API:",
                  error,
              );

              showAlert.error(
                  "Thất bại",
                  getApiErrorMessage(
                      error,
                      `Không thể ${actionText.toLowerCase()} tài khoản hội viên.`,
                  ),
              );
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
            if (!h || !w) return {value: "-", label: "Chưa có chỉ số", color: "text-slate-400"};
            const heightInMeters = h / 100;
            bmiValue = Number((w / (heightInMeters * heightInMeters)).toFixed(1));
        }

        if (bmiValue < 18.5) return {value: bmiValue, label: "Gầy", color: "text-blue-500 bg-blue-50"};
        if (bmiValue < 24.9) return {value: bmiValue, label: "Bình thường", color: "text-emerald-500 bg-emerald-50"};
        if (bmiValue < 29.9) return {value: bmiValue, label: "Tiền béo phì", color: "text-amber-500 bg-amber-50"};
        return {value: bmiValue, label: "Béo phì", color: "text-rose-500 bg-rose-50"};
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
