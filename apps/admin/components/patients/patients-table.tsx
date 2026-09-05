"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Input,
  Loading,
  EmptyState,
} from "@repo/ui";
import {
  searchPatients,
  type PatientProfile,
} from "@/lib/actions/patients";

interface PatientsTableProps {
  patients: PatientProfile[];
}

export function PatientsTable({ patients: initialPatients }: PatientsTableProps) {
  const router = useRouter();
  const [patients, setPatients] = React.useState(initialPatients);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      setPatients(initialPatients);
      return;
    }

    setLoading(true);
    const { data } = await searchPatients(query);
    if (data) {
      setPatients(data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by name, university ID, or employee number..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <Loading text="Searching..." />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          description={
            search
              ? "Try a different search term."
              : "No patients have been registered yet."
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>University ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Affiliation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono text-sm">
                    {patient.university_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {patient.last_name}, {patient.first_name}
                    {patient.middle_name ? ` ${patient.middle_name}` : ""}
                  </TableCell>
                  <TableCell>
                    {patient.affiliation ? (
                      <Badge variant="outline">{patient.affiliation}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {patient.contact_number ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/patients/${patient.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
