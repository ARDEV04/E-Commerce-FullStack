"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ResolveDisputeButton({ disputeId }: { disputeId: string }) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error("Please enter a resolution");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", resolution }),
      });
      if (!res.ok) throw new Error();
      toast.success("Dispute resolved");
      router.refresh();
    } catch {
      toast.error("Failed to resolve dispute");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Resolve
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-64">
      <Textarea
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Enter resolution notes..."
        rows={3}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleResolve} disabled={loading}>
          {loading ? "Saving..." : "Confirm"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
