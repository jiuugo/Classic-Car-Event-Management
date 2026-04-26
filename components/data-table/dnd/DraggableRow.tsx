"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TableRow } from "@/components/ui/table"

export default function DraggableRow({
  row,
  children,
}: {
  row: any
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id })

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  }

  return (
    <TableRow ref={setNodeRef as any} style={style}>
      {React.Children.map(children as any, (child: any) => {
        // If the child is the drag cell, attach listeners/attributes to its first child element
        if (child?.props?.["data-drag-cell"]) {
          return React.cloneElement(child, {
            children: React.cloneElement(
              child.props.children as React.ReactElement,
              {
                ...attributes,
                ...listeners,
              }
            ),
          })
        }

        return child
      })}
    </TableRow>
  )
}
