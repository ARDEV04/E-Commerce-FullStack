import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ResolveDisputeButton from "@/components/admin/ResolveDisputeButton";

export default async function AdminDisputesPage() {
  const disputes = await prisma.dispute.findMany({
    include: {
      user: { select: { name: true, email: true } },
      order: { select: { id: true, total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    OPEN: "bg-red-100 text-red-700",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Disputes ({disputes.length})</h1>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-muted-foreground">No disputes at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={statusColors[dispute.status] ?? ""}>{dispute.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(dispute.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="font-semibold">{dispute.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    By {dispute.user.name} · Order #{dispute.order.id.slice(-8).toUpperCase()} (${dispute.order.total.toFixed(2)})
                  </p>
                </div>
                {(dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW") && (
                  <ResolveDisputeButton disputeId={dispute.id} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{dispute.description}</p>
              {dispute.resolution && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Resolution:</p>
                  <p className="text-sm text-green-700">{dispute.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
