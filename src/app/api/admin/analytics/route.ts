import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalUsers,
    totalSellers,
    totalOrders,
    totalProducts,
    revenueResult,
    recentOrders,
    topProducts,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.sellerProfile.count({ where: { status: "APPROVED" } }),
    prisma.order.count({ where: { status: { notIn: ["CANCELLED", "REFUNDED"] } } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const topProductIds = topProducts.map((p) => p.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, title: true, images: true, price: true },
  });

  const topProductsWithDetails = topProducts.map((tp) => ({
    ...tp,
    product: topProductDetails.find((p) => p.id === tp.productId),
  }));

  return NextResponse.json({
    stats: {
      totalUsers,
      totalSellers,
      totalOrders,
      totalProducts,
      gmv: revenueResult._sum.total ?? 0,
    },
    recentOrders,
    topProducts: topProductsWithDetails,
  });
}
