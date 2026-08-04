import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    memberTimelineService,
} from "../services/memberTimelineService";

import {
    getApiErrorMessage,
} from "../utils/apiError";

import type {
    MemberTimelineItem,
} from "../types/memberTimeline.type";

interface UseMemberTimelineOptions {
    memberId?: number;
    adminMode?: boolean;
    pageSize?: number;
}

export function useMemberTimeline({
                                      memberId,
                                      adminMode = false,
                                      pageSize = 20,
                                  }: UseMemberTimelineOptions = {}) {
    const [
        items,
        setItems,
    ] =
        useState<MemberTimelineItem[]>(
            [],
        );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        loadingMore,
        setLoadingMore,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    const [
        page,
        setPage,
    ] = useState(0);

    const [
        totalPages,
        setTotalPages,
    ] = useState(0);

    const loadPage =
        useCallback(
            async (
                targetPage: number,
                append: boolean,
            ): Promise<void> => {
                try {
                    setError(null);

                    if (append) {
                        setLoadingMore(true);
                    } else {
                        setLoading(true);
                    }

                    const result =
                        adminMode
                            ? await memberTimelineService
                                .getAdminTimeline(
                                    memberId ?? 0,
                                    targetPage,
                                    pageSize,
                                )
                            : await memberTimelineService
                                .getMyTimeline(
                                    targetPage,
                                    pageSize,
                                );

                    setItems(
                        (previous) =>
                            append
                                ? [
                                    ...previous,
                                    ...result.content,
                                ]
                                : result.content,
                    );

                    setPage(
                        result.page,
                    );

                    setTotalPages(
                        result.totalPages,
                    );
                } catch (
                    requestError: unknown
                    ) {
                    setError(
                        getApiErrorMessage(
                            requestError,
                        ),
                    );
                } finally {
                    setLoading(false);
                    setLoadingMore(false);
                }
            },
            [
                adminMode,
                memberId,
                pageSize,
            ],
        );

    useEffect(() => {
        if (
            adminMode &&
            (!memberId ||
                memberId <= 0)
        ) {
            setItems([]);
            setLoading(false);
            return;
        }

        void loadPage(
            0,
            false,
        );
    }, [
        adminMode,
        memberId,
        loadPage,
    ]);

    const hasMore =
        page + 1 <
        totalPages;

    const loadMore =
        async (): Promise<void> => {
            if (
                !hasMore ||
                loadingMore
            ) {
                return;
            }

            await loadPage(
                page + 1,
                true,
            );
        };

    return {
        items,

        loading,
        loadingMore,

        error,
        hasMore,

        loadMore,

        reload: () =>
            loadPage(
                0,
                false,
            ),
    };
}