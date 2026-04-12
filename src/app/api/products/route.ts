import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import slugify from "@/lib/slugify";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  comparePrice: z.number().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string(),
  images: z.array(z.string()).min(1),
  tags: z.array(z.string()).optional(),
  weight: z.number().optional(),
  sku: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const featured = searchParams.get("featured");
  const sellerId = searchParams.get("sellerId");
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ],
    }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        }
      : {}),
    ...(featured === "true" && { featured: true }),
    ...(sellerId && { sellerId }),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { storeName: true, rating: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    pages: Math.ceil(total / limit),
    page,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!seller || seller.status !== "APPROVED") {
      return NextResponse.json({ error: "Seller not approved" }, { status: 403 });
    }

    const slug = await generateUniqueSlug(data.title);

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        sellerId: seller.id,
        tags: data.tags ?? [],
        status: "ACTIVE",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function generateUniqueSlug(title: string): Promise<string> {
  let slug = slugify(title);
  let count = 0;
  while (true) {
    const candidate = count === 0 ? slug : `${slug}-${count}`;
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    count++;
  }
}
