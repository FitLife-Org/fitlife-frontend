import { ROUTES } from "../config/routes";
import type { Role } from "../types/common.type";

export function getRedirectPathByRoles(roles: Role[]): string {
    if (roles.includes("ROLE_ADMIN")) {
        return ROUTES.ADMIN_DASHBOARD;
    }

    if (roles.includes("ROLE_STAFF")) {
        return ROUTES.STAFF_CHECKIN;
    }

    if (roles.includes("ROLE_PT")) {
        return ROUTES.TRAINER_SCHEDULE;
    }

    return ROUTES.MEMBER_HOME;
}