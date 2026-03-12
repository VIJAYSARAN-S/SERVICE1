'use client';

import React from 'react';

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  onViewAll?: () => void;
}

export default function DataTable({ columns, data, title, onViewAll }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-soft">
      {(title || onViewAll) && (
        <div className="flex items-center justify-between border-b border-border bg-white/50 px-6 py-4">
          {title && <h3 className="text-lg font-bold text-navy">{title}</h3>}
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-xs font-bold text-primary hover:underline transition-all"
            >
              View All
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-muted">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-4">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-muted/5 transition-colors">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-navy">
                      {column.render 
                        ? column.render(item[column.accessor], item) 
                        : item[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-muted">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
