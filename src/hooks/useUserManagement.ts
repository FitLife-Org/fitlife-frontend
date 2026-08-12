import {
    useCallback,
    useEffect,
    useState,
    type FormEvent,
} from "react";

import { showAlert } from "../utils/alert";
import { getApiErrorMessage } from "../utils/apiError";
import { memberService } from "../services/memberService";
import { validateAdminMemberForm } from "../utils/validators/adminMemberValidator";

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

const PAGE_SIZE = 20;

type MemberDetailTab =
    | "profile"
    | "subscription"
    | "checkin"
    | "timeline";

type MemberFormValues =
    Partial<MemberProfile> & {
    username?: string;
    password?: string;
};

export function useUserManagement() {
    const [members, setMembers] =
        useState<MemberProfile[]>([]);

    const [totalItems, setTotalItems] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    /**
     * Spring Pageable bắt đầu từ trang 0.
     */
    const [currentPage, setCurrentPage] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [
        submittedSearchTerm,
        setSubmittedSearchTerm,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState<Status | "ALL">("ALL");

    const [
        detailModalOpen,
        setDetailModalOpen,
    ] = useState(false);

    const [
        showFormView,
        setShowFormView,
    ] = useState(false);

    const [
        selectedMember,
        setSelectedMember,
    ] = useState<MemberProfile | null>(
        null,
    );

    const [
        detailTab,
        setDetailTab,
    ] = useState<MemberDetailTab>(
        "profile",
    );

    const [
        memberSubscriptions,
        setMemberSubscriptions,
    ] = useState<Subscription[]>([]);

    const [
        memberCheckins,
        setMemberCheckins,
    ] = useState<CheckinRecord[]>([]);

    const [
        detailLoading,
        setDetailLoading,
    ] = useState(false);

    const [
        isEditMode,
        setIsEditMode,
    ] = useState(false);

    const [
        formValues,
        setFormValues,
    ] = useState<MemberFormValues>({
        username: "",
        password: "",
        fullName: "",
        email: "",
        phone: "",
        gender: "MALE",
        dateOfBirth: "",
        status: "ACTIVE",
        address: "",
        fitnessGoal: null,
        healthNote: "",
    });

    const [
        formLoading,
        setFormLoading,
    ] = useState(false);

    const fetchMembers = useCallback(
        async (
            page: number = currentPage,
        ): Promise<void> => {
            try {
                setLoading(true);

                const data =
                    await memberService.getMembers({
                        page,
                        size: PAGE_SIZE,

                        keyword:
                            submittedSearchTerm
                                .trim() || undefined,

                        status:
                            statusFilter === "ALL"
                                ? undefined
                                : statusFilter,
                    });

                setMembers(data.content);
                setTotalItems(
                    data.totalElements,
                );
                setTotalPages(
                    data.totalPages,
                );
                setCurrentPage(data.page ?? (data as any).number ?? page);
            } catch (error: unknown) {
                console.error(
                    "API error fetching members:",
                    error,
                );

                setMembers([]);
                setTotalItems(0);
                setTotalPages(0);

                showAlert.error(
                    "Không thể tải hội viên",
                    getApiErrorMessage(
                        error,
                        "Không thể tải danh sách hội viên.",
                    ),
                );
            } finally {
                setLoading(false);
            }
        },
        [
            currentPage,
            statusFilter,
            submittedSearchTerm,
        ],
    );

    useEffect(() => {
        void fetchMembers();
    }, [fetchMembers]);

    useEffect(() => {
        setCurrentPage(0);
    }, [statusFilter]);

    const handleSearchSubmit = (
        event: FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();

        setCurrentPage(0);
        setSubmittedSearchTerm(
            searchTerm,
        );
    };

    const handleOpenDetail = async (
        member: MemberProfile,
    ): Promise<void> => {
        setSelectedMember(member);
        setDetailTab("profile");
        setDetailModalOpen(true);
        setDetailLoading(true);

        try {
            const [
                detailedProfile,
                subscriptions,
                checkins,
            ] = await Promise.allSettled([
                memberService.getMemberById(
                    member.id,
                ),

                memberService
                    .getMemberSubscriptions(
                        member.id,
                    ),

                memberService.getMemberCheckins(
                    member.id,
                ),
            ]);

            if (
                detailedProfile.status ===
                "fulfilled"
            ) {
                setSelectedMember(
                    detailedProfile.value,
                );
            }

            setMemberSubscriptions(
                subscriptions.status ===
                "fulfilled"
                    ? subscriptions.value
                    : [],
            );

            setMemberCheckins(
                checkins.status === "fulfilled"
                    ? checkins.value
                    : [],
            );
        } catch (error: unknown) {
            console.error(
                "Failed to load member details:",
                error,
            );

            setMemberSubscriptions([]);
            setMemberCheckins([]);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenCreate = (): void => {
        setSelectedMember(null);
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
            emergencyContactName: "",
            emergencyContactPhone: "",
            fitnessGoal: null,
            healthNote: "",
        });

        setShowFormView(true);
    };

    const handleOpenEdit = (
        member: MemberProfile,
    ): void => {
        setIsEditMode(true);
        setSelectedMember(member);

        setFormValues({
            id: member.id,
            username: member.username,
            fullName: member.fullName,
            email: member.email,
            phone: member.phone,
            gender:
                member.gender ?? "MALE",
            dateOfBirth:
                member.dateOfBirth ?? "",
            status: member.status,
            address:
                member.address ?? "",
            emergencyContactName:
                member.emergencyContactName ??
                "",
            emergencyContactPhone:
                member.emergencyContactPhone ??
                "",
            fitnessGoal:
                member.fitnessGoal ?? null,
            healthNote:
                member.healthNote ?? "",
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
                ? {
                    fullName:
                    formValues.fullName,
                    email:
                    formValues.email,
                    phone:
                    formValues.phone,
                    gender:
                    formValues.gender,
                    dateOfBirth:
                    formValues.dateOfBirth,
                    address:
                    formValues.address,
                    emergencyContactName:
                    formValues
                        .emergencyContactName,
                    emergencyContactPhone:
                    formValues
                        .emergencyContactPhone,
                    fitnessGoal:
                    formValues.fitnessGoal,
                    healthNote:
                    formValues.healthNote,
                    status:
                    formValues.status,
                }
                : {
                    username:
                        formValues.username ?? "",
                    password:
                        formValues.password ?? "",
                    fullName:
                        formValues.fullName ?? "",
                    email:
                        formValues.email ?? "",
                    phone:
                    formValues.phone,
                    gender:
                    formValues.gender,
                    dateOfBirth:
                    formValues.dateOfBirth,
                    address:
                    formValues.address,
                    emergencyContactName:
                    formValues
                        .emergencyContactName,
                    emergencyContactPhone:
                    formValues
                        .emergencyContactPhone,
                    fitnessGoal:
                    formValues.fitnessGoal,
                    healthNote:
                    formValues.healthNote,
                };

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
                const updatedMember =
                    await memberService
                        .updateMember(
                            selectedMember.id,
                            validationPayload as
                                AdminMemberUpdateRequest,
                        );

                setMembers((previous) =>
                    previous.map((member) =>
                        member.id ===
                        updatedMember.id
                            ? updatedMember
                            : member,
                    ),
                );

                showAlert.success(
                    "Thành công",
                    "Đã cập nhật thông tin hội viên.",
                );
            } else {
                await memberService.createMember(
                    validationPayload as
                        AdminMemberCreateRequest,
                );

                showAlert.success(
                    "Thành công",
                    "Đã thêm hội viên mới.",
                );
            }

            setShowFormView(false);

            await fetchMembers(0);
        } catch (error: unknown) {
            console.error(
                "Member form submit error:",
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

    const handleToggleStatus = async (
        member: MemberProfile,
    ): Promise<void> => {
        const currentlyLocked =
            member.status === "LOCKED";

        const newStatus: Status =
            currentlyLocked
                ? "ACTIVE"
                : "LOCKED";

        const actionText =
            currentlyLocked
                ? "Mở khóa"
                : "Khóa";

        const result =
            await showAlert.confirm(
                `${actionText} tài khoản?`,
                `Bạn có chắc chắn muốn ${actionText.toLowerCase()} tài khoản của hội viên ${member.fullName}?`,
            );

        if (!result.isConfirmed) {
            return;
        }

        try {
            const updatedMember =
                await memberService
                    .updateMemberStatus(
                        member.id,
                        newStatus,
                    );

            setMembers((previous) =>
                previous.map((item) =>
                    item.id === updatedMember.id
                        ? updatedMember
                        : item,
                ),
            );

            showAlert.success(
                "Thành công",
                `Đã ${actionText.toLowerCase()} tài khoản hội viên.`,
            );
        } catch (error: unknown) {
            console.error(
                "Failed to update member status:",
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
    };

    const filteredMembers =
        members.filter((member) => {
            const keyword =
                searchTerm.trim().toLowerCase();

            if (!keyword) {
                return true;
            }

            return (
                member.fullName
                    .toLowerCase()
                    .includes(keyword) ||
                member.email
                    .toLowerCase()
                    .includes(keyword) ||
                (member.phone ?? "")
                    .toLowerCase()
                    .includes(keyword) ||
                member.memberCode
                    ?.toLowerCase()
                    .includes(keyword) === true
            );
        });

    const totalCount = totalItems;

    const activeCount =
        members.filter(
            (member) =>
                member.status === "ACTIVE",
        ).length;

    const lockedCount =
        members.filter(
            (member) =>
                member.status === "LOCKED",
        ).length;

    const pendingCount =
        members.filter(
            (member) =>
                member.status === "PENDING",
        ).length;

    const getBmiInfo = (
        heightCm?: number,
        weightKg?: number,
        providedBmi?: number,
    ) => {
        let bmiValue = providedBmi;

        if (!bmiValue) {
            if (
                !heightCm ||
                !weightKg
            ) {
                return {
                    value: "-",
                    label: "Chưa có chỉ số",
                    color: "text-slate-400",
                };
            }

            const heightInMeters =
                heightCm / 100;

            bmiValue = Number(
                (
                    weightKg /
                    (heightInMeters *
                        heightInMeters)
                ).toFixed(1),
            );
        }

        if (bmiValue < 18.5) {
            return {
                value: bmiValue,
                label: "Gầy",
                color:
                    "text-blue-500 bg-blue-50",
            };
        }

        if (bmiValue < 24.9) {
            return {
                value: bmiValue,
                label: "Bình thường",
                color:
                    "text-emerald-500 bg-emerald-50",
            };
        }

        if (bmiValue < 29.9) {
            return {
                value: bmiValue,
                label: "Tiền béo phì",
                color:
                    "text-amber-500 bg-amber-50",
            };
        }

        return {
            value: bmiValue,
            label: "Béo phì",
            color:
                "text-rose-500 bg-rose-50",
        };
    };

    return {
        members,
        filteredMembers,

        totalItems,
        totalPages,
        currentPage,
        pageSize: PAGE_SIZE,

        setCurrentPage,

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

        handleSearchSubmit,
        handleOpenDetail,
        handleOpenCreate,
        handleOpenEdit,
        handleFormSubmit,
        handleToggleStatus,

        totalCount,
        activeCount,
        lockedCount,
        pendingCount,

        getBmiInfo,

        refreshMembers: fetchMembers,
    };
}
