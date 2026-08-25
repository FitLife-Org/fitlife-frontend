import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Search,
    Plus,
    Eye,
    Edit2,
    Layers,
    CheckCircle2,
    Wrench,
    XCircle,
    CalendarClock,
    MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";

import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";

import Pagination from "../../../components/common/Pagination";

import {
    EquipmentService,
} from "../../../services/equipmentService";

import type {
    Equipment,
    EquipmentStatus,
    EquipmentSummary,
} from "../../../types/equipment.type";

import { useAuthStore } from "../../../store/authStore";

const INITIAL_SUMMARY:
    EquipmentSummary = {
    total: 0,

    active: {
        count: 0,
        percentage: 0,
    },

    maintenance: {
        count: 0,
        percentage: 0,
    },

    inactive: {
        count: 0,
        percentage: 0,
    },

    upcomingMaintenance: {
        count: 0,
        timeFrame: "Trong 7 ngày tới",
    },
};

export default function EquipmentManagementPage() {
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.roles.includes("ROLE_ADMIN") ?? false;

    const [searchTerm, setSearchTerm] =
        useState("");

    const [
        submittedSearchTerm,
        setSubmittedSearchTerm,
    ] = useState("");

    const [
        equipments,
        setEquipments,
    ] = useState<Equipment[]>([]);

    const [summary, setSummary] =
        useState<EquipmentSummary>(
            INITIAL_SUMMARY,
        );

    const [loading, setLoading] =
        useState(false);

    const [
        totalItems,
        setTotalItems,
    ] = useState(0);



    /**
     * Spring Pageable bắt đầu từ 0.
     */
    const [
        currentPage,
        setCurrentPage,
    ] = useState(0);

    const [pageSize, setPageSize] =
        useState(10);

    const [
        statusFilter,
        setStatusFilter,
    ] = useState<
        EquipmentStatus | "ALL"
    >("ALL");

    const fetchSummary =
        useCallback(async () => {
            try {
                const data =
                    await EquipmentService
                        .getSummary();

                setSummary(data);
            } catch (error: unknown) {
                console.error(
                    "Lỗi khi tải thống kê thiết bị:",
                    error,
                );

                setSummary(
                    INITIAL_SUMMARY,
                );
            }
        }, []);

    const fetchEquipments =
        useCallback(async () => {
            try {
                setLoading(true);

                const data =
                    await EquipmentService.getAll({
                        page: currentPage,
                        size: pageSize,

                        keyword:
                            submittedSearchTerm
                                .trim() || undefined,

                        status:
                            statusFilter === "ALL"
                                ? undefined
                                : statusFilter,
                    });

                const items = Array.isArray(data) ? data : ((data as any).content || []);
                setEquipments(items);

                setTotalItems(
                    (data as any).totalElements ?? items.length,
                );


            } catch (error: unknown) {
                console.error(
                    "Lỗi khi tải thiết bị:",
                    error,
                );

                setEquipments([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        }, [
            currentPage,
            pageSize,
            statusFilter,
            submittedSearchTerm,
        ]);

    useEffect(() => {
        void fetchEquipments();
    }, [fetchEquipments]);

    useEffect(() => {
        void fetchSummary();
    }, [fetchSummary]);

    const handleSearch = () => {
        setCurrentPage(0);
        setSubmittedSearchTerm(
            searchTerm,
        );
    };

    const renderStatusBadge = (
        status: EquipmentStatus,
    ) => {
        switch (status) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-fit-primary/20 bg-fit-primarySoft px-2.5 py-1 text-xs font-medium text-fit-primary">
            Hoạt động
          </span>
                );

            case "MAINTENANCE":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-fit-trainer/20 bg-fit-trainerSoft px-2.5 py-1 text-xs font-medium text-fit-trainer">
            Bảo trì
          </span>
                );

            case "INACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-fit-danger/20 bg-fit-dangerSoft px-2.5 py-1 text-xs font-medium text-fit-danger">
            Ngừng hoạt động
          </span>
                );
        }
    };



    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý trang thiết bị
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Quản lý và theo dõi toàn bộ thiết bị trong phòng gym.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    {isAdmin && (
                        <>
                            <Link to="/admin/equipment/areas">
                                <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                                    <MapPin className="h-4 w-4" />
                                    Quản lý khu vực
                                </Button>
                            </Link>

                            <Link to="/admin/equipment/maintenance-schedules">
                                <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20">
                                    <CalendarClock className="h-4 w-4" />
                                    Lịch bảo trì
                                </Button>
                            </Link>

                            <Link to="/admin/equipment/add">
                                <Button className="flex items-center gap-2 bg-fit-primary text-white shadow-lg shadow-fit-primary/20">
                                    <Plus className="h-4 w-4" />
                                    Thêm thiết bị
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <Card className="p-5">
                    <Layers className="mb-2 h-6 w-6 text-fit-primary" />
                    <p className="text-xs text-slate-500">
                        Tổng thiết bị
                    </p>
                    <strong className="text-2xl">
                        {summary.total}
                    </strong>
                </Card>

                <Card className="p-5">
                    <CheckCircle2 className="mb-2 h-6 w-6 text-emerald-600" />
                    <p className="text-xs text-slate-500">
                        Hoạt động
                    </p>
                    <strong className="text-2xl">
                        {summary.active.count}
                    </strong>
                </Card>

                <Card className="p-5">
                    <Wrench className="mb-2 h-6 w-6 text-amber-600" />
                    <p className="text-xs text-slate-500">
                        Bảo trì
                    </p>
                    <strong className="text-2xl">
                        {summary.maintenance.count}
                    </strong>
                </Card>

                <Card className="p-5">
                    <XCircle className="mb-2 h-6 w-6 text-rose-600" />
                    <p className="text-xs text-slate-500">
                        Ngừng hoạt động
                    </p>
                    <strong className="text-2xl">
                        {summary.inactive.count}
                    </strong>
                </Card>

                <Card className="p-5">
                    <CalendarClock className="mb-2 h-6 w-6 text-purple-600" />
                    <p className="text-xs text-slate-500">
                        Sắp bảo trì
                    </p>
                    <strong className="text-2xl">
                        {
                            summary
                                .upcomingMaintenance
                                .count
                        }
                    </strong>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b p-5">
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value,
                                    )
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key ===
                                        "Enter"
                                    ) {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Tìm kiếm thiết bị..."
                                className="w-64 rounded-lg border py-2 pl-9 pr-3 text-sm"
                            />
                        </div>

                        <Button
                            type="button"
                            onClick={handleSearch}
                        >
                            Tìm
                        </Button>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(
                                event.target
                                    .value as
                                    | EquipmentStatus
                                    | "ALL",
                            );

                            setCurrentPage(0);
                        }}
                        className="rounded-lg border px-3 py-2 text-sm"
                    >
                        <option value="ALL">
                            Tất cả trạng thái
                        </option>

                        <option value="ACTIVE">
                            Hoạt động
                        </option>

                        <option value="MAINTENANCE">
                            Bảo trì
                        </option>

                        <option value="INACTIVE">
                            Ngừng hoạt động
                        </option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-5 py-4">
                                Thiết bị
                            </th>

                            <th className="px-5 py-4">
                                Danh mục
                            </th>

                            <th className="px-5 py-4">
                                Khu vực
                            </th>

                            <th className="px-5 py-4">
                                Trạng thái
                            </th>

                            <th className="px-5 py-4">
                                Bảo trì gần nhất
                            </th>

                            <th className="px-5 py-4">
                                Bảo trì tiếp theo
                            </th>

                            <th className="px-5 py-4 text-center">
                                Thao tác
                            </th>
                        </tr>
                        </thead>

                        <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-5 py-10 text-center"
                                >
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : equipments.length ===
                        0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-5 py-10 text-center text-slate-400"
                                >
                                    Không có thiết bị.
                                </td>
                            </tr>
                        ) : (
                            equipments.map(
                                (equipment) => (
                                    <tr
                                        key={equipment.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        equipment.image ||
                                                        "/placeholder-equipment.png"
                                                    }
                                                    alt={
                                                        equipment.name
                                                    }
                                                    className="h-11 w-11 rounded-lg object-cover"
                                                />

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {
                                                            equipment.name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Mã:{" "}
                                                        {
                                                            equipment.id
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            {
                                                equipment.category
                                            }
                                        </td>

                                        <td className="px-5 py-4">
                                            {equipment.area}
                                        </td>

                                        <td className="px-5 py-4">
                                            {renderStatusBadge(
                                                equipment.status,
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            {equipment.lastMaintenance ||
                                                "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            {equipment.nextMaintenance ||
                                                "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    to={isAdmin ? `/admin/equipment/${equipment.id}` : `/staff/equipment/${equipment.id}`}
                                                    title="Xem chi tiết"
                                                    className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600 hover:text-slate-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>

                                                {isAdmin && (
                                                    <Link
                                                        to={`/admin/equipment/edit/${equipment.id}`}
                                                        title="Chỉnh sửa"
                                                        className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600 hover:text-slate-900"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )
                        )}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(0);
                    }}
                />
            </Card>
        </div>
    );
}