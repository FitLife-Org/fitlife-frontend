import { useState, useEffect, useCallback } from "react";
import { adminNutritionService } from "../services/adminNutritionService";
import type { NutritionPlan } from "../types/nutrition.type";
import toast from "react-hot-toast";

export function useAdminNutrition() {
    const [plans, setPlans] = useState<NutritionPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminNutritionService.getAllNutritionPlans(page, 10);
            setPlans(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Failed to fetch nutrition plans:", error);
            toast.error("Không thể tải danh sách thực đơn.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleOpenDetail = async (plan: NutritionPlan) => {
        setDetailModalOpen(true);
        setSelectedPlan(plan);
        setDetailLoading(true);
        try {
            const detailedPlan = await adminNutritionService.getNutritionPlanById(plan.id);
            setSelectedPlan(detailedPlan);
        } catch (error) {
            console.error("Failed to fetch plan details:", error);
            toast.error("Không thể tải chi tiết thực đơn.");
        } finally {
            setDetailLoading(false);
        }
    };

    return {
        plans,
        loading,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        page,
        setPage,
        totalPages,
        totalElements,
        detailModalOpen,
        setDetailModalOpen,
        selectedPlan,
        detailLoading,
        handleOpenDetail
    };
}
