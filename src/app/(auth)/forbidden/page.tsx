import { LinkButton } from "@/components/ui/link-button";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-6">
        You don&apos;t have permission to view this page.
      </p>
      <LinkButton href="/">Go Home</LinkButton>
    </div>
  );
}
