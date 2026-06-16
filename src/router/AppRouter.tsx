import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleRoute from "../components/guards/RoleRoute";
import { ROUTES } from "../config/routes";
import HomePage from "../pages/HomePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import EquipmentManagementPage from "../pages/admin/EquipmentManagementPage";
import PackageManagementPage from "../pages/admin/PackageManagementPage";
import ReportPage from "../pages/admin/ReportPage";
import TrainerManagementPage from "../pages/admin/TrainerManagementPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
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
import CheckinPage from "../pages/staff/CheckinPage";
import MemberLookupPage from "../pages/staff/MemberLookupPage";
import SubscriptionSupportPage from "../pages/staff/SubscriptionSupportPage";
import MyMembersPage from "../pages/trainer/MyMembersPage";
import TrainerSchedulePage from "../pages/trainer/TrainerSchedulePage";
import WorkoutTrackingPage from "../pages/trainer/WorkoutTrackingPage";

const protectedElement = (element: ReactNode) => (
  <ProtectedRoute>
    <DashboardLayout>{element}</DashboardLayout>
  </ProtectedRoute>
);

const roleElement = (roles: Array<"ADMIN" | "STAFF" | "TRAINER" | "MEMBER">, element: ReactNode) =>
  protectedElement(<RoleRoute roles={roles}>{element}</RoleRoute>);

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallbackPage />} />
        <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

        <Route path={ROUTES.DASHBOARD} element={protectedElement(<DashboardPage />)} />
        <Route path={ROUTES.MEMBER_HOME} element={roleElement(["MEMBER"], <MemberHomePage />)} />
        <Route path={ROUTES.MEMBER_PROFILE} element={roleElement(["MEMBER"], <MemberProfilePage />)} />
        <Route path={ROUTES.MEMBER_BODY_METRICS} element={roleElement(["MEMBER"], <BodyMetricPage />)} />
        <Route path={ROUTES.MEMBER_PACKAGES} element={roleElement(["MEMBER"], <PackageListPage />)} />
        <Route path={ROUTES.MEMBER_SUBSCRIPTION} element={roleElement(["MEMBER"], <MySubscriptionPage />)} />
        <Route path={ROUTES.MEMBER_PAYMENT} element={roleElement(["MEMBER"], <PaymentPage />)} />
        <Route path={ROUTES.MEMBER_CHECKINS} element={roleElement(["MEMBER"], <CheckinHistoryPage />)} />
        <Route path={ROUTES.MEMBER_BOOKING} element={roleElement(["MEMBER"], <BookingPage />)} />
        <Route path={ROUTES.MEMBER_AI} element={roleElement(["MEMBER"], <AiFitnessPage />)} />
        <Route path={ROUTES.MEMBER_NUTRITION} element={roleElement(["MEMBER"], <NutritionPage />)} />

        <Route path={ROUTES.ADMIN_DASHBOARD} element={roleElement(["ADMIN"], <AdminDashboardPage />)} />
        <Route path={ROUTES.ADMIN_USERS} element={<Navigate to={ROUTES.ADMIN_MEMBERS} replace />} />
        <Route path={ROUTES.ADMIN_MEMBERS} element={roleElement(["ADMIN"], <UserManagementPage />)} />
        <Route path={ROUTES.ADMIN_PACKAGES} element={roleElement(["ADMIN"], <PackageManagementPage />)} />
        <Route path={ROUTES.ADMIN_EQUIPMENT} element={roleElement(["ADMIN", "STAFF"], <EquipmentManagementPage />)} />
        <Route path={ROUTES.ADMIN_TRAINERS} element={roleElement(["ADMIN"], <TrainerManagementPage />)} />
        <Route path={ROUTES.ADMIN_REPORTS} element={roleElement(["ADMIN"], <ReportPage />)} />

        <Route path={ROUTES.STAFF_CHECKIN} element={roleElement(["STAFF", "ADMIN"], <CheckinPage />)} />
        <Route path={ROUTES.STAFF_MEMBER_LOOKUP} element={roleElement(["STAFF", "ADMIN"], <MemberLookupPage />)} />
        <Route path={ROUTES.STAFF_SUBSCRIPTION_SUPPORT} element={roleElement(["STAFF", "ADMIN"], <SubscriptionSupportPage />)} />

        <Route path={ROUTES.TRAINER_SCHEDULE} element={roleElement(["TRAINER", "ADMIN"], <TrainerSchedulePage />)} />
        <Route path={ROUTES.TRAINER_MEMBERS} element={roleElement(["TRAINER", "ADMIN"], <MyMembersPage />)} />
        <Route path={ROUTES.TRAINER_WORKOUT_TRACKING} element={roleElement(["TRAINER", "ADMIN"], <WorkoutTrackingPage />)} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
