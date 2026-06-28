import {BrowserRouter, Navigate, Outlet, Route, Routes} from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleRoute from "../components/guards/RoleRoute";
import {ROUTES} from "../config/routes";
import HomePage from "../pages/HomePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import EquipmentManagementPage from "../pages/admin/EquipmentManagementPage";
import PackageManagementPage from "../pages/admin/PackageManagementPage";
import ReportPage from "../pages/admin/ReportPage";
import TrainerManagementPage from "../pages/admin/TrainerManagementPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import AccountManagementPage from "../pages/admin/AccountManagementPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import GoogleCallbackPage from "../pages/auth/GoogleCallbackPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
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
import PackageListPage from "../pages/member/PackageListPage";
import PaymentPage from "../pages/member/PaymentPage";
import SettingsPage from "../pages/settings/SettingsPage";
import CheckinPage from "../pages/staff/CheckinPage";
import MemberLookupPage from "../pages/staff/MemberLookupPage";
import SubscriptionSupportPage from "../pages/staff/SubscriptionSupportPage";
import MyMembersPage from "../pages/trainer/MyMembersPage";
import TrainerSchedulePage from "../pages/trainer/TrainerSchedulePage";
import WorkoutTrackingPage from "../pages/trainer/WorkoutTrackingPage";
import type {Role} from "../types/common.type";

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
            <Routes>
                <Route path={ROUTES.HOME} element={<HomePage/>}/>
                <Route path={ROUTES.LOGIN} element={<LoginPage/>}/>
                <Route path={ROUTES.REGISTER} element={<RegisterPage/>}/>
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage/>}/>
                <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage/>}/>
                <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallbackPage/>}/>
                <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage/>}/>


                <Route element={<ProtectedRoute/>}>
                    <Route element={<DashboardLayoutRoute/>}>
                        <Route path={ROUTES.DASHBOARD} element={<DashboardPage/>}/><Route path={ROUTES.DASHBOARD}
                                                                                          element={<DashboardPage/>}/>
                        <Route path={ROUTES.COMMON_SETTINGS} element={<SettingsPage/>}/>

                        {/* Member Routes */}
                        <Route path={ROUTES.MEMBER_HOME}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><MemberHomePage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_PROFILE}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><MemberProfilePage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_BODY_METRICS}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><BodyMetricPage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_PACKAGES}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><PackageListPage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_SUBSCRIPTION}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><MySubscriptionPage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_PAYMENT}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><PaymentPage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_CHECKINS}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><CheckinHistoryPage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_BOOKING}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><BookingPage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_AI}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><AiFitnessPage/></RoleGuard>}/>
                        <Route path={ROUTES.MEMBER_NUTRITION}
                               element={<RoleGuard roles={["ROLE_MEMBER"]}><NutritionPage/></RoleGuard>}/>

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
                            path={ROUTES.STAFF_MEMBER_LOOKUP}
                            element={
                                <RoleGuard roles={["ROLE_STAFF", "ROLE_ADMIN"]}>
                                    <MemberLookupPage/>
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
                                <RoleGuard roles={["ROLE_PT", "ROLE_ADMIN"]}>
                                    <TrainerSchedulePage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.TRAINER_MEMBERS}
                            element={
                                <RoleGuard roles={["ROLE_PT", "ROLE_ADMIN"]}>
                                    <MyMembersPage/>
                                </RoleGuard>
                            }
                        />

                        <Route
                            path={ROUTES.TRAINER_WORKOUT_TRACKING}
                            element={
                                <RoleGuard roles={["ROLE_PT", "ROLE_ADMIN"]}>
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