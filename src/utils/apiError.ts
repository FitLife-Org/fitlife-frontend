import axios from "axios";

import type {
    ApiErrorResponse,
    ValidationErrorData,
} from "../types/common.type";

const DEFAULT_ERROR_MESSAGE =
    "Đã xảy ra lỗi khi xử lý yêu cầu.";

export function getApiErrorCode(
    error: unknown,
): number | undefined {
    if (
        !axios.isAxiosError<
            ApiErrorResponse
        >(error)
    ) {
        return undefined;
    }

    return error.response?.data?.code;
}

export function getApiErrorStatus(
    error: unknown,
): number | undefined {
    if (!axios.isAxiosError(error)) {
        return undefined;
    }

    return error.response?.status;
}

export function getValidationErrors(
    error: unknown,
): ValidationErrorData | null {
    if (
        !axios.isAxiosError<
            ApiErrorResponse<ValidationErrorData>
        >(error)
    ) {
        return null;
    }

    const responseData =
        error.response?.data;

    if (
        !responseData?.data ||
        typeof responseData.data !==
        "object" ||
        Array.isArray(responseData.data)
    ) {
        return null;
    }

    return responseData.data;
}

export function getApiErrorMessage(
    error: unknown,
    fallback:
    string = DEFAULT_ERROR_MESSAGE,
): string {
    if (
        axios.isAxiosError<
            ApiErrorResponse
        >(error)
    ) {
        const responseData =
            error.response?.data;

        const backendMessage =
            responseData?.message ||
            responseData?.error;

        if (backendMessage) {
            return backendMessage;
        }

        if (
            error.code ===
            "ECONNABORTED"
        ) {
            return "Yêu cầu đã hết thời gian chờ.";
        }

        if (!error.response) {
            return "Không thể kết nối đến máy chủ.";
        }

        switch (
            error.response.status
            ) {
            case 400:
                return "Dữ liệu gửi lên không hợp lệ.";

            case 401:
                return "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.";

            case 403:
                return "Bạn không có quyền thực hiện chức năng này.";

            case 404:
                return "Không tìm thấy dữ liệu yêu cầu.";

            case 409:
                return "Dữ liệu bị trùng hoặc đang xung đột.";

            case 500:
                return "Máy chủ gặp lỗi. Vui lòng thử lại sau.";

            default:
                return (
                    error.message ||
                    fallback
                );
        }
    }

    if (error instanceof Error) {
        return (
            error.message ||
            fallback
        );
    }

    return fallback;
}