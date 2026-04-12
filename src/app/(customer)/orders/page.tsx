import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
  PAYMENT_CONFIRMED: "bg-blue-100 text-blue-700 border-blue-300",
  PROCESSING: "bg-purple-100 text-purple-700 border-purple-300",
  SHIPPED: "bg-indigo-100 text-indigo-700 border-indigo-300",
  DELIVERED: "bg-green-100 text-green-700 border-green-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
  REFUNDED: "bg-gray-100 text-gray-700 border-gray-300",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      items: {
        include: { product: { select: { title: true, images: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
        <LinkButton href="/products">Browse Products</LinkButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${order.total.toFixed(2)}</span>
                  <Badge
                    variant="outline"
                    className={statusColors[order.status] ?? ""}
                  >
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {order.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100"
                  >
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : null}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-muted-foreground">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
