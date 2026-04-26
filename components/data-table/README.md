# DataTable

Generic, reusable DataTable component built on TanStack React Table and shadcn UI primitives.

Usage example (basic):

```tsx
import { DataTable } from "@/components/data-table"

const columns = [
  { accessorKey: "full_name", header: "Name" },
  { accessorKey: "email", header: "Email" },
]

<DataTable data={participants} columns={columns} />
```

This directory contains stubs for advanced features (DnD, inline edit, row expansion). Implementations will be added incrementally.
