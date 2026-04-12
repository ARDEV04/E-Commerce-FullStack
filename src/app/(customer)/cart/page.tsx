"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import { LinkButton } from "@/components/ui/link-button";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some products to get started</p>
        <LinkButton href="/products">Browse Products</LinkButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-xl">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.title}</h3>
                <p className="text-sm font-bold">${item.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      className="px-2 py-1 hover:bg-muted rounded-l-lg transition-colors"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button
                      className="px-2 py-1 hover:bg-muted rounded-r-lg transition-colors"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 transition-colors"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
            >
              Clear cart
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${total().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <LinkButton href="/checkout" className="w-full" size="lg">
            Proceed to Checkout
          </LinkButton>
          <div className="mt-3">
            <LinkButton href="/products" variant="outline" className="w-full">
              Continue Shopping
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
