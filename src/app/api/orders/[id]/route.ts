import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { title: true, images: true, slug: true } } } },
      shippingAddress: true,
      customer: { select: { name: true, email: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role === "CUSTOMER" && order.customerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, itemId, trackingNum } = body;

  if (itemId && trackingNum && session.user.role === "SELLER") {
    const updated = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        trackingNum,
        shippedAt: new Date(),
      },
    });
    return NextResponse.json(updated);
  }

  if (status && (session.user.role === "ADMIN" || session.user.role === "SELLER")) {
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updated);
  }

  if (status === "CANCELLED" && session.user.role === "CUSTOMER") {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!["PENDING", "PAYMENT_CONFIRMED"].includes(order.status)) {
      return NextResponse.json({ error: "Cannot cancel" }, { status: 400 });
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
