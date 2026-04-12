"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerActionButtons({
  sellerId,
  currentStatus,
}: {
  sellerId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to update seller");
        return;
      }

      toast.success(
        status === "APPROVED"
          ? "Seller approved successfully"
          : status === "SUSPENDED"
          ? "Seller suspended"
          : "Seller reinstated"
      );
      router.refresh();
    } catch (err) {
      toast.error("Network error – please try again");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      {currentStatus === "PENDING" && (
        <>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => updateStatus("APPROVED")}
            disabled={loading}
          >
            {loading ? "..." : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => updateStatus("SUSPENDED")}
            disabled={loading}
          >
            {loading ? "..." : "Reject"}
          </Button>
        </>
      )}
      {currentStatus === "APPROVED" && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => updateStatus("SUSPENDED")}
          disabled={loading}
        >
          {loading ? "..." : "Suspend"}
        </Button>
      )}
      {currentStatus === "SUSPENDED" && (
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => updateStatus("APPROVED")}
          disabled={loading}
        >
          {loading ? "..." : "Reinstate"}
        </Button>
      )}
    </div>
  );
}
