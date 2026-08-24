import React from "react";
import Button from "./Button";

interface PaginationProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export default function Pagination({
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const firstItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
    const lastItem = Math.min((currentPage + 1) * pageSize, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Hiển thị</span>
                <select
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-fit-primary focus:ring-1 focus:ring-fit-primary"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                <span className="text-sm text-slate-500">bản ghi</span>
            </div>

            <div className="flex items-center gap-6">
                <span className="text-sm text-slate-500">
                    {firstItem} - {lastItem} của {totalItems}
                </span>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={currentPage === 0}
                        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                        className="px-3 py-1.5 h-8 flex items-center"
                    >
                        Trước
                    </Button>

                    <span className="text-sm font-semibold text-slate-700 min-w-[5rem] text-center">
                        {currentPage + 1} / {totalPages}
                    </span>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                        className="px-3 py-1.5 h-8 flex items-center"
                    >
                        Sau
                    </Button>
                </div>
            </div>
        </div>
    );
}