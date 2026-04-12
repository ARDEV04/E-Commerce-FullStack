import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAYMENT_CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Orders ({orders.length})</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium">Order ID</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Customer</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">Items</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium font-mono">
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="p-4 hidden md:table-cell">
                  <p>{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                </td>
                <td className="p-4 font-bold">${order.total.toFixed(2)}</td>
                <td className="p-4 hidden sm:table-cell text-muted-foreground">
                  {order._count.items}
                </td>
                <td className="p-4">
                  <Badge className={statusColors[order.status] ?? ""}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground hidden lg:table-cell">
                  {format(new Date(order.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
