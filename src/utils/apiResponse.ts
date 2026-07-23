import type {
    ApiResponse,
} from "../types/common.type";

export function requireApiData<T>(
    response: ApiResponse<T>,
    fallbackMessage: string,
): T {
    if (
        response.data === null ||
        response.data === undefined
    ) {
        throw new Error(
            response.message ||
            fallbackMessage,
        );
    }

    return response.data;
}