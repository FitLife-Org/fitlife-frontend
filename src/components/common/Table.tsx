import type { ReactNode } from "react";

interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyText?: string;
}

export default function Table<T>({ columns, data, emptyText = "Chưa có dữ liệu" }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left font-semibold text-slate-600">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-slate-700">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
