"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function InlineEditCell({
  value: initialValue,
  onSave,
  children,
}: {
  value: any
  onSave?: (value: any) => void
  children?: React.ReactNode
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialValue)

  return editing ? (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue((e.target as HTMLInputElement).value)}
      />
      <Button
        size="sm"
        onClick={() => {
          setEditing(false)
          onSave?.(value)
        }}
      >
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </div>
  ) : (
    <div onDoubleClick={() => setEditing(true)}>
      {children ?? String(initialValue)}
    </div>
  )
}

export default InlineEditCell
