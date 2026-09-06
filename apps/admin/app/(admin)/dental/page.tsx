"use client";

import * as React from "react";
import Link from "next/link";
import {
  Container,
  PageHeader,
  Card,
  CardContent,
  Button,
  Badge,
  Loading,
} from "@repo/ui";
import { getVisitsForDental, type DentalVisitData } from "./actions";

const PRIORITY_BADGES: Record<string, string> = {
  red: "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
};

export default function DentalPage() {
  const [visits, setVisits] = React.useState<DentalVisitData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadVisits();
  }, []);

  async function loadVisits() {
    setLoading(true);
    const { data, error: fetchError } = await getVisitsForDental();
    if (fetchError) setError(fetchError);
    setVisits(data ?? []);
    setLoading(false);
  }

  return (
    <Container>
      <PageHeader
        title="Dental Queue"
        description="Patients waiting for dental consultation."
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : visits.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center text-muted-foreground">
            No patients waiting for dental consultation.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {visits.map((visit) => (
            <Link key={visit.visit_id} href={`/dental/${visit.visit_id}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {visit.queue_number}
                    </div>
                    <div>
                      <p className="font-medium">
                        {visit.first_name} {visit.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {visit.university_id}
                      </p>
                      {visit.chief_complaint && (
                        <p className="text-sm text-muted-foreground mt-1">
                          CC: {visit.chief_complaint}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {visit.priority_level && (
                      <Badge className={PRIORITY_BADGES[visit.priority_level] ?? "bg-gray-100 text-gray-800"}>
                        {visit.priority_level}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      Examine
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
