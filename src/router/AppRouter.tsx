import type {
    ReactNode,
} from "react";

import {
    BrowserRouter,
    Outlet,
    Route,
    Routes,
} from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleRoute from "../components/guards/RoleRoute";

import ScrollToTop from "../components/common/ScrollToTop";

import {
    ROUTES,
} from "../config/routes";

import type {
    Role,
} from "../types/common.type";

// =====================================================
// PUBLIC
// =====================================================

import HomePage from "../pages/HomePage";

// =====================================================
// AUTHENTICATION
// =====================================================

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import CheckEmailPage from "../pages/auth/CheckEmailPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";

// =====================================================
// COMMON
// =====================================================

import DashboardPage from "../pages/dashboard/DashboardPage";
import SettingsPage from "../pages/settings/SettingsPage";

import ForbiddenPage from "../pages/error/ForbiddenPage";
import NotFoundPage from "../pages/error/NotFoundPage";

// =====================================================
// ADMIN
// =====================================================

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminBodyMetricPage from "../pages/admin/AdminBodyMetricPage";
import AccountManagementPage from "../pages/admin/AccountManagementPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import PackageManagementPage from "../pages/admin/PackageManagementPage";
import PaymentManagementPage from "../pages/admin/PaymentManagementPage";
import TrainerManagementPage from "../pages/admin/TrainerManagementPage";

import AdminSubscriptionPage from "../pages/admin/subscription/AdminSubscriptionPage";
import AdminAiSuggestionPage from "../pages/admin/ai/AdminAiSuggestionPage";
import ReportPage from "../pages/admin/ReportPage";

import InvoiceManagementPage from "../pages/admin/InvoiceManagementPage";
import AdminInvoiceDetailPage from "../pages/admin/AdminInvoiceDetailPage";

// =====================================================
// ADMIN - EQUIPMENT
// =====================================================

import EquipmentManagementPage from "../pages/admin/equipment/EquipmentManagementPage";
import EquipmentAreaManagementPage from "../pages/admin/equipment/EquipmentAreaManagementPage";
import AddEquipmentPage from "../pages/admin/equipment/AddEquipmentPage";
import EditEquipmentPage from "../pages/admin/equipment/EditEquipmentPage";
import EquipmentDetailPage from "../pages/admin/equipment/EquipmentDetailPage";
import CreateMaintenancePage from "../pages/admin/equipment/CreateMaintenancePage";
import MaintenanceSchedulesPage from "../pages/admin/equipment/MaintenanceSchedulesPage";

// =====================================================
// MEMBER
// =====================================================

import MemberHomePage from "../pages/member/MemberHomePage";
import MemberProfilePage from "../pages/member/MemberProfilePage";
import BodyMetricPage from "../pages/member/BodyMetricPage";
import MemberQRPage from "../pages/member/MemberQRPage";

import PackageListPage from "../pages/member/PackageListPage";
import MySubscriptionPage from "../pages/member/MySubscriptionPage";

import PaymentHistoryPage from "../pages/member/PaymentHistoryPage";
import PaymentDetailPage from "../pages/member/PaymentDetailPage";
import PaymentResultPage from "../pages/member/PaymentResultPage";

import MemberInvoiceListPage from "../pages/member/MemberInvoiceListPage";
import MemberInvoiceDetailPage from "../pages/member/MemberInvoiceDetailPage";

import CheckinHistoryPage from "../pages/member/CheckinHistoryPage";

import WorkoutPlansPage from "../pages/member/WorkoutPlansPage";
import WorkoutPlanDetailPage from "../pages/member/WorkoutPlanDetailPage";
import WorkoutTodayPage from "../pages/member/WorkoutTodayPage";
import MemberSchedulePage from "../pages/member/MemberSchedulePage";

import NutritionPage from "../pages/member/NutritionPage";
import NutritionPlanDetailPage from "../pages/member/NutritionPlanDetailPage";
import NutritionTodayPage from "../pages/member/NutritionTodayPage";

import AiFitnessPage from "../pages/member/AiFitnessPage";

// =====================================================
// STAFF
// =====================================================

import CheckinPage from "../pages/staff/CheckinPage";
import StaffCheckinHistoryPage from "../pages/staff/StaffCheckinHistoryPage";

// =====================================================
// TRAINER
// =====================================================

import TrainerSchedulePage from "../pages/trainer/TrainerSchedulePage";
import MyMembersPage from "../pages/trainer/MyMembersPage";
import WorkoutTrackingPage from "../pages/trainer/WorkoutTrackingPage";

import TrainerNutritionPage from "../pages/trainer/TrainerNutritionPage";
import TrainerNutritionFormPage from "../pages/trainer/TrainerNutritionFormPage";

import TrainerWorkoutPage from "../pages/trainer/TrainerWorkoutPage";
import TrainerWorkoutFormPage from "../pages/trainer/TrainerWorkoutFormPage";

// =====================================================
// ROUTE LAYOUT
// =====================================================

function DashboardLayoutRoute() {
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
}

interface RoleGuardProps {
    roles:
        readonly Role[];

    children:
        ReactNode;
}

function RoleGuard({
                       roles,
                       children,
                   }: RoleGuardProps) {
    return (
        <RoleRoute
            roles={
                roles
            }
        >
            {children}
        </RoleRoute>
    );
}

// =====================================================
// ROUTER
// =====================================================

export default function AppRouter() {
    return (
        <BrowserRouter>
            <ScrollToTop />

            <Routes>
                {/* =========================================
                 * PUBLIC
                 * ========================================= */}

                <Route
                    path={
                        ROUTES.HOME
                    }
                    element={
                        <HomePage />
                    }
                />

                <Route
                    path={
                        ROUTES.LOGIN
                    }
                    element={
                        <LoginPage />
                    }
                />

                <Route
                    path={
                        ROUTES.REGISTER
                    }
                    element={
                        <RegisterPage />
                    }
                />

                <Route
                    path={
                        ROUTES.CHECK_EMAIL
                    }
                    element={
                        <CheckEmailPage />
                    }
                />

                <Route
                    path={
                        ROUTES.VERIFY_EMAIL
                    }
                    element={
                        <VerifyEmailPage />
                    }
                />

                <Route
                    path={
                        ROUTES.FORGOT_PASSWORD
                    }
                    element={
                        <ForgotPasswordPage />
                    }
                />

                <Route
                    path={
                        ROUTES.RESET_PASSWORD
                    }
                    element={
                        <ResetPasswordPage />
                    }
                />

                <Route
                    path={
                        ROUTES.FORBIDDEN
                    }
                    element={
                        <ForbiddenPage />
                    }
                />

                {/* =========================================
                 * PROTECTED
                 * ========================================= */}

                <Route
                    element={
                        <ProtectedRoute />
                    }
                >
                    <Route
                        element={
                            <DashboardLayoutRoute />
                        }
                    >
                        {/* =================================
                         * COMMON
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.DASHBOARD
                            }
                            element={
                                <DashboardPage />
                            }
                        />

                        <Route
                            path={
                                ROUTES.COMMON_SETTINGS
                            }
                            element={
                                <SettingsPage />
                            }
                        />

                        {/* =================================
                         * MEMBER - GENERAL
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.MEMBER_HOME
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <MemberHomePage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_PROFILE
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <MemberProfilePage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_BODY_METRICS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <BodyMetricPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_QR
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <MemberQRPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_CHECKINS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <CheckinHistoryPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * MEMBER - PACKAGES
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.MEMBER_PACKAGES
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <PackageListPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_SUBSCRIPTION
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <MySubscriptionPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * MEMBER - PAYMENT
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.MEMBER_PAYMENT
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <PaymentHistoryPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_PAYMENT_DETAIL
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <PaymentDetailPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_PAYMENT_RESULT
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <PaymentResultPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * MEMBER - INVOICE
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.MEMBER_INVOICES
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <MemberInvoiceListPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_INVOICE_DETAIL
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <MemberInvoiceDetailPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * MEMBER - AI
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.MEMBER_AI
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <AiFitnessPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * MEMBER - WORKOUT
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.MEMBER_WORKOUTS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <WorkoutPlansPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_WORKOUT_TODAY
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <WorkoutTodayPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_WORKOUT_DETAIL
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <WorkoutPlanDetailPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_SCHEDULE
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <MemberSchedulePage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * MEMBER - NUTRITION
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.MEMBER_NUTRITION
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <NutritionPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_NUTRITION_TODAY
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <NutritionTodayPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.MEMBER_NUTRITION_DETAIL
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_MEMBER",
                                    ]}
                                >
                                    <NutritionPlanDetailPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * ADMIN
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.ADMIN_DASHBOARD
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <AdminDashboardPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_USERS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <AccountManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_MEMBERS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <UserManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_PACKAGES
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <PackageManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_TRAINERS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <TrainerManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_AI_SUGGESTIONS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                        "ROLE_STAFF",
                                    ]}
                                >
                                    <AdminAiSuggestionPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_INVOICES
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                        "ROLE_STAFF",
                                    ]}
                                >
                                    <InvoiceManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_INVOICE_DETAIL
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                        "ROLE_STAFF",
                                    ]}
                                >
                                    <AdminInvoiceDetailPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_SUBSCRIPTIONS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                        "ROLE_STAFF",
                                    ]}
                                >
                                    <AdminSubscriptionPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_PAYMENTS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                        "ROLE_STAFF",
                                    ]}
                                >
                                    <PaymentManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.ADMIN_REPORTS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <ReportPage />
                                </RoleGuard>
                            }
                        />
                        <Route path={ROUTES.ADMIN_BODY_METRICS} element={<RoleGuard roles={["ROLE_ADMIN", "ROLE_STAFF"]}><AdminBodyMetricPage /></RoleGuard>} />

                        {/* =================================
                         * ADMIN - EQUIPMENT
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.ADMIN_EQUIPMENT
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN"
                                    ]}
                                >
                                    <EquipmentManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.ADMIN_EQUIPMENT}/areas`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN"
                                    ]}
                                >
                                    <EquipmentAreaManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.ADMIN_EQUIPMENT}/add`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN"
                                    ]}
                                >
                                    <AddEquipmentPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.ADMIN_EQUIPMENT}/maintenance-schedules`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN"
                                    ]}
                                >
                                    <MaintenanceSchedulesPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.ADMIN_EQUIPMENT}/edit/:id`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN"
                                    ]}
                                >
                                    <EditEquipmentPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.ADMIN_EQUIPMENT}/:id/maintenance`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN"
                                    ]}
                                >
                                    <CreateMaintenancePage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.ADMIN_EQUIPMENT}/:id`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_ADMIN"
                                    ]}
                                >
                                    <EquipmentDetailPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * STAFF - EQUIPMENT
                         * ================================= */
}

                        <Route
                            path={
                                ROUTES.STAFF_EQUIPMENT
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF"
                                    ]}
                                >
                                    <EquipmentManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.STAFF_EQUIPMENT}/areas`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF"
                                    ]}
                                >
                                    <EquipmentAreaManagementPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.STAFF_EQUIPMENT}/add`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF"
                                    ]}
                                >
                                    <AddEquipmentPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.STAFF_EQUIPMENT}/maintenance-schedules`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF"
                                    ]}
                                >
                                    <MaintenanceSchedulesPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.STAFF_EQUIPMENT}/edit/:id`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF"
                                    ]}
                                >
                                    <EditEquipmentPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.STAFF_EQUIPMENT}/:id/maintenance`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF"
                                    ]}
                                >
                                    <CreateMaintenancePage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={`${ROUTES.STAFF_EQUIPMENT}/:id`}
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF"
                                    ]}
                                >
                                    <EquipmentDetailPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * STAFF
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.STAFF_CHECKIN
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <CheckinPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.STAFF_CHECKIN_HISTORY
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_STAFF",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <StaffCheckinHistoryPage />
                                </RoleGuard>
                            }
                        />

                        {/* =================================
                         * TRAINER
                         * ================================= */}

                        <Route
                            path={
                                ROUTES.TRAINER_SCHEDULE
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <TrainerSchedulePage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.TRAINER_MEMBERS
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <MyMembersPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={
                                ROUTES.TRAINER_WORKOUT_TRACKING
                            }
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <WorkoutTrackingPage />
                                </RoleGuard>
                            }
                        />

                        {/* Trainer Workout */}

                        <Route
                            path="/trainer/members/:memberId/workouts"
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <TrainerWorkoutPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path="/trainer/members/:memberId/workouts/create"
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <TrainerWorkoutFormPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path="/trainer/members/:memberId/workouts/:planId/edit"
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <TrainerWorkoutFormPage />
                                </RoleGuard>
                            }
                        />

                        {/* Trainer Nutrition */}

                        <Route
                            path="/trainer/members/:memberId/nutrition"
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <TrainerNutritionPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path="/trainer/members/:memberId/nutrition/create"
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <TrainerNutritionFormPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path="/trainer/members/:memberId/nutrition/:planId/edit"
                            element={
                                <RoleGuard
                                    roles={[
                                        "ROLE_TRAINER",
                                        "ROLE_ADMIN",
                                    ]}
                                >
                                    <TrainerNutritionFormPage />
                                </RoleGuard>
                            }
                        />

                        {/* Protected 404 */}

                        <Route
                            path="*"
                            element={
                                <NotFoundPage />
                            }
                        />
                    </Route>
                </Route>

                {/* Public 404 */}

                <Route
                    path="*"
                    element={
                        <NotFoundPage />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}



