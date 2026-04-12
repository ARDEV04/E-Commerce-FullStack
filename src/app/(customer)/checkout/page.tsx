"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const defaultAddress: ShippingAddress = {
  firstName: "",
  lastName: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  phone: "",
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [address, setAddress] = useState<ShippingAddress>(defaultAddress);
  const [step, setStep] = useState<"address" | "payment">("address");
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["firstName", "lastName", "street", "city", "state", "postalCode", "country"] as const;
    for (const field of required) {
      if (!address[field]) {
        toast.error(`Please fill in ${field}`);
        return;
      }
    }
    setStep("payment");
  };

  const createOrder = async () => {
    const res = await fetch("/api/payments/paypal?action=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ title: i.title, price: i.price, quantity: i.quantity })),
        shippingCost: 0,
      }),
    });
    const data = await res.json();
    return data.id;
  };

  const onApprove = async (data: { orderID: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/paypal?action=capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          cartItems: items,
          shippingAddress: address,
          shippingCost: 0,
        }),
      });

      if (!res.ok) throw new Error("Payment failed");

      const { orderId } = await res.json();
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders/${orderId}`);
    } catch {
      toast.error("Payment capture failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === "address" ? (
            <div className="border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-5">Shipping Address</h2>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={address.firstName}
                      onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={address.lastName}
                      onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Continue to Payment
                </Button>
              </form>
            </div>
          ) : (
            <div className="border rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">Payment</h2>
                <button
                  onClick={() => setStep("address")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit Address
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                <p className="font-medium mb-1">Shipping to:</p>
                <p className="text-muted-foreground">
                  {address.firstName} {address.lastName}, {address.street}, {address.city},{" "}
                  {address.state} {address.postalCode}, {address.country}
                </p>
              </div>
              <PayPalScriptProvider
                options={{
                  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "test",
                  currency: "USD",
                }}
              >
                <PayPalButtons
                  style={{ layout: "vertical", color: "blue", shape: "rect" }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  disabled={loading}
                />
              </PayPalScriptProvider>
              {loading && (
                <p className="text-center text-muted-foreground mt-4">
                  Processing your order...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white shrink-0">
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
          <Separator className="mb-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
