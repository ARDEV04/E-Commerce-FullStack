import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/customer/ProductCard";
import ProductFilters from "@/components/customer/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import type { Prisma } from "@prisma/client";

interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  order?: string;
  featured?: string;
  page?: string;
}

async function ProductsGrid({ params }: { params: SearchParams }) {
  const page = parseInt(params.page ?? "1");
  const limit = 20;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(params.category && { category: { slug: params.category } }),
    ...(params.search && {
      OR: [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { tags: { has: params.search } },
      ],
    }),
    ...((params.minPrice || params.maxPrice) && {
      price: {
        ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
        ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
      },
    }),
    ...(params.featured === "true" && { featured: true }),
  };

  const sortBy = params.sortBy ?? "createdAt";
  const order = (params.order ?? "desc") as "asc" | "desc";

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { storeName: true, rating: true, id: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]).catch(() => [[], 0] as const);

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No products found.</p>
        <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} products
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              title: p.title,
              slug: p.slug,
              price: p.price,
              comparePrice: p.comparePrice,
              images: p.images,
              featured: p.featured,
              seller: p.seller,
              reviews: p.reviews,
              _count: p._count,
              stock: p.stock,
              sellerId: p.seller.id,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  }).catch(() => []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {params.search
            ? `Results for "${params.search}"`
            : params.category
            ? categories.find((c) => c.slug === params.category)?.name ?? "Products"
            : params.featured === "true"
            ? "Featured Products"
            : "All Products"}
        </h1>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <ProductFilters categories={categories} />
        </aside>
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            }
          >
            <ProductsGrid params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
