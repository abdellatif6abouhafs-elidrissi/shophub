'use client';

import { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`-mx-4 overflow-x-auto sm:mx-0 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        {children}
      </div>
    </div>
  );
}

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </table>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900 ${className}`}>
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = '', onClick }: TableRowProps) {
  return (
    <tr
      className={`${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  isHeader?: boolean;
}

export function TableCell({ children, className = '', isHeader = false }: TableCellProps) {
  const baseClasses = isHeader
    ? 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'
    : 'whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white';

  if (isHeader) {
    return <th className={`${baseClasses} ${className}`}>{children}</th>;
  }

  return <td className={`${baseClasses} ${className}`}>{children}</td>;
}
