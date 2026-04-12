import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendSellerApprovalEmail } from "@/lib/resend";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized", role: session?.user?.role ?? "none" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const sellers = await prisma.sellerProfile.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "SUSPENDED" } : undefined,
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sellers);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden – your role is: " + session.user.role },
      { status: 403 }
    );
  }

  try {
    const { sellerId, status } = await req.json();

    if (!sellerId || !status) {
      return NextResponse.json({ error: "sellerId and status are required" }, { status: 400 });
    }

    const seller = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: { status },
      include: { user: true },
    });

    // Promote user role to SELLER when approved
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: seller.userId },
        data: { role: "SELLER" },
      });
    }

    // Demote back to CUSTOMER when suspended
    if (status === "SUSPENDED") {
      await prisma.user.update({
        where: { id: seller.userId },
        data: { role: "CUSTOMER" },
      });
    }

    // Send email (non-blocking)
    await sendSellerApprovalEmail(
      seller.user.email!,
      status === "APPROVED"
    ).catch(() => {});

    return NextResponse.json({ success: true, seller });
  } catch (err) {
    console.error("Seller update error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
