import type {
    ApiResponse,
    PageResponse,
    SpringPage,
} from "../types/common.type";

export function requireApiData<T>(
    response: ApiResponse<T>,
    fallbackMessage = "Máy chủ không trả về dữ liệu.",
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

export function getApiMessage(
    response: ApiResponse<unknown>,
    fallbackMessage: string,
): string {
    return (
        response.message ||
        fallbackMessage
    );
}

function isPageResponse<T>(
    page:
        | PageResponse<T>
        | SpringPage<T>,
): page is PageResponse<T> {
    return (
        "page" in page &&
        typeof page.page === "number"
    );
}

export function normalizePageResponse<T>(
    page:
        | PageResponse<T>
        | SpringPage<T>,
): PageResponse<T> {
    if (isPageResponse(page)) {
        return {
            content: page.content ?? [],
            page: page.page,
            size: page.size ?? 0,
            totalElements:
                page.totalElements ?? 0,
            totalPages:
                page.totalPages ?? 0,
            first: page.first ?? true,
            last: page.last ?? true,
            empty:
                page.empty ??
                page.content.length === 0,
        };
    }

    return {
        content: page.content ?? [],
        page: page.number ?? 0,
        size: page.size ?? 0,
        totalElements:
            page.totalElements ?? 0,
        totalPages:
            page.totalPages ?? 0,
        first: page.first ?? true,
        last: page.last ?? true,
        empty:
            page.empty ??
            page.content.length === 0,
    };
}