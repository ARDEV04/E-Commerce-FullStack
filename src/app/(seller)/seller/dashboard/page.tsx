import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: { select: { products: true } },
    },
  });

  if (!seller) redirect("/seller/apply");

  const orders = await prisma.order.findMany({
    where: { items: { some: { sellerId: seller.id } } },
    include: {
      items: {
        where: { sellerId: seller.id },
        include: { product: { select: { title: true, images: true } } },
      },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const revenue = await prisma.orderItem.aggregate({
    where: {
      sellerId: seller.id,
      order: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
    },
    _sum: { price: true },
  });

  const totalOrders = await prisma.order.count({
    where: { items: { some: { sellerId: seller.id } } },
  });

  const avgRating = await prisma.review.aggregate({
    where: { product: { sellerId: seller.id } },
    _avg: { rating: true },
  });

  const stats = [
    {
      title: "Total Revenue",
      value: `$${(revenue._sum.price ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-blue-600",
    },
    {
      title: "Total Products",
      value: seller._count.products,
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Avg. Rating",
      value: avgRating._avg.rating ? `${avgRating._avg.rating.toFixed(1)}/5` : "N/A",
      icon: Star,
      color: "text-yellow-600",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{seller.storeName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={
                seller.status === "APPROVED"
                  ? "border-green-300 text-green-700 bg-green-50"
                  : seller.status === "PENDING"
                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                  : "border-red-300 text-red-700 bg-red-50"
              }
            >
              {seller.status}
            </Badge>
          </div>
        </div>
      </div>

      {seller.status === "PENDING" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-800 text-sm font-medium">
            Your seller application is under review. You&apos;ll be notified once approved.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Recent Orders
            <Link href="/seller/orders" className="text-sm text-blue-600 font-normal hover:underline">
              View all
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer.name} · {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.map((i) => i.product.title).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs mb-1">
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
