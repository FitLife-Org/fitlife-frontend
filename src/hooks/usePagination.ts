import {
    useCallback,
    useMemo,
    useState,
} from "react";

export function usePagination(
    initialPage = 0,
    initialSize = 10,
) {
    const [page, setPage] =
        useState(initialPage);

    const [size, setSizeState] =
        useState(initialSize);

    const setSize = useCallback(
        (newSize: number) => {
            setSizeState(newSize);
            setPage(0);
        },
        [],
    );

    const reset = useCallback(() => {
        setPage(initialPage);
        setSizeState(initialSize);
    }, [
        initialPage,
        initialSize,
    ]);

    const nextPage = useCallback(
        (totalPages: number) => {
            setPage((previous) =>
                Math.min(
                    previous + 1,
                    Math.max(
                        totalPages - 1,
                        0,
                    ),
                ),
            );
        },
        [],
    );

    const previousPage =
        useCallback(() => {
            setPage((previous) =>
                Math.max(previous - 1, 0),
            );
        }, []);

    return useMemo(
        () => ({
            page,
            size,

            setPage,
            setSize,

            nextPage,
            previousPage,
            reset,
        }),
        [
            nextPage,
            page,
            previousPage,
            reset,
            setSize,
            size,
        ],
    );
}