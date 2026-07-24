import {BrowserRouter, Navigate, Outlet, Route, Routes} from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleRoute from "../components/guards/RoleRoute";
import {ROUTES} from "../config/routes";
import HomePage from "../pages/HomePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import EquipmentManagementPage from "../pages/admin/Equipment/EquipmentManagementPage";
import AddEquipmentPage from "../pages/admin/Equipment/AddEquipmentPage";
import EditEquipmentPage from "../pages/admin/Equipment/EditEquipmentPage";
import PackageManagementPage from "../pages/admin/PackageManagementPage";
import ReportPage from "../pages/admin/ReportPage";
import TrainerManagementPage from "../pages/admin/TrainerManagementPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import AccountManagementPage from "../pages/admin/AccountManagementPage";
import InvoiceManagementPage from "../pages/admin/InvoiceManagementPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import CheckEmailPage from "../pages/auth/CheckEmailPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ForbiddenPage from "../pages/error/ForbiddenPage";
import NotFoundPage from "../pages/error/NotFoundPage";
import AiFitnessPage from "../pages/member/AiFitnessPage";
import BodyMetricPage from "../pages/member/BodyMetricPage";
import BookingPage from "../pages/member/BookingPage";
import CheckinHistoryPage from "../pages/member/CheckinHistoryPage";
import MemberHomePage from "../pages/member/MemberHomePage";
import MemberProfilePage from "../pages/member/MemberProfilePage";
import MySubscriptionPage from "../pages/member/MySubscriptionPage";
import NutritionPage from "../pages/member/NutritionPage";
import WorkoutPlansPage from "../pages/member/WorkoutPlansPage";
import PackageListPage from "../pages/member/PackageListPage";
import PaymentHistoryPage from "../pages/member/PaymentHistoryPage";
import PaymentDetailPage from "../pages/member/PaymentDetailPage";
import PaymentManagementPage from "../pages/admin/PaymentManagementPage";
import PaymentResultPage from "../pages/member/PaymentResultPage";
import SettingsPage from "../pages/settings/SettingsPage";
import CheckinPage from "../pages/staff/CheckinPage";
import SubscriptionSupportPage from "../pages/staff/SubscriptionSupportPage";
import MyMembersPage from "../pages/trainer/MyMembersPage";
import TrainerSchedulePage from "../pages/trainer/TrainerSchedulePage";
import WorkoutTrackingPage from "../pages/trainer/WorkoutTrackingPage";
import NutritionPlanDetailPage from "../pages/member/NutritionPlanDetailPage";
import WorkoutPlanDetailPage from "../pages/member/WorkoutPlanDetailPage";
import type {Role} from "../types/common.type";
import ScrollToTop from "../components/common/ScrollToTop";

const DashboardLayoutRoute = () => {
    return (
        <DashboardLayout>
            <Outlet/>
        </DashboardLayout>
    );
};

const RoleGuard = ({
                       roles,
                       children,
                   }: {
    roles: Role[];
    children: React.ReactNode;
}) => <RoleRoute roles={roles}>{children}</RoleRoute>;

export default function AppRouter() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route
                    path={ROUTES.HOME}
                    element={<HomePage />}
                />

                <Route
                    path={ROUTES.LOGIN}
                    element={<LoginPage />}
                />

                <Route
                    path={ROUTES.REGISTER}
                    element={<RegisterPage />}
                />

                <Route
                    path={ROUTES.CHECK_EMAIL}
                    element={<CheckEmailPage />}
                />

                <Route
                    path={ROUTES.VERIFY_EMAIL}
                    element={<VerifyEmailPage />}
                />

                <Route
                    path={ROUTES.FORGOT_PASSWORD}
                    element={<ForgotPasswordPage />}
                />

                <Route
                    path={ROUTES.RESET_PASSWORD}
                    element={<ResetPasswordPage />}
                />



                <Route element={<ProtectedRoute/>}>
                    <Route element={<DashboardLayoutRoute/>}>
                        <Route path={ROUTES.DASHBOARD} element={<DashboardPage/>}/>
                        <Route path={ROUTES.COMMON_SETTINGS} element={<SettingsPage/>}/>

                        {/* Member Routes */}
                        <Route
                            path={ROUTES.MEMBER_HOME}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <MemberHomePage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_PROFILE}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <MemberProfilePage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_BODY_METRICS}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <BodyMetricPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_PACKAGES}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <PackageListPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_SUBSCRIPTION}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <MySubscriptionPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_PAYMENT_DETAIL}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <PaymentDetailPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_PAYMENT}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <PaymentHistoryPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_PAYMENT_RESULT}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <PaymentResultPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_CHECKINS}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <CheckinHistoryPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_BOOKING}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <BookingPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_WORKOUTS}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <WorkoutPlansPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_WORKOUT_DETAIL}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <WorkoutPlanDetailPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_AI}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <AiFitnessPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_NUTRITION}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <NutritionPage />
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.MEMBER_NUTRITION_DETAIL}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <NutritionPlanDetailPage />
                                </RoleGuard>
                            }
                        />
                        {/* Admin Routes */}
                        <Route
                            path={ROUTES.ADMIN_DASHBOARD}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN"]}>
                                    <AdminDashboardPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.ADMIN_USERS}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN"]}>
                                    <AccountManagementPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.ADMIN_MEMBERS}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN"]}>
                                    <UserManagementPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.ADMIN_PACKAGES}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN"]}>
                                    <PackageManagementPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.ADMIN_EQUIPMENT}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN", "ROLE_STAFF"]}>
                                    <EquipmentManagementPage/>
                                </RoleGuard>
                            }
                        />
                        <Route
                            path={`${ROUTES.ADMIN_EQUIPMENT}/add`}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN", "ROLE_STAFF"]}>
                                    <AddEquipmentPage/>
                                </RoleGuard>
                            }
                        />
                        <Route
                            path={`${ROUTES.ADMIN_EQUIPMENT}/edit/:id`}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN", "ROLE_STAFF"]}>
                                    <EditEquipmentPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.ADMIN_TRAINERS}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN"]}>
                                    <TrainerManagementPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.ADMIN_REPORTS}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN"]}>
                                    <ReportPage/>
                                </RoleGuard>
                            }
                        />
                        <Route
                            path={ROUTES.ADMIN_INVOICES}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN"]}>
                                    <InvoiceManagementPage/>
                                </RoleGuard>
                            }
                        />
                        <Route
                            path={ROUTES.ADMIN_PAYMENTS}
                            element={
                                <RoleGuard roles={["ROLE_ADMIN", "ROLE_STAFF"]}>
                                    <PaymentManagementPage />
                                </RoleGuard>
                            }
                        />
                        {/* Staff Routes */}
                        <Route
                            path={ROUTES.STAFF_CHECKIN}
                            element={
                                <RoleGuard roles={["ROLE_STAFF", "ROLE_ADMIN"]}>
                                    <CheckinPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.STAFF_SUBSCRIPTION_SUPPORT}
                            element={
                                <RoleGuard roles={["ROLE_STAFF", "ROLE_ADMIN"]}>
                                    <SubscriptionSupportPage/>
                                </RoleGuard>
                            }
                        />

                        {/* Trainer Routes */}
                        <Route
                            path={ROUTES.TRAINER_SCHEDULE}
                            element={
                                <RoleGuard roles={["ROLE_TRAINER", "ROLE_ADMIN"]}>
                                    <TrainerSchedulePage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.TRAINER_MEMBERS}
                            element={
                                <RoleGuard roles={["ROLE_TRAINER", "ROLE_ADMIN"]}>
                                    <MyMembersPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.TRAINER_WORKOUT_TRACKING}
                            element={
                                <RoleGuard roles={["ROLE_TRAINER", "ROLE_ADMIN"]}>
                                    <WorkoutTrackingPage/>
                                </RoleGuard>
                            }
                        />

                        {/* 404 CATCH ALL */}
                        <Route path="*" element={<NotFoundPage/>}/>
                    </Route>
                </Route>


            </Routes>
        </BrowserRouter>
    );
}
