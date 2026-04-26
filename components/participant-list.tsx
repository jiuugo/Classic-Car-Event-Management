import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import ParticipantRowActions from "./participant-row-actions"

export default function ParticipantList({
  participants,
  q,
}: {
  participants: any[]
  q?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{participants.length} participants</div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>National ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.full_name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.national_id}</TableCell>
                <TableCell>
                  <ParticipantRowActions participantId={p.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
