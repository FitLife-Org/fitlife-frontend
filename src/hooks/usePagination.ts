import { useMemo, useState } from "react";

export function usePagination(initialPage = 1, initialSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  return useMemo(
    () => ({
      page,
      size,
      setPage,
      setSize,
      reset: () => setPage(initialPage),
    }),
    [initialPage, page, size],
  );
}
