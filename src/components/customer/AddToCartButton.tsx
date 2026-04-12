"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  stock: number;
  sellerId: string;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] ?? "",
      quantity: qty,
      stock: product.stock,
      sellerId: product.sellerId,
    });
    toast.success(`${qty} item${qty > 1 ? "s" : ""} added to cart`);
  };

  if (product.stock === 0) {
    return (
      <Button disabled className="w-full" size="lg">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex items-center border rounded-lg">
        <button
          className="px-3 py-2 hover:bg-muted transition-colors rounded-l-lg"
          onClick={() => setQty(Math.max(1, qty - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-4 py-2 font-medium min-w-[40px] text-center">{qty}</span>
        <button
          className="px-3 py-2 hover:bg-muted transition-colors rounded-r-lg"
          onClick={() => setQty(Math.min(product.stock, qty + 1))}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button className="flex-1" size="lg" onClick={handleAdd}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </div>
  );
}
