import {
    useCallback,
    useEffect,
    useState,
    type FormEvent,
} from "react";

import {
    showAlert,
} from "../utils/alert";

import {
    getApiErrorMessage,
} from "../utils/apiError";

import {
    memberService,
} from "../services/memberService";

import {
    validateAdminMemberForm,
} from "../utils/validators/adminMemberValidator";

import type {
    MemberProfile,
    MemberStatus,
    AdminMemberCreateRequest,
    AdminMemberUpdateRequest,
} from "../types/member.type";

import type {
    Subscription,
} from "../types/subscription.type";

import type {
    CheckinRecord,
} from "../types/checkin.type";

const PAGE_SIZE =
    20;

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

function createEmptyForm():
    MemberFormValues {
    return {
        username: "",
        password: "",

        fullName: "",
        email: "",
        phone: "",

        gender:
            null,

        dateOfBirth:
            "",

        address:
            "",

        emergencyContactName:
            "",

        emergencyContactPhone:
            "",

        fitnessGoal:
            null,

        healthNote:
            "",
    };
}

function createFormFromMember(
    member: MemberProfile,
): MemberFormValues {
    return {
        id:
        member.id,

        userId:
        member.userId,

        username:
        member.username,

        memberCode:
        member.memberCode,

        fullName:
        member.fullName,

        email:
        member.email,

        phone:
            member.phone ??
            "",

        gender:
            member.gender ??
            null,

        dateOfBirth:
            member.dateOfBirth ??
            "",

        address:
            member.address ??
            "",

        emergencyContactName:
            member
                .emergencyContactName ??
            "",

        emergencyContactPhone:
            member
                .emergencyContactPhone ??
            "",

        fitnessGoal:
            member.fitnessGoal ??
            null,

        healthNote:
            member.healthNote ??
            "",

        status:
        member.status,

        emailVerified:
        member.emailVerified,
    };
}

export function useUserManagement() {
    // =====================================================
    // LIST
    // =====================================================

    const [
        members,
        setMembers,
    ] =
        useState<MemberProfile[]>(
            [],
        );

    const [
        totalItems,
        setTotalItems,
    ] =
        useState(0);

    const [
        totalPages,
        setTotalPages,
    ] =
        useState(0);

    const [
        currentPage,
        setCurrentPage,
    ] =
        useState(0);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    // =====================================================
    // FILTER
    // =====================================================

    const [
        searchTerm,
        setSearchTerm,
    ] =
        useState("");

    const [
        submittedSearchTerm,
        setSubmittedSearchTerm,
    ] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] =
        useState<
            MemberStatus |
            "ALL"
        >(
            "ALL",
        );

    // =====================================================
    // DETAIL
    // =====================================================

    const [
        detailModalOpen,
        setDetailModalOpen,
    ] =
        useState(false);

    const [
        selectedMember,
        setSelectedMember,
    ] =
        useState<
            MemberProfile |
            null
        >(
            null,
        );

    const [
        detailTab,
        setDetailTab,
    ] =
        useState<MemberDetailTab>(
            "profile",
        );

    const [
        memberSubscriptions,
        setMemberSubscriptions,
    ] =
        useState<Subscription[]>(
            [],
        );

    const [
        memberCheckins,
        setMemberCheckins,
    ] =
        useState<CheckinRecord[]>(
            [],
        );

    const [
        detailLoading,
        setDetailLoading,
    ] =
        useState(false);

    // =====================================================
    // FORM
    // =====================================================

    const [
        showFormView,
        setShowFormView,
    ] =
        useState(false);

    const [
        isEditMode,
        setIsEditMode,
    ] =
        useState(false);

    const [
        formValues,
        setFormValues,
    ] =
        useState<MemberFormValues>(
            createEmptyForm(),
        );

    const [
        formLoading,
        setFormLoading,
    ] =
        useState(false);

    // =====================================================
    // FETCH
    // =====================================================

    const fetchMembers =
        useCallback(
            async (
                page = 0,
            ): Promise<void> => {
                try {
                    setLoading(
                        true,
                    );

                    const data =
                        await memberService
                            .getMembers({
                                page,

                                size:
                                PAGE_SIZE,

                                keyword:
                                    submittedSearchTerm
                                        .trim() ||
                                    undefined,

                                status:
                                    statusFilter ===
                                    "ALL"
                                        ? undefined
                                        : statusFilter,
                            });

                    setMembers(
                        data.content ??
                        [],
                    );

                    setTotalItems(
                        data.totalElements ??
                        0,
                    );

                    setTotalPages(
                        data.totalPages ??
                        0,
                    );

                    setCurrentPage(
                        data.page ??
                        page,
                    );
                } catch (error) {
                    console.error(
                        "API error fetching members:",
                        error,
                    );

                    setMembers(
                        [],
                    );

                    setTotalItems(
                        0,
                    );

                    setTotalPages(
                        0,
                    );

                    showAlert.error(
                        "Không thể tải hội viên",

                        getApiErrorMessage(
                            error,
                            "Không thể tải danh sách hội viên.",
                        ),
                    );
                } finally {
                    setLoading(
                        false,
                    );
                }
            },
            [
                statusFilter,
                submittedSearchTerm,
            ],
        );

    useEffect(
        () => {
            void fetchMembers(
                currentPage,
            );
        },
        [
            currentPage,
            fetchMembers,
        ],
    );

    useEffect(
        () => {
            setCurrentPage(
                0,
            );
        },
        [
            statusFilter,
        ],
    );

    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearchSubmit =
        (
            event:
            FormEvent<HTMLFormElement>,
        ): void => {
            event.preventDefault();

            setCurrentPage(
                0,
            );

            setSubmittedSearchTerm(
                searchTerm.trim(),
            );
        };

    // =====================================================
    // DETAIL
    // =====================================================

    const handleOpenDetail =
        async (
            member:
            MemberProfile,
        ): Promise<void> => {
            setSelectedMember(
                member,
            );

            setDetailTab(
                "profile",
            );

            setDetailModalOpen(
                true,
            );

            setDetailLoading(
                true,
            );

            try {
                const [
                    detailedProfile,
                    subscriptions,
                    checkins,
                ] =
                    await Promise.allSettled([
                        memberService
                            .getMemberById(
                                member.id,
                            ),

                        memberService
                            .getMemberSubscriptions(
                                member.id,
                            ),

                        memberService
                            .getMemberCheckins(
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
                    checkins.status ===
                    "fulfilled"
                        ? checkins.value
                        : [],
                );
            } finally {
                setDetailLoading(
                    false,
                );
            }
        };

    // =====================================================
    // CREATE
    // =====================================================

    const handleOpenCreate =
        (): void => {
            setSelectedMember(
                null,
            );

            setIsEditMode(
                false,
            );

            setFormValues(
                createEmptyForm(),
            );

            setShowFormView(
                true,
            );
        };

    // =====================================================
    // EDIT
    // =====================================================

    const handleOpenEdit =
        async (
            member:
            MemberProfile,
        ): Promise<void> => {
            try {
                setIsEditMode(
                    true,
                );

                setSelectedMember(
                    member,
                );

                setFormValues(
                    createFormFromMember(
                        member,
                    ),
                );

                setShowFormView(
                    true,
                );

                /*
                 * Lấy detail từ Backend để form luôn có:
                 * - gender
                 * - dateOfBirth
                 * - address
                 * - fitnessGoal
                 * - healthNote
                 */
                const detailedMember =
                    await memberService
                        .getMemberById(
                            member.id,
                        );

                setSelectedMember(
                    detailedMember,
                );

                setFormValues(
                    createFormFromMember(
                        detailedMember,
                    ),
                );
            } catch (error) {
                console.error(
                    "Failed to load member before editing:",
                    error,
                );

                showAlert.error(
                    "Không thể tải hồ sơ",

                    getApiErrorMessage(
                        error,
                        "Không thể tải thông tin hội viên.",
                    ),
                );
            }
        };

    // =====================================================
    // FORM SUBMIT
    // =====================================================

    const handleFormSubmit =
        async (
            event:
            FormEvent<HTMLFormElement>,
        ): Promise<void> => {
            event.preventDefault();

            const updatePayload:
                AdminMemberUpdateRequest = {
                fullName:
                formValues.fullName,

                email:
                formValues.email,

                phone:
                formValues.phone,

                gender:
                    formValues.gender ??
                    undefined,

                dateOfBirth:
                    formValues.dateOfBirth ||
                    undefined,

                address:
                formValues.address,

                emergencyContactName:
                formValues
                    .emergencyContactName,

                emergencyContactPhone:
                formValues
                    .emergencyContactPhone,

                fitnessGoal:
                    formValues
                        .fitnessGoal ??
                    undefined,

                healthNote:
                formValues
                    .healthNote,
            };

            const createPayload:
                AdminMemberCreateRequest = {
                username:
                    formValues.username ??
                    "",

                password:
                    formValues.password ??
                    "",

                fullName:
                    formValues.fullName ??
                    "",

                email:
                    formValues.email ??
                    "",

                phone:
                formValues.phone,

                gender:
                    formValues.gender ??
                    undefined,

                dateOfBirth:
                    formValues.dateOfBirth ||
                    undefined,

                address:
                formValues.address,

                emergencyContactName:
                formValues
                    .emergencyContactName,

                emergencyContactPhone:
                formValues
                    .emergencyContactPhone,

                fitnessGoal:
                    formValues
                        .fitnessGoal ??
                    undefined,

                healthNote:
                formValues
                    .healthNote,
            };

            const validationPayload =
                isEditMode
                    ? updatePayload
                    : createPayload;

            const isValid =
                validateAdminMemberForm(
                    validationPayload,

                    !isEditMode,

                    members,

                    selectedMember
                        ?.id,
                );

            if (!isValid) {
                return;
            }

            try {
                setFormLoading(
                    true,
                );

                if (
                    isEditMode &&
                    selectedMember
                ) {
                    const updatedMember =
                        await memberService
                            .updateMember(
                                selectedMember.id,
                                updatePayload,
                            );

                    setMembers(
                        (previous) =>
                            previous.map(
                                (member) =>
                                    member.id ===
                                    updatedMember.id
                                        ? updatedMember
                                        : member,
                            ),
                    );

                    setSelectedMember(
                        updatedMember,
                    );

                    showAlert.success(
                        "Thành công",
                        "Đã cập nhật thông tin hội viên.",
                    );
                } else {
                    await memberService
                        .createMember(
                            createPayload,
                        );

                    showAlert.success(
                        "Thành công",
                        "Đã thêm hội viên mới.",
                    );
                }

                setShowFormView(
                    false,
                );

                if (
                    currentPage !==
                    0
                ) {
                    setCurrentPage(
                        0,
                    );
                } else {
                    await fetchMembers(
                        0,
                    );
                }
            } catch (error) {
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
                setFormLoading(
                    false,
                );
            }
        };

    // =====================================================
    // STATUS
    // =====================================================

    const handleToggleStatus =
        async (
            member:
            MemberProfile,
        ): Promise<void> => {
            const currentlySuspended =
                member.status ===
                "SUSPENDED";

            const newStatus:
                MemberStatus =
                currentlySuspended
                    ? "ACTIVE"
                    : "SUSPENDED";

            const actionText =
                currentlySuspended
                    ? "Mở khóa"
                    : "Khóa";

            const result =
                await showAlert.confirm(
                    `${actionText} tài khoản?`,

                    `Bạn có chắc chắn muốn ${actionText.toLowerCase()} tài khoản của hội viên ${member.fullName}?`,
                );

            if (
                !result.isConfirmed
            ) {
                return;
            }

            try {
                /*
                 * Dùng response thật từ Backend,
                 * không tự giả lập status phía FE.
                 */
                const updatedMember =
                    await memberService
                        .updateMemberStatus(
                            member.id,
                            newStatus,
                        );

                setMembers(
                    (previous) =>
                        previous.map(
                            (item) =>
                                item.id ===
                                updatedMember.id
                                    ? updatedMember
                                    : item,
                        ),
                );

                if (
                    selectedMember
                        ?.id ===
                    updatedMember.id
                ) {
                    setSelectedMember(
                        updatedMember,
                    );
                }

                showAlert.success(
                    "Thành công",

                    `Đã ${actionText.toLowerCase()} tài khoản hội viên.`,
                );

                await fetchMembers(
                    currentPage,
                );
            } catch (error) {
                console.error(
                    "Failed to update member status:",
                    error,
                );

                showAlert.error(
                    "Thao tác thất bại",

                    getApiErrorMessage(
                        error,

                        `Không thể ${actionText.toLowerCase()} tài khoản hội viên.`,
                    ),
                );
            }
        };

    // =====================================================
    // FILTERED MEMBERS
    // =====================================================

    const filteredMembers =
        members.filter(
            (member) => {
                const keyword =
                    searchTerm
                        .trim()
                        .toLowerCase();

                if (!keyword) {
                    return true;
                }

                return (
                    (
                        member.fullName ??
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword)
                    ||
                    (
                        member.email ??
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword)
                    ||
                    (
                        member.phone ??
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword)
                    ||
                    (
                        member.memberCode ??
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword)
                );
            },
        );

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalCount =
        totalItems;

    const activeCount =
        members.filter(
            (member) =>
                member.status ===
                "ACTIVE",
        ).length;

    const suspendedCount =
        members.filter(
            (member) =>
                member.status ===
                "SUSPENDED",
        ).length;

    const inactiveCount =
        members.filter(
            (member) =>
                member.status ===
                "INACTIVE",
        ).length;

    // =====================================================
    // BMI
    // =====================================================

    const getBmiInfo =
        (
            heightCm?: number,
            weightKg?: number,
            providedBmi?: number,
        ) => {
            let bmiValue =
                providedBmi;

            if (!bmiValue) {
                if (
                    !heightCm ||
                    !weightKg
                ) {
                    return {
                        value:
                            "-",

                        label:
                            "Chưa có chỉ số",

                        color:
                            "text-slate-400",
                    };
                }

                const heightInMeters =
                    heightCm /
                    100;

                bmiValue =
                    Number(
                        (
                            weightKg /
                            (
                                heightInMeters *
                                heightInMeters
                            )
                        ).toFixed(
                            1,
                        ),
                    );
            }

            if (
                bmiValue <
                18.5
            ) {
                return {
                    value:
                    bmiValue,

                    label:
                        "Gầy",

                    color:
                        "text-blue-500 bg-blue-50",
                };
            }

            if (
                bmiValue <
                24.9
            ) {
                return {
                    value:
                    bmiValue,

                    label:
                        "Bình thường",

                    color:
                        "text-emerald-500 bg-emerald-50",
                };
            }

            if (
                bmiValue <
                29.9
            ) {
                return {
                    value:
                    bmiValue,

                    label:
                        "Tiền béo phì",

                    color:
                        "text-amber-500 bg-amber-50",
                };
            }

            return {
                value:
                bmiValue,

                label:
                    "Béo phì",

                color:
                    "text-rose-500 bg-rose-50",
            };
        };

    // =====================================================
    // RETURN
    // =====================================================

    return {
        members,
        filteredMembers,

        totalItems,
        totalPages,

        currentPage,

        pageSize:
        PAGE_SIZE,

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
        suspendedCount,
        inactiveCount,

        getBmiInfo,

        refreshMembers:
        fetchMembers,
    };
}