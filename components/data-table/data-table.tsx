"use client"

import React, { useState, useEffect } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

import type { DataTableProps } from "./types"

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import DraggableRow from "./dnd/DraggableRow"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function DataTable<TData extends object>({
  data,
  columns,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  enableSelection = false,
  enableDrag = false,
  onRowReorder,
  onSelectionChange,
  className,
  getRowClassName,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [clientData, setClientData] = useState<TData[]>(data ?? [])

  // Build injected columns (drag handle, selection) in order
  const dragColumn = {
    id: "drag",
    header: () => null,
    cell: () => (
      <div data-drag-cell className="px-2">
        <button className="pointer-events-auto cursor-grab p-1">⋮</button>
      </div>
    ),
  }

  const selectColumn = {
    id: "select",
    header: ({ table }: any) => (
      <Checkbox
        checked={(table as any).getIsAllRowsSelected?.()}
        onCheckedChange={(v) => (table as any).toggleAllRowsSelected?.(!!v)}
        aria-label="Seleccionar todas las filas"
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        checked={(row as any).getIsSelected?.()}
        onCheckedChange={(v) => (row as any).toggleSelected?.(!!v)}
        aria-label="Seleccionar fila"
      />
    ),
  }

  const injectedColumns = [...(columns as any[])]
  if (enableSelection) injectedColumns.unshift(selectColumn)
  if (enableDrag) injectedColumns.unshift(dragColumn)

  const finalColumns = injectedColumns

  // Use clientData when drag is enabled to allow local reordering fallback
  useEffect(() => {
    setClientData(data ?? [])
  }, [data])

  const table = useReactTable({
    data: enableDrag ? clientData : (data ?? []),
    columns: finalColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  })

  useEffect(() => {
    if (onSelectionChange) {
      try {
        const selected =
          (table as any)
            .getSelectedRowModel()
            ?.rows?.map((r: any) => r.original) ?? []
        onSelectionChange(selected as TData[])
      } catch (e) {
        // swallow
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const rows = table.getRowModel().rows
    const oldIndex = rows.findIndex((r) => r.id === active.id)
    const newIndex = rows.findIndex((r) => r.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newRows = arrayMove(rows, oldIndex, newIndex)
    const newData = newRows.map((r: any) => r.original)

    if (onRowReorder) {
      onRowReorder(newData)
    } else {
      setClientData(newData as TData[])
    }
  }

  return (
    <Card className={className}>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <Input
            placeholder="Buscar..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.id === "select" ? (
                      <Checkbox
                        checked={(table as any).getIsAllRowsSelected?.()}
                        onCheckedChange={(v) =>
                          (table as any).toggleAllRowsSelected?.(!!v)
                        }
                        aria-label="Seleccionar todas las filas"
                      />
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              enableDrag ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={table.getRowModel().rows.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow
                        key={row.id}
                        row={row}
                        className={getRowClassName?.(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            data-drag-cell={cell.column.id === "drag"}
                          >
                            {cell.column.id === "select" ? (
                              <Checkbox
                                checked={(row as any).getIsSelected?.()}
                                onCheckedChange={(v) =>
                                  (row as any).toggleSelected?.(!!v)
                                }
                                aria-label="Seleccionar fila"
                              />
                            ) : (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            )}
                          </TableCell>
                        ))}
                      </DraggableRow>
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={getRowClassName?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.column.id === "select" ? (
                          <Checkbox
                            checked={(row as any).getIsSelected?.()}
                            onCheckedChange={(v) =>
                              (row as any).toggleSelected?.(!!v)
                            }
                            aria-label="Seleccionar fila"
                          />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={finalColumns.length}>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Sin resultados.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {enablePagination && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Filas:</label>
              <select
                className="rounded-2xl border border-input bg-input/30 px-2 py-1 text-sm"
                value={(
                  table.getState().pagination.pageSize || pageSize
                ).toString()}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DataTable
