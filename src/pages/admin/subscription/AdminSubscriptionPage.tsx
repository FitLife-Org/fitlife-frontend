import { useEffect, useState } from "react";
import { 
    Search, 
    Plus, 
    CreditCard, 
    X,
    Calendar,
    UserCircle,
    Activity,
    CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";

import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import Loading from "../../../components/common/Loading";

import { subscriptionService } from "../../../services/subscriptionService";
import { userService } from "../../../services/userService";
import { packageService } from "../../../services/packageService";
import { getApiErrorMessage } from "../../../utils/apiError";

import type { Subscription, CreateSubscriptionRequest, SubscriptionStatus } from "../../../types/subscription.type";
import type { User } from "../../../types/user.type";
import type { GymPackage, PackageDuration } from "../../../types/package.type";

export default function AdminSubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Modal states
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [members, setMembers] = useState<User[]>([]);
    const [packages, setPackages] = useState<GymPackage[]>([]);
    const [durations, setDurations] = useState<PackageDuration[]>([]);
    const [loadingFormData, setLoadingFormData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CreateSubscriptionRequest & { memberId: string }>({
        defaultValues: {
            memberId: "",
            gymPackageId: undefined,
            packageDurationId: undefined,
            note: ""
        }
    });

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const data = await subscriptionService.getAdminSubscriptions();
            setSubscriptions(data);
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchSubscriptions();
    }, []);

    const fetchFormData = async () => {
        try {
            setLoadingFormData(true);
            const [usersRes, packagesRes, durationsRes] = await Promise.all([
                userService.getUsers({ roleCode: "ROLE_MEMBER", size: 100 }), // Get up to 100 members for dropdown
                packageService.getAdminPackages(),
                packageService.getAdminPackageDurations()
            ]);
            setMembers(usersRes.content);
            setPackages(packagesRes);
            setDurations(durationsRes);
        } catch (error) {
            toast.error("Không thể tải dữ liệu: " + getApiErrorMessage(error));
        } finally {
            setLoadingFormData(false);
        }
    };

    const handleOpenAssignModal = () => {
        setIsAssignModalOpen(true);
        reset();
        if (members.length === 0 || packages.length === 0) {
            void fetchFormData();
        }
    };

    const onSubmitAssign = async (data: CreateSubscriptionRequest & { memberId: string }) => {
        try {
            setIsSubmitting(true);
            const requestData: CreateSubscriptionRequest = {
                gymPackageId: Number(data.gymPackageId),
                packageDurationId: Number(data.packageDurationId),
                note: data.note
            };
            await subscriptionService.createSubscriptionForMemberByStaff(Number(data.memberId), requestData);
            toast.success("Đã gán gói tập thành công!");
            setIsAssignModalOpen(false);
            void fetchSubscriptions();
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelSubscription = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn hủy gói tập này?")) return;
        try {
            await subscriptionService.cancelSubscriptionAdmin(id);
            toast.success("Hủy gói tập thành công!");
            void fetchSubscriptions();
        } catch (error) {
            toast.error(getApiErrorMessage(error));
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
                                                <button 
                                                    onClick={() => handleCancelSubscription(sub.id)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                                >
                                                    Hủy gói
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal 
                open={isAssignModalOpen} 
                onClose={() => setIsAssignModalOpen(false)}
                title="Gán Gói Tập Cho Hội Viên"
            >
                {loadingFormData ? (
                    <Loading label="Đang tải danh mục gói tập..." />
                ) : (
                    <form onSubmit={handleSubmit(onSubmitAssign)} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Hội viên (*)</label>
                            <select 
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                {...register("memberId", { required: "Vui lòng chọn hội viên" })}
                            >
                                <option value="">-- Chọn hội viên --</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                                ))}
                            </select>
                            {errors.memberId && <p className="text-xs text-red-500">{errors.memberId.message}</p>}
                        </div>

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

                        <Input 
                            label="Ghi chú thêm"
                            placeholder="Tặng nhân dịp sinh nhật..."
                            {...register("note")}
                        />

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
        </div>
    );
}
