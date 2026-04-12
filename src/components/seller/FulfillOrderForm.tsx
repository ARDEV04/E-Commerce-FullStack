"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";

export default function FulfillOrderForm({
  orderId,
  itemId,
}: {
  orderId: string;
  itemId: string;
}) {
  const [trackingNum, setTrackingNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNum.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, trackingNum }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order marked as shipped");
      router.refresh();
    } catch {
      toast.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => setOpen(true)}
      >
        <Truck className="h-4 w-4 mr-2" />
        Mark as Shipped
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <div className="flex-1">
        <Label htmlFor="tracking" className="sr-only">Tracking Number</Label>
        <Input
          id="tracking"
          value={trackingNum}
          onChange={(e) => setTrackingNum(e.target.value)}
          placeholder="Enter tracking number"
        />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "Saving..." : "Submit"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </form>
  );
}
