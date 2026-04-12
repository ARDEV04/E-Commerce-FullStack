import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const emptyToUndefined = z.literal("").transform(() => undefined);

const applySchema = z.object({
  storeName: z.string().min(3),
  description: z.string().min(20),
  phone: z.string().optional().or(emptyToUndefined),
  address: z.string().optional().or(emptyToUndefined),
  paypalEmail: z.string().email().optional().or(emptyToUndefined),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Already applied" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = applySchema.parse(body);
    const seller = await prisma.sellerProfile.create({
      data: { ...data, userId: session.user.id },
    });
    return NextResponse.json(seller, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(seller);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const seller = await prisma.sellerProfile.update({
      where: { userId: session.user.id },
      data: body,
    });
    return NextResponse.json(seller);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
