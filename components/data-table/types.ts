import React from "react"
import type { ColumnDef } from "@tanstack/react-table"

export type RowAction<T> = {
  id: string
  label: string
  onClick?: (row: T) => void
  icon?: React.ReactNode
}

export interface DataTableProps<TData extends object> {
  data: TData[]
  columns: ColumnDef<TData>[]
  enableDrag?: boolean
  enableSelection?: boolean
  enablePagination?: boolean
  enableFilters?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  onRowReorder?: (newData: TData[]) => void
  onRowEdit?: (row: TData, columnId: string, value: any) => Promise<void> | void
  onSelectionChange?: (selectedRows: TData[]) => void
  rowKey?: (row: TData) => string
  className?: string
  rowExpansionRenderer?: (row: TData) => React.ReactNode
}

export type { ColumnDef }
