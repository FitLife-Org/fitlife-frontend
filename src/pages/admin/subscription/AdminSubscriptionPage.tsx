import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    Plus,
    CreditCard,
    UserCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    useForm,
} from "react-hook-form";

import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import Loading from "../../../components/common/Loading";
import Pagination from "../../../components/common/Pagination";

import {
    subscriptionService,
} from "../../../services/subscriptionService";

import {
    memberService,
} from "../../../services/memberService";

import {
    packageService,
} from "../../../services/packageService";

import {
    getApiErrorMessage,
} from "../../../utils/apiError";

import {
    showAlert,
} from "../../../utils/alert";

import type {
    Subscription,
    CreateSubscriptionRequest,
    SubscriptionStatus,
} from "../../../types/subscription.type";

import type {
    MemberProfile,
} from "../../../types/member.type";

import type {
    GymPackage,
    PackageDuration,
} from "../../../types/package.type";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Form UI quản lý ID dưới dạng string.
 *
 * Không dùng:
 * CreateSubscriptionRequest & { memberId: string }
 *
 * Vì API request dùng number, trong khi HTML select có trạng thái
 * chưa chọn là "".
 */
type SubscriptionAssignForm = {
    memberId: string;
    gymPackageId: string;
    packageDurationId: string;
    note?: string;
};

export default function AdminSubscriptionPage() {
    // =====================================================
    // SUBSCRIPTION LIST
    // =====================================================

    const [
        subscriptions,
        setSubscriptions,
    ] = useState<Subscription[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        currentPage,
        setCurrentPage,
    ] = useState(0);

    const [
        pageSize,
        setPageSize,
    ] = useState(DEFAULT_PAGE_SIZE);

    const [
        totalElements,
        setTotalElements,
    ] = useState(0);

    // =====================================================
    // ASSIGN MODAL
    // =====================================================

    const [
        isAssignModalOpen,
        setIsAssignModalOpen,
    ] = useState(false);

    const [
        packages,
        setPackages,
    ] = useState<GymPackage[]>([]);

    const [
        durations,
        setDurations,
    ] = useState<PackageDuration[]>([]);

    const [
        loadingFormData,
        setLoadingFormData,
    ] = useState(false);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    // =====================================================
    // MEMBER PICKER
    // =====================================================

    const [
        isMemberPickerOpen,
        setIsMemberPickerOpen,
    ] = useState(false);

    const [
        members,
        setMembers,
    ] = useState<MemberProfile[]>([]);

    const [
        selectedMember,
        setSelectedMember,
    ] = useState<MemberProfile | null>(null);

    const [
        memberSearch,
        setMemberSearch,
    ] = useState("");

    const [
        memberPage,
        setMemberPage,
    ] = useState(0);

    const [
        memberTotalPages,
        setMemberTotalPages,
    ] = useState(0);

    const [
        memberTotalElements,
        setMemberTotalElements,
    ] = useState(0);

    const [
        loadingMembers,
        setLoadingMembers,
    ] = useState(false);

    const [
        pickerPurpose,
        setPickerPurpose,
    ] = useState<"assign" | "transfer">(
        "assign",
    );

    // =====================================================
    // TRANSFER
    // =====================================================

    const [
        isTransferModalOpen,
        setIsTransferModalOpen,
    ] = useState(false);

    const [
        selectedSubToTransfer,
        setSelectedSubToTransfer,
    ] = useState<Subscription | null>(
        null,
    );

    const [
        transferRecipient,
        setTransferRecipient,
    ] = useState<MemberProfile | null>(
        null,
    );

    const [
        transferNote,
        setTransferNote,
    ] = useState("");

    // =====================================================
    // CANCEL
    // =====================================================

    const [
        cancellingSubscriptionId,
        setCancellingSubscriptionId,
    ] = useState<number | null>(null);

    // =====================================================
    // FORM
    // =====================================================

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: {
            errors,
        },
    } = useForm<SubscriptionAssignForm>({
        defaultValues: {
            memberId: "",
            gymPackageId: "",
            packageDurationId: "",
            note: "",
        },
    });

    const selectedGymPackageId =
        watch("gymPackageId");

    // =====================================================
    // LOAD SUBSCRIPTIONS
    // =====================================================

    const fetchSubscriptions =
        useCallback(async () => {
            try {
                setLoading(true);

                const data =
                    await subscriptionService
                        .getAdminSubscriptions({
                            page:
                            currentPage,

                            size:
                            pageSize,
                        });

                setSubscriptions(
                    data.content,
                );

                setTotalElements(
                    data.totalElements,
                );
            } catch (error) {
                setSubscriptions([]);

                setTotalElements(0);

                void showAlert.error(
                    "Không thể tải danh sách",
                    getApiErrorMessage(
                        error,
                    ),
                );
            } finally {
                setLoading(false);
            }
        }, [
            currentPage,
            pageSize,
        ]);

    useEffect(() => {
        void fetchSubscriptions();
    }, [
        fetchSubscriptions,
    ]);

    // =====================================================
    // LOAD FORM DATA
    // =====================================================

    const fetchFormData =
        async () => {
            try {
                setLoadingFormData(true);

                const [
                    packagesRes,
                    durationsRes,
                ] =
                    await Promise.all([
                        packageService
                            .getAdminPackages(),

                        packageService
                            .getAdminPackageDurations(),
                    ]);

                setPackages(
                    packagesRes,
                );

                setDurations(
                    durationsRes,
                );
            } catch (error) {
                void showAlert.error(
                    "Không thể tải dữ liệu",
                    getApiErrorMessage(
                        error,
                    ),
                );
            } finally {
                setLoadingFormData(
                    false,
                );
            }
        };

    // =====================================================
    // FILTER DURATION BY PACKAGE
    // =====================================================

    const availableDurations =
        useMemo(() => {
            const packageId =
                Number(
                    selectedGymPackageId,
                );

            if (!packageId) {
                return [];
            }

            return durations.filter(
                (duration) =>
                    Number(
                        duration.gymPackageId,
                    ) ===
                    packageId &&
                    String(
                        duration.status,
                    ).toUpperCase() ===
                    "ACTIVE",
            );
        }, [
            durations,
            selectedGymPackageId,
        ]);

    /**
     * Mỗi khi đổi package phải reset duration.
     *
     * Form dùng string nên trạng thái chưa chọn là "".
     */
    useEffect(() => {
        setValue(
            "packageDurationId",
            "",
            {
                shouldValidate: false,
                shouldDirty: false,
            },
        );
    }, [
        selectedGymPackageId,
        setValue,
    ]);

    // =====================================================
    // LOAD MEMBERS
    // =====================================================

    const fetchMembers =
        useCallback(async () => {
            try {
                setLoadingMembers(true);

                const result =
                    await memberService
                        .getMembers({
                            page:
                            memberPage,

                            size:
                                10,

                            keyword:
                                memberSearch
                                    .trim() ||
                                undefined,

                            status:
                                "ACTIVE",

                            sort:
                                "fullName,asc",
                        });

                setMembers(
                    result.content,
                );

                setMemberTotalPages(
                    result.totalPages,
                );

                setMemberTotalElements(
                    result.totalElements,
                );
            } catch (error) {
                setMembers([]);

                setMemberTotalPages(
                    0,
                );

                setMemberTotalElements(
                    0,
                );

                void showAlert.error(
                    "Không thể tìm hội viên",
                    getApiErrorMessage(
                        error,
                    ),
                );
            } finally {
                setLoadingMembers(
                    false,
                );
            }
        }, [
            memberPage,
            memberSearch,
        ]);

    useEffect(() => {
        if (!isMemberPickerOpen) {
            return;
        }

        const timeoutId =
            window.setTimeout(
                () => {
                    void fetchMembers();
                },
                250,
            );

        return () =>
            window.clearTimeout(
                timeoutId,
            );
    }, [
        fetchMembers,
        isMemberPickerOpen,
    ]);

    // =====================================================
    // OPEN ASSIGN MODAL
    // =====================================================

    const handleOpenAssignModal =
        () => {
            setPickerPurpose(
                "assign",
            );

            reset({
                memberId: "",
                gymPackageId: "",
                packageDurationId: "",
                note: "",
            });

            setSelectedMember(
                null,
            );

            setMemberSearch("");

            setMemberPage(0);

            setIsAssignModalOpen(
                true,
            );

            if (
                packages.length ===
                0 ||
                durations.length ===
                0
            ) {
                void fetchFormData();
            }
        };

    // =====================================================
    // ASSIGN SUBSCRIPTION
    // =====================================================

    const onSubmitAssign =
        async (
            data:
            SubscriptionAssignForm,
        ) => {
            const memberId =
                Number(
                    data.memberId,
                );

            const gymPackageId =
                Number(
                    data.gymPackageId,
                );

            const packageDurationId =
                Number(
                    data.packageDurationId,
                );

            if (
                !memberId ||
                !gymPackageId ||
                !packageDurationId
            ) {
                void showAlert.error(
                    "Thiếu thông tin",
                    "Vui lòng chọn đầy đủ hội viên, gói tập và thời lượng.",
                );

                return;
            }

            const selectedDuration =
                durations.find(
                    (duration) =>
                        Number(
                            duration.id,
                        ) ===
                        packageDurationId,
                );

            if (
                !selectedDuration ||
                Number(
                    selectedDuration
                        .gymPackageId,
                ) !==
                gymPackageId
            ) {
                void showAlert.error(
                    "Thời lượng không hợp lệ",
                    "Thời lượng đã chọn không thuộc gói tập hiện tại.",
                );

                return;
            }

            try {
                setIsSubmitting(true);

                const requestData:
                    CreateSubscriptionRequest =
                    {
                        gymPackageId:
                        gymPackageId,

                        packageDurationId:
                        packageDurationId,

                        paidCash: true,

                        note:
                            data.note
                                ?.trim() ||
                            undefined,
                    };

                await subscriptionService
                    .createSubscriptionForMemberByStaff(
                        memberId,
                        requestData,
                    );

                setIsAssignModalOpen(
                    false,
                );

                reset({
                    memberId: "",
                    gymPackageId: "",
                    packageDurationId: "",
                    note: "",
                });

                setSelectedMember(
                    null,
                );

                await showAlert.success(
                    "Đăng ký thành công",
                    "Gói tập đã được kích hoạt và ghi nhận thanh toán tiền mặt.",
                );

                setCurrentPage(0);

                await fetchSubscriptions();
            } catch (error) {
                void showAlert.error(
                    "Đăng ký gói thất bại",
                    getApiErrorMessage(
                        error,
                    ),
                );
            } finally {
                setIsSubmitting(
                    false,
                );
            }
        };

    // =====================================================
    // TRANSFER
    // =====================================================

    const handleOpenTransferModal =
        (
            subscription:
            Subscription,
        ) => {
            setSelectedSubToTransfer(
                subscription,
            );

            setTransferRecipient(
                null,
            );

            setTransferNote("");

            setIsTransferModalOpen(
                true,
            );
        };

    const handleOpenTransferPicker =
        () => {
            setPickerPurpose(
                "transfer",
            );

            setMemberSearch("");

            setMemberPage(0);

            setIsMemberPickerOpen(
                true,
            );
        };

    const onSubmitTransfer =
        async (
            event:
            React.FormEvent,
        ) => {
            event.preventDefault();

            if (
                !selectedSubToTransfer ||
                !transferRecipient
            ) {
                void showAlert.error(
                    "Thiếu thông tin",
                    "Vui lòng chọn hội viên nhận chuyển nhượng.",
                );

                return;
            }

            if (
                transferRecipient.id ===
                selectedSubToTransfer.memberId
            ) {
                void showAlert.error(
                    "Hội viên không hợp lệ",
                    "Không thể chuyển gói cho chính hội viên hiện tại.",
                );

                return;
            }

            try {
                setIsSubmitting(true);

                await subscriptionService
                    .transferSubscription(
                        selectedSubToTransfer.id,
                        transferRecipient.id,
                        transferNote.trim(),
                    );

                setIsTransferModalOpen(
                    false,
                );

                setSelectedSubToTransfer(
                    null,
                );

                setTransferRecipient(
                    null,
                );

                setTransferNote("");

                await showAlert.success(
                    "Thành công",
                    "Đã chuyển gói tập sang hội viên mới.",
                );

                await fetchSubscriptions();
            } catch (error) {
                void showAlert.error(
                    "Không thể chuyển gói",
                    getApiErrorMessage(
                        error,
                    ),
                );
            } finally {
                setIsSubmitting(
                    false,
                );
            }
        };

    // =====================================================
    // CANCEL
    // =====================================================

    const canCancelSubscription =
        (
            subscription:
            Subscription,
        ) =>
            subscription.status ===
            "ACTIVE" ||
            subscription.status ===
            "PENDING_PAYMENT";

    const canTransferSubscription =
        (
            subscription:
            Subscription,
        ) =>
            subscription.status ===
            "ACTIVE";

    const handleCancelSubscription =
        async (
            subscription:
            Subscription,
        ) => {
            if (
                !canCancelSubscription(
                    subscription,
                )
            ) {
                return;
            }

            const isPending =
                subscription.status ===
                "PENDING_PAYMENT";

            const result =
                await showAlert.confirm(
                    isPending
                        ? "Hủy đăng ký gói?"
                        : "Hủy gói tập?",

                    isPending
                        ? "Đăng ký đang chờ thanh toán sẽ bị hủy. Sau khi hủy, hội viên có thể đăng ký lại gói khác."
                        : "Gói tập đang hoạt động sẽ bị hủy và không thể tiếp tục sử dụng.",

                    {
                        confirmButtonText:
                            "Xác nhận hủy",

                        cancelButtonText:
                            "Quay lại",
                    },
                );

            if (
                !result.isConfirmed
            ) {
                return;
            }

            try {
                setCancellingSubscriptionId(
                    subscription.id,
                );

                await subscriptionService
                    .cancelSubscriptionAdmin(
                        subscription.id,
                    );

                await showAlert.success(
                    "Đã hủy gói tập",
                    isPending
                        ? "Đăng ký chờ thanh toán đã được hủy."
                        : "Gói tập của hội viên đã được hủy.",
                );

                await fetchSubscriptions();
            } catch (error) {
                void showAlert.error(
                    "Không thể hủy gói tập",
                    getApiErrorMessage(
                        error,
                    ),
                );
            } finally {
                setCancellingSubscriptionId(
                    null,
                );
            }
        };

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredSubscriptions =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return subscriptions;
            }

            return subscriptions.filter(
                (subscription) =>
                    (
                        subscription
                            .memberName ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            keyword,
                        ) ||
                    (
                        subscription
                            .gymPackageName ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            keyword,
                        ),
            );
        }, [
            subscriptions,
            search,
        ]);

    // =====================================================
    // STATUS BADGE
    // =====================================================

    const getStatusBadge =
        (
            status:
            SubscriptionStatus,
        ) => {
            switch (status) {
                case "ACTIVE":
                    return (
                        <Badge variant="success">
                            Đang hoạt động
                        </Badge>
                    );

                case "PENDING_PAYMENT":
                    return (
                        <Badge variant="warning">
                            Chờ thanh toán
                        </Badge>
                    );

                case "EXPIRED":
                    return (
                        <Badge variant="default">
                            Đã hết hạn
                        </Badge>
                    );

                case "CANCELLED":
                    return (
                        <Badge variant="danger">
                            Đã hủy
                        </Badge>
                    );

                default:
                    return (
                        <Badge variant="default">
                            {status}
                        </Badge>
                    );
            }
        };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="space-y-6 pb-24">
            {/* HEADER */}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    md:flex-row
                    md:items-center
                    md:justify-between
                "
            >
                <div>
                    <h1
                        className="
                            flex
                            items-center
                            gap-2
                            text-2xl
                            font-bold
                            text-slate-900
                        "
                    >
                        <CreditCard
                            className="
                                h-6
                                w-6
                                text-blue-600
                            "
                        />

                        Quản lý Subscription
                    </h1>

                    <p
                        className="
                            mt-1
                            text-slate-500
                        "
                    >
                        Quản lý đăng ký và gói tập của hội viên
                    </p>
                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >
                    <div className="w-full md:w-64">
                        <Input
                            icon={
                                <Search
                                    className="
                                        h-5
                                        w-5
                                        text-slate-400
                                    "
                                />
                            }
                            placeholder="Tìm hội viên, tên gói..."
                            value={search}
                            onChange={(
                                event,
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </div>

                    <Button
                        onClick={
                            handleOpenAssignModal
                        }
                        className="
                            flex
                            flex-shrink-0
                            items-center
                            gap-2
                            bg-gradient-to-r
                            from-blue-600
                            to-indigo-600
                            shadow-lg
                            shadow-blue-500/20
                        "
                    >
                        <Plus className="h-5 w-5" />

                        Gán gói tập
                    </Button>
                </div>
            </div>

            {/* TABLE */}

            <Card
                className="
                    overflow-hidden
                    border-0
                    shadow-lg
                    shadow-slate-200/50
                "
            >
                <div className="overflow-x-auto">
                    <table
                        className="
                            w-full
                            whitespace-nowrap
                            text-left
                            text-sm
                        "
                    >
                        <thead
                            className="
                                border-b
                                border-slate-200
                                bg-slate-50/80
                                text-xs
                                font-semibold
                                uppercase
                                text-slate-500
                            "
                        >
                        <tr>
                            <th className="px-6 py-4">
                                ID
                            </th>

                            <th className="px-6 py-4">
                                Hội viên
                            </th>

                            <th className="px-6 py-4">
                                Gói tập
                            </th>

                            <th className="px-6 py-4">
                                Thời lượng
                            </th>

                            <th className="px-6 py-4">
                                Ngày hiệu lực
                            </th>

                            <th className="px-6 py-4">
                                Trạng thái
                            </th>

                            <th
                                className="
                                        px-6
                                        py-4
                                        text-right
                                    "
                            >
                                Thao tác
                            </th>
                        </tr>
                        </thead>

                        <tbody
                            className="
                                divide-y
                                divide-slate-100
                            "
                        >
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={
                                        7
                                    }
                                    className="
                                            px-6
                                            py-12
                                            text-center
                                        "
                                >
                                    <div
                                        className="
                                                flex
                                                justify-center
                                            "
                                    >
                                        <div
                                            className="
                                                    h-8
                                                    w-8
                                                    animate-spin
                                                    rounded-full
                                                    border-4
                                                    border-blue-600
                                                    border-t-transparent
                                                "
                                        />
                                    </div>
                                </td>
                            </tr>
                        ) : filteredSubscriptions
                            .length ===
                        0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        7
                                    }
                                    className="
                                            px-6
                                            py-12
                                            text-center
                                            text-slate-500
                                        "
                                >
                                    Không tìm thấy dữ liệu.
                                </td>
                            </tr>
                        ) : (
                            filteredSubscriptions.map(
                                (
                                    subscription,
                                ) => {
                                    const canCancel =
                                        canCancelSubscription(
                                            subscription,
                                        );

                                    const canTransfer =
                                        canTransferSubscription(
                                            subscription,
                                        );

                                    const isCancelling =
                                        cancellingSubscriptionId ===
                                        subscription.id;

                                    return (
                                        <tr
                                            key={
                                                subscription.id
                                            }
                                            className="
                                                    transition-colors
                                                    hover:bg-slate-50/80
                                                "
                                        >
                                            <td
                                                className="
                                                        px-6
                                                        py-4
                                                        font-medium
                                                        text-slate-700
                                                    "
                                            >
                                                #
                                                {
                                                    subscription.id
                                                }
                                            </td>

                                            <td className="px-6 py-4">
                                                <div
                                                    className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                        "
                                                >
                                                    <UserCircle
                                                        className="
                                                                h-5
                                                                w-5
                                                                text-slate-400
                                                            "
                                                    />

                                                    <span
                                                        className="
                                                                font-semibold
                                                                text-slate-800
                                                            "
                                                    >
                                                            {
                                                                subscription.memberName ||
                                                                subscription.memberId
                                                            }
                                                        </span>
                                                </div>
                                            </td>

                                            <td
                                                className="
                                                        px-6
                                                        py-4
                                                        font-medium
                                                        text-slate-800
                                                    "
                                            >
                                                {
                                                    subscription.gymPackageName
                                                }
                                            </td>

                                            <td
                                                className="
                                                        px-6
                                                        py-4
                                                        text-slate-600
                                                    "
                                            >
                                                {
                                                    subscription.packageDurationName
                                                }
                                            </td>

                                            <td
                                                className="
                                                        px-6
                                                        py-4
                                                        text-slate-600
                                                    "
                                            >
                                                {subscription.startDate
                                                    ? new Date(
                                                        subscription.startDate,
                                                    ).toLocaleDateString(
                                                        "vi-VN",
                                                    )
                                                    : "Chưa kích hoạt"}

                                                <br />

                                                {subscription.endDate && (
                                                    <span
                                                        className="
                                                                text-xs
                                                                text-slate-400
                                                            "
                                                    >
                                                            Đến:{" "}
                                                        {new Date(
                                                            subscription.endDate,
                                                        ).toLocaleDateString(
                                                            "vi-VN",
                                                        )}
                                                        </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(
                                                    subscription.status,
                                                )}
                                            </td>

                                            <td
                                                className="
                                                        px-6
                                                        py-4
                                                        text-right
                                                    "
                                            >
                                                {canTransfer ||
                                                canCancel ? (
                                                    <div
                                                        className="
                                                                flex
                                                                justify-end
                                                                gap-2
                                                            "
                                                    >
                                                        {canTransfer && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenTransferModal(
                                                                        subscription,
                                                                    )
                                                                }
                                                                className="
                                                                        rounded-lg
                                                                        bg-blue-50
                                                                        px-3
                                                                        py-1.5
                                                                        text-xs
                                                                        font-semibold
                                                                        text-blue-600
                                                                        transition-colors
                                                                        hover:bg-blue-600
                                                                        hover:text-white
                                                                    "
                                                            >
                                                                Chuyển gói
                                                            </button>
                                                        )}

                                                        {canCancel && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    isCancelling
                                                                }
                                                                onClick={() =>
                                                                    void handleCancelSubscription(
                                                                        subscription,
                                                                    )
                                                                }
                                                                className="
                                                                        rounded-lg
                                                                        bg-red-50
                                                                        px-3
                                                                        py-1.5
                                                                        text-xs
                                                                        font-semibold
                                                                        text-red-600
                                                                        transition-colors
                                                                        hover:bg-red-600
                                                                        hover:text-white
                                                                        disabled:cursor-not-allowed
                                                                        disabled:opacity-50
                                                                    "
                                                            >
                                                                {isCancelling
                                                                    ? "Đang hủy..."
                                                                    : subscription.status ===
                                                                    "PENDING_PAYMENT"
                                                                        ? "Hủy đăng ký"
                                                                        : "Hủy gói"}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span
                                                        className="
                                                                text-xs
                                                                text-slate-400
                                                            "
                                                    >
                                                            Không có thao tác
                                                        </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                },
                            )
                        )}
                        </tbody>
                    </table>
                </div>

                {!loading && (
                    <Pagination
                        currentPage={
                            currentPage
                        }
                        pageSize={
                            pageSize
                        }
                        totalItems={
                            totalElements
                        }
                        onPageChange={
                            setCurrentPage
                        }
                        onPageSizeChange={(
                            size,
                        ) => {
                            setPageSize(
                                size,
                            );

                            setCurrentPage(
                                0,
                            );
                        }}
                    />
                )}
            </Card>

            {/* =====================================================
                ASSIGN MODAL
            ===================================================== */}

            <Modal
                open={
                    isAssignModalOpen
                }
                onClose={() =>
                    setIsAssignModalOpen(
                        false,
                    )
                }
                title="Gán Gói Tập Cho Hội Viên"
                size="xl"
            >
                {loadingFormData ? (
                    <Loading label="Đang tải danh mục gói tập..." />
                ) : (
                    <form
                        onSubmit={
                            handleSubmit(
                                onSubmitAssign,
                            )
                        }
                        className="space-y-5"
                    >
                        {/* MEMBER */}

                        <div className="space-y-2">
                            <label
                                className="
                                    text-sm
                                    font-bold
                                    text-slate-700
                                "
                            >
                                Hội viên (*)
                            </label>

                            <input
                                type="hidden"
                                {...register(
                                    "memberId",
                                    {
                                        required:
                                            "Vui lòng chọn hội viên",
                                    },
                                )}
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    setPickerPurpose(
                                        "assign",
                                    );

                                    setMemberSearch(
                                        "",
                                    );

                                    setMemberPage(
                                        0,
                                    );

                                    setIsMemberPickerOpen(
                                        true,
                                    );
                                }}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-xl
                                    border
                                    border-slate-300
                                    bg-white
                                    px-4
                                    py-3
                                    text-left
                                    transition-colors
                                    hover:border-blue-400
                                    hover:bg-blue-50
                                "
                            >
                                {selectedMember ? (
                                    <span>
                                        <span
                                            className="
                                                block
                                                font-semibold
                                                text-slate-800
                                            "
                                        >
                                            {
                                                selectedMember.fullName
                                            }
                                        </span>

                                        <span
                                            className="
                                                block
                                                text-xs
                                                text-slate-500
                                            "
                                        >
                                            {
                                                selectedMember.memberCode
                                            }
                                            {" · "}
                                            {
                                                selectedMember.email
                                            }
                                        </span>
                                    </span>
                                ) : (
                                    <span
                                        className="
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        Chọn hội viên để đăng ký gói
                                    </span>
                                )}

                                <span
                                    className="
                                        ml-3
                                        shrink-0
                                        rounded-lg
                                        bg-blue-600
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-semibold
                                        text-white
                                    "
                                >
                                    Chọn hội viên
                                </span>
                            </button>

                            {errors.memberId && (
                                <p
                                    className="
                                        text-xs
                                        text-red-500
                                    "
                                >
                                    {
                                        errors
                                            .memberId
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        <div
                            className="
                                grid
                                gap-5
                                md:grid-cols-2
                            "
                        >
                            {/* PACKAGE */}

                            <div className="space-y-1.5">
                                <label
                                    className="
                                        text-sm
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    Gói tập (*)
                                </label>

                                <select
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        bg-white
                                        px-4
                                        py-2.5
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                    {...register(
                                        "gymPackageId",
                                        {
                                            required:
                                                "Vui lòng chọn gói tập",
                                        },
                                    )}
                                >
                                    <option value="">
                                        -- Chọn gói tập --
                                    </option>

                                    {packages
                                        .filter(
                                            (
                                                gymPackage,
                                            ) =>
                                                String(
                                                    gymPackage.status,
                                                ).toUpperCase() ===
                                                "ACTIVE",
                                        )
                                        .map(
                                            (
                                                gymPackage,
                                            ) => (
                                                <option
                                                    key={
                                                        gymPackage.id
                                                    }
                                                    value={
                                                        gymPackage.id
                                                    }
                                                >
                                                    {
                                                        gymPackage.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                </select>

                                {errors.gymPackageId && (
                                    <p
                                        className="
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {
                                            errors
                                                .gymPackageId
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* DURATION */}

                            <div className="space-y-1.5">
                                <label
                                    className="
                                        text-sm
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    Thời lượng (*)
                                </label>

                                <select
                                    disabled={
                                        !selectedGymPackageId
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        bg-white
                                        px-4
                                        py-2.5
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                        disabled:cursor-not-allowed
                                        disabled:bg-slate-100
                                        disabled:text-slate-400
                                    "
                                    {...register(
                                        "packageDurationId",
                                        {
                                            required:
                                                "Vui lòng chọn thời lượng",
                                        },
                                    )}
                                >
                                    <option value="">
                                        {!selectedGymPackageId
                                            ? "-- Chọn gói tập trước --"
                                            : "-- Chọn thời lượng --"}
                                    </option>

                                    {availableDurations.map(
                                        (
                                            duration,
                                        ) => (
                                            <option
                                                key={
                                                    duration.id
                                                }
                                                value={
                                                    duration.id
                                                }
                                            >
                                                {
                                                    duration.name
                                                }
                                                {" ("}
                                                {
                                                    duration.months
                                                }
                                                {
                                                    " tháng)"
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>

                                {errors.packageDurationId && (
                                    <p
                                        className="
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {
                                            errors
                                                .packageDurationId
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* NOTE */}

                            <div className="md:col-span-2">
                                <Input
                                    label="Ghi chú thêm"
                                    placeholder="Tặng nhân dịp sinh nhật..."
                                    {...register(
                                        "note",
                                    )}
                                />
                            </div>
                        </div>

                        <div
                            className="
                                flex
                                justify-end
                                gap-3
                                pt-4
                            "
                        >
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setIsAssignModalOpen(
                                        false,
                                    )
                                }
                            >
                                Hủy
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting
                                }
                                className="
                                    bg-blue-600
                                    text-white
                                "
                            >
                                {isSubmitting
                                    ? "Đang xử lý..."
                                    : "Xác nhận gán gói"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* =====================================================
                TRANSFER MODAL
            ===================================================== */}

            <Modal
                open={
                    isTransferModalOpen
                }
                onClose={() =>
                    setIsTransferModalOpen(
                        false,
                    )
                }
                title="Chuyển Nhượng Gói Tập"
                size="xl"
            >
                {selectedSubToTransfer && (
                    <form
                        onSubmit={
                            onSubmitTransfer
                        }
                        className="space-y-5"
                    >
                        <div
                            className="
                                space-y-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                p-4
                            "
                        >
                            <h3
                                className="
                                    text-sm
                                    font-bold
                                    text-slate-800
                                "
                            >
                                Gói tập cần chuyển nhượng:
                            </h3>

                            <p
                                className="
                                    text-sm
                                    text-slate-700
                                "
                            >
                                <strong>
                                    Gói tập:
                                </strong>{" "}
                                {
                                    selectedSubToTransfer
                                        .gymPackageName
                                }
                                {" ("}
                                {
                                    selectedSubToTransfer
                                        .packageDurationName
                                }
                                {")"}
                            </p>

                            <p
                                className="
                                    text-sm
                                    text-slate-700
                                "
                            >
                                <strong>
                                    Hội viên hiện tại:
                                </strong>{" "}
                                {
                                    selectedSubToTransfer
                                        .memberName
                                }
                                {" (Mã: "}
                                {
                                    selectedSubToTransfer
                                        .memberCode
                                }
                                {")"}
                            </p>

                            <p
                                className="
                                    text-sm
                                    text-slate-700
                                "
                            >
                                <strong>
                                    Thời hạn:
                                </strong>{" "}
                                {selectedSubToTransfer.startDate
                                    ? new Date(
                                        selectedSubToTransfer.startDate,
                                    ).toLocaleDateString(
                                        "vi-VN",
                                    )
                                    : "Chưa bắt đầu"}
                                {" - "}
                                {selectedSubToTransfer.endDate
                                    ? new Date(
                                        selectedSubToTransfer.endDate,
                                    ).toLocaleDateString(
                                        "vi-VN",
                                    )
                                    : "Chưa kết thúc"}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label
                                className="
                                    text-sm
                                    font-bold
                                    text-slate-700
                                "
                            >
                                Hội viên nhận chuyển nhượng (*)
                            </label>

                            <button
                                type="button"
                                onClick={
                                    handleOpenTransferPicker
                                }
                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-xl
                                    border
                                    border-slate-300
                                    bg-white
                                    px-4
                                    py-3
                                    text-left
                                    transition-colors
                                    hover:border-blue-400
                                    hover:bg-blue-50
                                "
                            >
                                {transferRecipient ? (
                                    <span>
                                        <span
                                            className="
                                                block
                                                font-semibold
                                                text-slate-800
                                            "
                                        >
                                            {
                                                transferRecipient.fullName
                                            }
                                        </span>

                                        <span
                                            className="
                                                block
                                                text-xs
                                                text-slate-500
                                            "
                                        >
                                            {
                                                transferRecipient.memberCode
                                            }
                                            {" · "}
                                            {
                                                transferRecipient.email
                                            }
                                        </span>
                                    </span>
                                ) : (
                                    <span
                                        className="
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        Chọn hội viên nhận gói tập...
                                    </span>
                                )}

                                <span
                                    className="
                                        ml-3
                                        shrink-0
                                        rounded-lg
                                        bg-blue-600
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-semibold
                                        text-white
                                    "
                                >
                                    Chọn hội viên
                                </span>
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                className="
                                    text-sm
                                    font-bold
                                    text-slate-700
                                "
                            >
                                Lý do / Ghi chú
                            </label>

                            <textarea
                                value={
                                    transferNote
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setTransferNote(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Nhập lý do chuyển nhượng gói tập..."
                                className="
                                    h-24
                                    w-full
                                    resize-none
                                    rounded-xl
                                    border
                                    border-slate-300
                                    px-4
                                    py-2
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />
                        </div>

                        <div
                            className="
                                flex
                                justify-end
                                gap-3
                                pt-4
                            "
                        >
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setIsTransferModalOpen(
                                        false,
                                    )
                                }
                            >
                                Hủy
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    !transferRecipient
                                }
                                className="
                                    bg-blue-600
                                    text-white
                                "
                            >
                                {isSubmitting
                                    ? "Đang xử lý..."
                                    : "Xác nhận chuyển gói"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* =====================================================
                MEMBER PICKER
            ===================================================== */}

            <Modal
                open={
                    isMemberPickerOpen
                }
                onClose={() =>
                    setIsMemberPickerOpen(
                        false,
                    )
                }
                title="Chọn hội viên"
                size="xl"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                h-5
                                w-5
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <input
                            autoFocus
                            type="search"
                            value={
                                memberSearch
                            }
                            onChange={(
                                event,
                            ) => {
                                setMemberSearch(
                                    event
                                        .target
                                        .value,
                                );

                                setMemberPage(
                                    0,
                                );
                            }}
                            placeholder="Tìm theo tên, mã hội viên, email hoặc số điện thoại..."
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-300
                                bg-white
                                py-3
                                pl-11
                                pr-4
                                text-sm
                                outline-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                            "
                        />
                    </div>

                    <div
                        className="
                            grid
                            max-h-[48vh]
                            gap-2
                            overflow-y-auto
                            pr-1
                            sm:grid-cols-2
                        "
                    >
                        {loadingMembers ? (
                            <p
                                className="
                                    col-span-full
                                    py-10
                                    text-center
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Đang tìm hội viên...
                            </p>
                        ) : members.length ===
                        0 ? (
                            <p
                                className="
                                    col-span-full
                                    py-10
                                    text-center
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Không tìm thấy hội viên phù hợp.
                            </p>
                        ) : (
                            members.map(
                                (
                                    member,
                                ) => {
                                    const isSelected =
                                        pickerPurpose ===
                                        "transfer"
                                            ? transferRecipient?.id ===
                                            member.id
                                            : selectedMember?.id ===
                                            member.id;

                                    const isCurrentOwner =
                                        pickerPurpose ===
                                        "transfer" &&
                                        selectedSubToTransfer
                                            ?.memberId ===
                                        member.id;

                                    return (
                                        <button
                                            key={
                                                member.id
                                            }
                                            type="button"
                                            disabled={
                                                isCurrentOwner
                                            }
                                            onClick={() => {
                                                if (
                                                    isCurrentOwner
                                                ) {
                                                    return;
                                                }

                                                if (
                                                    pickerPurpose ===
                                                    "transfer"
                                                ) {
                                                    setTransferRecipient(
                                                        member,
                                                    );
                                                } else {
                                                    setSelectedMember(
                                                        member,
                                                    );

                                                    setValue(
                                                        "memberId",
                                                        String(
                                                            member.id,
                                                        ),
                                                        {
                                                            shouldValidate:
                                                                true,
                                                            shouldDirty:
                                                                true,
                                                        },
                                                    );
                                                }

                                                setIsMemberPickerOpen(
                                                    false,
                                                );
                                            }}
                                            className={`
                                                rounded-xl
                                                border
                                                p-4
                                                text-left
                                                transition-all
                                                ${
                                                isCurrentOwner
                                                    ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                                                    : "hover:border-blue-400 hover:bg-blue-50"
                                            }
                                                ${
                                                isSelected
                                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                                    : !isCurrentOwner
                                                        ? "border-slate-200 bg-white"
                                                        : ""
                                            }
                                            `}
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-3
                                                "
                                            >
                                                <span className="min-w-0">
                                                    <span
                                                        className="
                                                            block
                                                            truncate
                                                            font-semibold
                                                            text-slate-800
                                                        "
                                                    >
                                                        {
                                                            member.fullName
                                                        }
                                                    </span>

                                                    <span
                                                        className="
                                                            mt-1
                                                            block
                                                            text-xs
                                                            font-medium
                                                            text-blue-600
                                                        "
                                                    >
                                                        {
                                                            member.memberCode
                                                        }
                                                    </span>

                                                    <span
                                                        className="
                                                            mt-1
                                                            block
                                                            truncate
                                                            text-xs
                                                            text-slate-500
                                                        "
                                                    >
                                                        {
                                                            member.email
                                                        }
                                                    </span>

                                                    {member.phone && (
                                                        <span
                                                            className="
                                                                mt-1
                                                                block
                                                                text-xs
                                                                text-slate-500
                                                            "
                                                        >
                                                            {
                                                                member.phone
                                                            }
                                                        </span>
                                                    )}

                                                    {isCurrentOwner && (
                                                        <span
                                                            className="
                                                                mt-2
                                                                block
                                                                text-xs
                                                                font-semibold
                                                                text-amber-600
                                                            "
                                                        >
                                                            Hội viên hiện tại
                                                        </span>
                                                    )}
                                                </span>

                                                {isSelected && (
                                                    <CheckCircle2
                                                        className="
                                                            h-5
                                                            w-5
                                                            shrink-0
                                                            text-blue-600
                                                        "
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    );
                                },
                            )
                        )}
                    </div>

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-t
                            border-slate-100
                            pt-3
                            text-sm
                            text-slate-500
                        "
                    >
                        <span>
                            {
                                memberTotalElements
                            }{" "}
                            hội viên phù hợp
                        </span>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setMemberPage(
                                        (
                                            page,
                                        ) =>
                                            Math.max(
                                                0,
                                                page -
                                                1,
                                            ),
                                    )
                                }
                                disabled={
                                    memberPage ===
                                    0 ||
                                    loadingMembers
                                }
                                className="
                                    rounded-lg
                                    border
                                    border-slate-200
                                    p-2
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                                aria-label="Trang hội viên trước"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span>
                                Trang{" "}
                                {memberTotalPages ===
                                0
                                    ? 0
                                    : memberPage +
                                    1}
                                /
                                {
                                    memberTotalPages
                                }
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setMemberPage(
                                        (
                                            page,
                                        ) =>
                                            Math.min(
                                                Math.max(
                                                    0,
                                                    memberTotalPages -
                                                    1,
                                                ),
                                                page +
                                                1,
                                            ),
                                    )
                                }
                                disabled={
                                    memberPage >=
                                    memberTotalPages -
                                    1 ||
                                    loadingMembers
                                }
                                className="
                                    rounded-lg
                                    border
                                    border-slate-200
                                    p-2
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                                aria-label="Trang hội viên sau"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}