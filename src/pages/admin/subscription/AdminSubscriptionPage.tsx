import { useCallback, useEffect, useState } from "react";
import { 
    Search, 
    Plus, 
    CreditCard, 
    X,
    Calendar,
    UserCircle,
    Activity,
    CheckCircle2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";

import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import Loading from "../../../components/common/Loading";
import Pagination from "../../../components/common/Pagination";

import { subscriptionService } from "../../../services/subscriptionService";
import { memberService } from "../../../services/memberService";
import { packageService } from "../../../services/packageService";
import { getApiErrorMessage } from "../../../utils/apiError";
import { showAlert } from "../../../utils/alert";

import type { Subscription, CreateSubscriptionRequest, SubscriptionStatus } from "../../../types/subscription.type";
import type { MemberProfile } from "../../../types/member.type";
import type { GymPackage, PackageDuration } from "../../../types/package.type";

const DEFAULT_PAGE_SIZE = 10;

export default function AdminSubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalElements, setTotalElements] = useState(0);
    
    // Modal states
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState<"ASSIGN" | "TRANSFER">("ASSIGN");
    const [members, setMembers] = useState<MemberProfile[]>([]);
    const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
    const [memberSearch, setMemberSearch] = useState("");
    const [memberPage, setMemberPage] = useState(0);
    const [memberTotalPages, setMemberTotalPages] = useState(0);
    const [memberTotalElements, setMemberTotalElements] = useState(0);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [packages, setPackages] = useState<GymPackage[]>([]);
    const [durations, setDurations] = useState<PackageDuration[]>([]);
    const [loadingFormData, setLoadingFormData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateSubscriptionRequest & { memberId: string }>({
        defaultValues: {
            memberId: "",
            gymPackageId: undefined,
            packageDurationId: undefined,
            note: ""
        }
    });

    const fetchSubscriptions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await subscriptionService.getAdminSubscriptions({
                page: currentPage,
                size: pageSize,
            });
            setSubscriptions(data.content);
            setTotalElements(data.totalElements);
        } catch (error) {
            setSubscriptions([]);
            setTotalElements(0);
            void showAlert.error("Không thể tải danh sách", getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        void fetchSubscriptions();
    }, [fetchSubscriptions]);

    const fetchFormData = async () => {
        try {
            setLoadingFormData(true);
            const [packagesRes, durationsRes] = await Promise.all([
                packageService.getAdminPackages(),
                packageService.getAdminPackageDurations()
            ]);
            setPackages(packagesRes);
            setDurations(durationsRes);
        } catch (error) {
            void showAlert.error("Không thể tải dữ liệu", getApiErrorMessage(error));
        } finally {
            setLoadingFormData(false);
        }
    };

    const fetchMembers = useCallback(async () => {
        try {
            setLoadingMembers(true);
            const result = await memberService.getMembers({
                page: memberPage,
                size: 10,
                keyword: memberSearch.trim() || undefined,
                status: "ACTIVE",
                sort: "fullName,asc",
            });
            setMembers(result.content);
            setMemberTotalPages(result.totalPages);
            setMemberTotalElements(result.totalElements);
        } catch (error) {
            setMembers([]);
            setMemberTotalPages(0);
            setMemberTotalElements(0);
            void showAlert.error("Không thể tìm hội viên", getApiErrorMessage(error));
        } finally {
            setLoadingMembers(false);
        }
    }, [memberPage, memberSearch]);

    useEffect(() => {
        if (!isMemberPickerOpen) return;

        const timeoutId = window.setTimeout(() => {
            void fetchMembers();
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [fetchMembers, isMemberPickerOpen]);

    const handleOpenAssignModal = () => {
        setIsAssignModalOpen(true);
        reset();
        setSelectedMember(null);
        setMemberSearch("");
        setMemberPage(0);
        if (packages.length === 0 || durations.length === 0) {
            void fetchFormData();
        }
    };

    const onSubmitAssign = async (data: CreateSubscriptionRequest & { memberId: string }) => {
        try {
            setIsSubmitting(true);
            const requestData: CreateSubscriptionRequest = {
                gymPackageId: Number(data.gymPackageId),
                packageDurationId: Number(data.packageDurationId),
                paidCash: true,
                note: data.note
            };
            await subscriptionService.createSubscriptionForMemberByStaff(Number(data.memberId), requestData);
            setIsAssignModalOpen(false);
            await showAlert.success("Đăng kí thành công", "Gói tập đã được kích hoạt và ghi nhận thanh toán tiền mặt.");
            setCurrentPage(0);
            await fetchSubscriptions();
        } catch (error) {
            void showAlert.error("Đăng kí gói thất bại", getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenUpgrade = (sub: Subscription) => {
        setSelectedSubscription(sub);
        if (packages.length === 0) fetchFormData();
        setIsUpgradeModalOpen(true);
    };

    const handleOpenTransfer = (sub: Subscription) => {
        setSelectedSubscription(sub);
        setSelectedMember(null);
        setIsTransferModalOpen(true);
    };

    const handleUpgradeConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSubscription) return;
        
        const formData = new FormData(e.currentTarget);
        const gymPackageId = Number(formData.get("gymPackageId"));
        const packageDurationId = Number(formData.get("packageDurationId"));
        
        if (!gymPackageId || !packageDurationId) {
            void showAlert.error("Lỗi", "Vui lòng chọn gói tập và thời lượng.");
            return;
        }

        try {
            setIsSubmitting(true);
            await subscriptionService.adminUpgradeSubscription(selectedSubscription.id, { gymPackageId, packageDurationId });
            void showAlert.success("Thành công", "Nâng cấp gói thành công");
            setIsUpgradeModalOpen(false);
            void fetchSubscriptions();
        } catch (error) {
            void showAlert.error("Thất bại", getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTransferConfirm = async () => {
        if (!selectedSubscription || !selectedMember) {
            void showAlert.error("Lỗi", "Vui lòng chọn hội viên để chuyển nhượng.");
            return;
        }
        try {
            setIsSubmitting(true);
            await subscriptionService.adminTransferSubscription(selectedSubscription.id, selectedMember.id);
            void showAlert.success("Thành công", "Chuyển nhượng gói thành công");
            setIsTransferModalOpen(false);
            void fetchSubscriptions();
        } catch (error) {
            void showAlert.error("Thất bại", getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelSubscription = async (id: number) => {
        const result = await showAlert.confirm(
            "Hủy gói tập?",
            "Gói tập sẽ bị hủy và thao tác này không thể hoàn tác.",
            { confirmButtonText: "Hủy gói", cancelButtonText: "Quay lại" }
        );
        if (!result.isConfirmed) return;
        try {
            await subscriptionService.cancelSubscriptionAdmin(id);
            await showAlert.success("Đã hủy gói tập", "Gói tập của hội viên đã được hủy.");
            await fetchSubscriptions();
        } catch (error) {
            void showAlert.error("Không thể hủy gói tập", getApiErrorMessage(error));
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => 
        (sub.memberName || "").toLowerCase().includes(search.toLowerCase()) || 
        (sub.gymPackageName || "").toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status: SubscriptionStatus) => {
        switch (status) {
            case "ACTIVE": return <Badge variant="success">Đang hoạt động</Badge>;
            case "PENDING_PAYMENT": return <Badge variant="warning">Chờ thanh toán</Badge>;
            case "EXPIRED": return <Badge variant="default">Đã hết hạn</Badge>;
            case "CANCELLED": return <Badge variant="danger">Đã hủy</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        Quản lý Subscription
                    </h1>
                    <p className="text-slate-500 mt-1">Quản lý và gán gói tập cho hội viên</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="w-full md:w-64">
                        <Input 
                            icon={<Search className="w-5 h-5 text-slate-400" />}
                            placeholder="Tìm hội viên, tên gói..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={handleOpenAssignModal}
                        className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Gán gói tập
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Hội viên</th>
                                <th className="px-6 py-4">Gói tập</th>
                                <th className="px-6 py-4">Thời lượng</th>
                                <th className="px-6 py-4">Ngày hiệu lực</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy dữ liệu.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">#{sub.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <UserCircle className="w-5 h-5 text-slate-400" />
                                                <span className="font-semibold text-slate-800">{sub.memberName || sub.memberId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{sub.gymPackageName}</td>
                                        <td className="px-6 py-4 text-slate-600">{sub.packageDurationName}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {sub.startDate ? new Date(sub.startDate).toLocaleDateString("vi-VN") : "Chưa kích hoạt"}
                                            <br/>
                                            {sub.endDate && <span className="text-xs text-slate-400">Đến: {new Date(sub.endDate).toLocaleDateString("vi-VN")}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(sub.status)}
                                        </td>
                                          <td className="px-6 py-4 text-right space-x-2">
                                              {sub.status === "ACTIVE" && (
                                                <>
                                                  <button 
                                                      onClick={() => handleOpenUpgrade(sub)}
                                                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                                                  >
                                                      Nâng cấp
                                                  </button>
                                                  <button 
                                                      onClick={() => handleOpenTransfer(sub)}
                                                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors"
                                                  >
                                                      Chuyển nhượng
                                                  </button>
                                                  <button 
                                                      onClick={() => handleCancelSubscription(sub.id)}
                                                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                                  >
                                                      Hủy gói
                                                  </button>
                                                </>
                                              )}
                                          </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={totalElements}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(0);
                        }}
                    />
                )}
            </Card>

            <Modal 
                open={isAssignModalOpen} 
                onClose={() => setIsAssignModalOpen(false)}
                title="Gán Gói Tập Cho Hội Viên"
                size="xl"
            >
                {loadingFormData ? (
                    <Loading label="Đang tải danh mục gói tập..." />
                ) : (
                    <form onSubmit={handleSubmit(onSubmitAssign)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Hội viên (*)</label>
                            <input type="hidden" {...register("memberId", { required: "Vui lòng chọn hội viên" })} />
                            <button
                                type="button"
                                onClick={() => setIsMemberPickerOpen(true)}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
                            >
                                {selectedMember ? (
                                    <span>
                                        <span className="block font-semibold text-slate-800">{selectedMember.fullName}</span>
                                        <span className="block text-xs text-slate-500">{selectedMember.memberCode} · {selectedMember.email}</span>
                                    </span>
                                ) : <span className="text-sm text-slate-500">Chọn hội viên để đăng kí gói</span>}
                                <span className="ml-3 shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Chọn hội viên</span>
                            </button>
                            {errors.memberId && <p className="text-xs text-red-500">{errors.memberId.message}</p>}
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Gói tập (*)</label>
                                <select 
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    {...register("gymPackageId", { required: "Vui lòng chọn gói tập" })}
                                >
                                    <option value="">-- Chọn gói tập --</option>
                                    {packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.gymPackageId && <p className="text-xs text-red-500">{errors.gymPackageId.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Thời lượng (*)</label>
                                <select 
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    {...register("packageDurationId", { required: "Vui lòng chọn thời lượng" })}
                                >
                                    <option value="">-- Chọn thời lượng --</option>
                                    {durations.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.months} tháng)</option>
                                    ))}
                                </select>
                                {errors.packageDurationId && <p className="text-xs text-red-500">{errors.packageDurationId.message}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Input 
                                    label="Ghi chú thêm"
                                    placeholder="Tặng nhân dịp sinh nhật..."
                                    {...register("note")}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsAssignModalOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-blue-600 text-white"
                            >
                                {isSubmitting ? "Đang xử lý..." : "Xác nhận gán gói"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Upgrade Modal */}
            <Modal
                open={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                title="Nâng cấp gói tập"
                size="lg"
            >
                {loadingFormData ? (
                    <Loading label="Đang tải danh mục gói tập..." />
                ) : (
                    <form onSubmit={handleUpgradeConfirm} className="space-y-5">
                        <div className="bg-blue-50 p-4 rounded-xl mb-4">
                            <p className="text-sm text-blue-800 font-medium mb-1">Gói hiện tại: <strong>{selectedSubscription?.gymPackageName}</strong></p>
                            <p className="text-sm text-blue-800 font-medium">Hội viên: <strong>{selectedSubscription?.memberName}</strong></p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Gói tập mới (*)</label>
                            <select 
                                name="gymPackageId"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                required
                            >
                                <option value="">-- Chọn gói tập mới --</option>
                                {packages.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Thời lượng mới (*)</label>
                            <select 
                                name="packageDurationId"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                required
                            >
                                <option value="">-- Chọn thời lượng mới --</option>
                                {durations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.months} tháng)</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsUpgradeModalOpen(false)}>Hủy</Button>
                            <Button type="submit" isLoading={isSubmitting}>Xác nhận Nâng cấp</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Transfer Modal */}
            <Modal
                open={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                title="Chuyển nhượng gói tập"
                size="lg"
            >
                <div className="space-y-5">
                    <div className="bg-amber-50 p-4 rounded-xl mb-4">
                        <p className="text-sm text-amber-800 font-medium mb-1">Đang chuyển gói: <strong>{selectedSubscription?.gymPackageName}</strong></p>
                        <p className="text-sm text-amber-800 font-medium">Từ hội viên: <strong>{selectedSubscription?.memberName}</strong></p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Người nhận (*)</label>
                        <button
                            type="button"
                            onClick={() => { setPickerMode("TRANSFER"); setIsMemberPickerOpen(true); }}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
                        >
                            {selectedMember ? (
                                <span>
                                    <span className="block font-semibold text-slate-800">{selectedMember.fullName}</span>
                                    <span className="mt-0.5 block text-xs text-slate-500">{selectedMember.memberCode}</span>
                                </span>
                            ) : <span className="text-sm text-slate-500">Chọn hội viên nhận gói...</span>}
                            <span className="ml-3 shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">Chọn</span>
                        </button>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsTransferModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleTransferConfirm} isLoading={isSubmitting} disabled={!selectedMember} className="bg-amber-600 hover:bg-amber-700 text-white">Xác nhận Chuyển nhượng</Button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={isMemberPickerOpen}
                onClose={() => setIsMemberPickerOpen(false)}
                title="Chọn hội viên"
                size="xl"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            autoFocus
                            type="search"
                            value={memberSearch}
                            onChange={(event) => {
                                setMemberSearch(event.target.value);
                                setMemberPage(0);
                            }}
                            placeholder="Tìm theo tên, mã hội viên, email hoặc số điện thoại..."
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid max-h-[48vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                        {loadingMembers ? (
                            <p className="col-span-full py-10 text-center text-sm text-slate-500">Đang tìm hội viên...</p>
                        ) : members.length === 0 ? (
                            <p className="col-span-full py-10 text-center text-sm text-slate-500">Không tìm thấy hội viên phù hợp.</p>
                        ) : members.map((member) => (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => {
                                    setSelectedMember(member);
                                    setValue("memberId", String(member.id), { shouldValidate: true });
                                    setIsMemberPickerOpen(false);
                                }}
                                className={`rounded-xl border p-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50 ${selectedMember?.id === member.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 bg-white"}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="min-w-0">
                                        <span className="block truncate font-semibold text-slate-800">{member.fullName}</span>
                                        <span className="mt-1 block text-xs font-medium text-blue-600">{member.memberCode}</span>
                                        <span className="mt-1 block truncate text-xs text-slate-500">{member.email}</span>
                                        {member.phone && <span className="mt-1 block text-xs text-slate-500">{member.phone}</span>}
                                    </span>
                                    {selectedMember?.id === member.id && <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
                        <span>{memberTotalElements} hội viên phù hợp</span>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setMemberPage((page) => Math.max(0, page - 1))} disabled={memberPage === 0 || loadingMembers} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Trang hội viên trước"><ChevronLeft className="h-4 w-4" /></button>
                            <span>Trang {memberTotalPages === 0 ? 0 : memberPage + 1}/{memberTotalPages}</span>
                            <button type="button" onClick={() => setMemberPage((page) => Math.min(Math.max(0, memberTotalPages - 1), page + 1))} disabled={memberPage >= memberTotalPages - 1 || loadingMembers} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Trang hội viên sau"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
