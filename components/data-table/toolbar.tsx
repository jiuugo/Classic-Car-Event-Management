"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DataTableToolbar({
  left,
  right,
}: {
  left?: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {left ?? <Input placeholder="Search" />}
      </div>
      <div className="flex items-center gap-2">
        {right ?? <Button>New</Button>}
      </div>
    </div>
  )
}

export default DataTableToolbar
