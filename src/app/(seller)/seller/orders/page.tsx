import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
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

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  let seller: Awaited<ReturnType<typeof prisma.sellerProfile.findUnique>> = null;
  try {
    seller = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } });
  } catch { /* DB unreachable */ }
  if (!seller) redirect("/seller/apply");

  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  try {
    orders = await prisma.order.findMany({
      where: { items: { some: { sellerId: seller.id } } },
      include: {
        items: {
          where: { sellerId: seller.id },
          include: { product: { select: { title: true } } },
        },
        customer: { select: { name: true, email: true } },
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch { /* DB unreachable */ }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders ({orders.length})</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium">Order</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Customer</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">Items</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-right p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-muted-foreground">No orders yet</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">
                    {order.customer.name}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-muted-foreground max-w-xs">
                    <span className="line-clamp-1">
                      {order.items.map((i) => i.product.title).join(", ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge className={statusColors[order.status] ?? ""}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d")}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/seller/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
