import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: { customerId: session.user.id, status: "DELIVERED" },
      },
    });

    const review = await prisma.review.upsert({
      where: {
        productId_customerId: {
          productId: data.productId,
          customerId: session.user.id,
        },
      },
      create: {
        ...data,
        customerId: session.user.id,
        verified: !!hasPurchased,
      },
      update: {
        rating: data.rating,
        title: data.title,
        body: data.body,
      },
    });

    const agg = await prisma.review.aggregate({
      where: { productId: data.productId },
      _avg: { rating: true },
    });

    return NextResponse.json({ review, avgRating: agg._avg.rating });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
