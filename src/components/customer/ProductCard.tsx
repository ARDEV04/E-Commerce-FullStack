"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  featured: boolean;
  seller: { storeName: string; rating: number };
  reviews: { rating: number }[];
  _count: { reviews: number };
  stock: number;
  sellerId: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] ?? "",
      quantity: 1,
      stock: product.stock,
      sellerId: product.sellerId,
    });
    toast.success("Added to cart");
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              -{discount}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-blue-600">
              Featured
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-1">
          <p className="text-xs text-muted-foreground mb-1">{product.seller.storeName}</p>
          <h3 className="text-sm font-medium line-clamp-2 mb-2 flex-1">{product.title}</h3>

          {avgRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {avgRating.toFixed(1)} ({product._count.reviews})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
              {product.comparePrice && (
                <span className="text-xs text-muted-foreground line-through ml-1">
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
