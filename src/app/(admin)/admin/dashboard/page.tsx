import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Store, Package, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let totalUsers = 0, totalSellers = 0, totalProducts = 0, totalOrders = 0, pendingSellers = 0;
  let revenueResult: { _sum: { total: number | null } } = { _sum: { total: null } };
  let recentOrders: { id: string; total: number; status: string; createdAt: Date; customer: { name: string | null } }[] = [];

  try {
    [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      pendingSellers,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.sellerProfile.count({ where: { status: "APPROVED" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count({ where: { status: { notIn: ["CANCELLED", "REFUNDED"] } } }),
      prisma.order.aggregate({
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { name: true } } },
      }),
      prisma.sellerProfile.count({ where: { status: "PENDING" } }),
    ]);
  } catch {
    // DB unreachable — render with empty state
  }

  const stats = [
    {
      title: "Gross Revenue",
      value: `$${(revenueResult._sum.total ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Active Sellers",
      value: totalSellers.toLocaleString(),
      icon: Store,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Active Products",
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAYMENT_CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {pendingSellers > 0 && (
        <Link href="/admin/sellers?status=PENDING">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 hover:bg-yellow-100 transition-colors">
            <p className="text-yellow-800 font-medium">
              {pendingSellers} seller application{pendingSellers > 1 ? "s" : ""} awaiting review
            </p>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Recent Orders
            <Link href="/admin/orders" className="text-sm text-blue-600 font-normal hover:underline">
              View all
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium hidden md:table-cell">Customer</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 text-muted-foreground hidden md:table-cell">
                    {order.customer.name}
                  </td>
                  <td className="py-3 font-medium">${order.total.toFixed(2)}</td>
                  <td className="py-3">
                    <Badge className={statusColors[order.status]}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground hidden sm:table-cell">
                    {format(new Date(order.createdAt), "MMM d")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
