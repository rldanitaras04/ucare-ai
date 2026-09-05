import Link from "next/link";
import { Container, Button } from "@repo/ui";

export default function UnauthorizedPage() {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <Link href="/" className="mt-6">
          <Button>Return Home</Button>
        </Link>
      </div>
    </Container>
  );
}
