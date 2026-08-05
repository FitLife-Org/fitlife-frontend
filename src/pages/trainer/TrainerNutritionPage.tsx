import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
    Plus, 
    Salad, 
    Clock, 
    Flame, 
    ChevronLeft,
    Edit3
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

import { nutritionService } from "../../services/nutritionService";
import type { NutritionPlan } from "../../types/nutrition.type";
import { getApiErrorMessage } from "../../utils/apiError";

export default function TrainerNutritionPage() {
    const { memberId } = useParams<{ memberId: string }>();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    const [plans, setPlans] = useState<NutritionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        if (!memberId) return;
        try {
            setLoading(true);
            const response = await nutritionService.getTrainerPlans(Number(memberId));
            setPlans(response.content);
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchPlans();
    }, [memberId]);

    useGSAP(() => {
        if (!loading && plans.length >= 0) {
            gsap.from(".gsap-plan-card", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out",
            });
        }
    }, [loading, plans]);

    return (
        <div ref={containerRef} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/trainer/members")}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Quản lý Dinh dưỡng</h1>
                        <p className="text-sm text-slate-500 mt-1">Hội viên ID: {memberId}</p>
                    </div>
                </div>
                
                <Link to={`/trainer/members/${memberId}/nutrition/create`}>
                    <Button className="flex items-center gap-2 bg-gradient-to-r from-fit-primary to-blue-600 text-white shadow-lg shadow-fit-primary/20 hover:scale-105 transition-transform">
                        <Plus className="w-5 h-5" />
                        Tạo giáo án mới
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-fit-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : plans.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Salad className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có giáo án nào</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Hội viên này hiện chưa có giáo án dinh dưỡng nào. Hãy tạo một giáo án mới để bắt đầu theo dõi.
                    </p>
                    <Link to={`/trainer/members/${memberId}/nutrition/create`}>
                        <Button variant="outline" className="border-fit-primary text-fit-primary hover:bg-fit-primary hover:text-white">
                            Tạo giáo án đầu tiên
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.id} className="gsap-plan-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Salad className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 line-clamp-1">{plan.name}</h3>
                                            <p className="text-xs text-slate-500">{plan.goal}</p>
                                        </div>
                                    </div>
                                    <Badge variant={plan.status === 'ACTIVE' ? 'success' : plan.status === 'DRAFT' ? 'warning' : 'default'}>
                                        {plan.status === 'ACTIVE' ? 'Đang áp dụng' : plan.status === 'DRAFT' ? 'Bản nháp' : 'Đã hoàn thành'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs font-medium">Thời lượng</span>
                                        </div>
                                        <p className="font-semibold text-slate-800">{plan.durationWeeks} tuần</p>
                                    </div>
                                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                        <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                                            <Flame className="w-4 h-4" />
                                            <span className="text-xs font-medium">Calories</span>
                                        </div>
                                        <p className="font-semibold text-orange-700">{plan.dailyCalories || 0} kcal</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Protein:</span>
                                        <span className="font-medium text-slate-700">{plan.proteinGrams || 0}g</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Carbs:</span>
                                        <span className="font-medium text-slate-700">{plan.carbohydrateGrams || 0}g</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Fat:</span>
                                        <span className="font-medium text-slate-700">{plan.fatGrams || 0}g</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link to={`/trainer/members/${memberId}/nutrition/${plan.id}/edit`} className="flex-1">
                                        <Button variant="outline" className="w-full flex justify-center items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-600">
                                            <Edit3 className="w-4 h-4" />
                                            Sửa
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
