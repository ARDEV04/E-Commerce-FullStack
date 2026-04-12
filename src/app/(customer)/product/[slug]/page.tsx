import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Package, Shield, Truck } from "lucide-react";
import AddToCartButton from "@/components/customer/AddToCartButton";
import ReviewForm from "@/components/customer/ReviewForm";
import { auth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });
  return {
    title: product?.title,
    description: product?.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      seller: {
        include: {
          user: { select: { name: true, image: true } },
          _count: { select: { products: true } },
        },
      },
      reviews: {
        include: { customer: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image
              </div>
            )}
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-base px-3 py-1">
                -{discount}% OFF
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={img} alt={`${product.title} ${i + 2}`} fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {product.category.name} · {product.seller.storeName}
            </p>
            <h1 className="text-2xl font-bold">{product.title}</h1>
          </div>

          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({product._count.reviews} reviews)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                In Stock ({product.stock} left)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
                Out of Stock
              </Badge>
            )}
          </div>

          <AddToCartButton product={{
            id: product.id,
            title: product.title,
            price: product.price,
            images: product.images,
            stock: product.stock,
            sellerId: product.sellerId,
          }} />

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-lg text-center">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="text-xs">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-lg text-center">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-xs">Buyer Protection</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-lg text-center">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-xs">Easy Returns</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator className="my-10" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6">
            Customer Reviews ({product._count.reviews})
          </h2>

          {product.reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{review.customer.name ?? "Anonymous"}</p>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                  {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
                  {review.verified && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Verified Purchase
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <h3 className="font-semibold mb-3">Rating Breakdown</h3>
            <div className="space-y-2">
              {ratingDist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-4">{star}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width:
                          product._count.reviews > 0
                            ? `${(count / product._count.reviews) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="w-6 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {session && (
            <ReviewForm productId={product.id} />
          )}
        </div>
      </div>
    </div>
  );
}
