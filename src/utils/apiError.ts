import axios from "axios";

interface ApiErrorBody {
    code?: number;
    message?: string;
    data?: unknown;
}

export function getApiErrorMessage(
    error: unknown,
    fallback =
    "Đã xảy ra lỗi khi xử lý yêu cầu.",
): string {
    if (
        axios.isAxiosError<ApiErrorBody>(
            error,
        )
    ) {
        return (
            error.response?.data?.message ||
            error.message ||
            fallback
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}