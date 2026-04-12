import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation, sendSellerOrderNotification } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "create") {
    const { items, shippingCost = 0 } = await req.json();

    const paypalItems = items.map((i: { title: string; price: number; quantity: number }) => ({
      name: i.title,
      unit_amount: i.price,
      quantity: i.quantity,
    }));

    const subtotal = paypalItems.reduce(
      (s: number, i: { unit_amount: number; quantity: number }) => s + i.unit_amount * i.quantity,
      0
    );
    const total = subtotal + shippingCost;

    const order = await createPayPalOrder(paypalItems, total);
    return NextResponse.json({ id: order.id });
  }

  if (action === "capture") {
    const {
      paypalOrderId,
      cartItems,
      shippingAddress,
      shippingCost = 0,
    } = await req.json();

    const capture = await capturePayPalOrder(paypalOrderId);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const subtotal = cartItems.reduce(
      (s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity,
      0
    );
    const total = subtotal + shippingCost;

    const order = await prisma.order.create({
      data: {
        customerId: session.user.id,
        subtotal,
        shippingCost,
        total,
        paypalOrderId,
        paypalCaptureId: capture.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        status: "PAYMENT_CONFIRMED",
        items: {
          create: cartItems.map((i: {
            id: string;
            title: string;
            price: number;
            quantity: number;
            image: string;
            sellerId: string;
          }) => ({
            productId: i.id,
            sellerId: i.sellerId,
            title: i.title,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
          })),
        },
        shippingAddress: {
          create: shippingAddress,
        },
      },
      include: { items: true },
    });

    await prisma.product.updateMany({
      where: { id: { in: cartItems.map((i: { id: string }) => i.id) } },
      data: { stock: { decrement: 1 } },
    });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.email) {
      await sendOrderConfirmation(user.email, order.id, order.total).catch(() => {});
    }

    const sellerIds = [...new Set(cartItems.map((i: { sellerId: string }) => i.sellerId))];
    for (const sid of sellerIds) {
      const sp = await prisma.sellerProfile.findUnique({
        where: { id: sid as string },
        include: { user: { select: { email: true } } },
      });
      if (sp?.user?.email) {
        const titles = cartItems
          .filter((i: { sellerId: string }) => i.sellerId === sid)
          .map((i: { title: string }) => i.title)
          .join(", ");
        await sendSellerOrderNotification(sp.user.email, order.id, titles).catch(() => {});
      }
    }

    return NextResponse.json({ orderId: order.id });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
