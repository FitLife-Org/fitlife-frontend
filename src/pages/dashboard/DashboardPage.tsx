import {
  Navigate,
} from "react-router-dom";

import {
  ROUTES,
} from "../../config/routes";

import {
  useAuthStore,
} from "../../store/authStore";

export default function DashboardPage() {
  const user =
      useAuthStore(
          (state) => state.user,
      );

  if (!user) {
    return (
        <Navigate
            to={ROUTES.LOGIN}
            replace
        />
    );
  }

  const roles =
      user.roles ?? [];

  if (
      roles.includes(
          "ROLE_ADMIN",
      )
  ) {
    return (
        <Navigate
            to={
              ROUTES.ADMIN_DASHBOARD
            }
            replace
        />
    );
  }

  if (
      roles.includes(
          "ROLE_MEMBER",
      )
  ) {
    return (
        <Navigate
            to={ROUTES.MEMBER_HOME}
            replace
        />
    );
  }

  if (
      roles.includes(
          "ROLE_TRAINER",
      )
  ) {
    return (
        <Navigate
            to={
              ROUTES.TRAINER_SCHEDULE
            }
            replace
        />
    );
  }

  if (
      roles.includes(
          "ROLE_STAFF",
      )
  ) {
    return (
        <Navigate
            to={ROUTES.STAFF_CHECKIN}
            replace
        />
    );
  }

  return (
      <Navigate
          to={ROUTES.FORBIDDEN}
          replace
      />
  );
}