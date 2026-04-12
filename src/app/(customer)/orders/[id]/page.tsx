import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Truck, Package, Home, CreditCard } from "lucide-react";
import { format } from "date-fns";
import CancelOrderButton from "@/components/customer/CancelOrderButton";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAYMENT_CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const statusSteps = [
  { key: "PAYMENT_CONFIRMED", label: "Payment Confirmed", icon: CreditCard },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Home },
];

function getStepIndex(status: string) {
  return statusSteps.findIndex((s) => s.key === status);
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { title: true, images: true, slug: true } },
        },
      },
      shippingAddress: true,
      customer: { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();
  if (session.user.role === "CUSTOMER" && order.customerId !== session.user.id) {
    notFound();
  }

  const currentStep = getStepIndex(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-muted-foreground text-sm">
            Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusColors[order.status]}>
            {order.status.replace(/_/g, " ")}
          </Badge>
          {["PENDING", "PAYMENT_CONFIRMED"].includes(order.status) && (
            <CancelOrderButton orderId={order.id} />
          )}
        </div>
      </div>

      {!["CANCELLED", "REFUNDED", "PENDING"].includes(order.status) && (
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-6">Order Status</h2>
          <div className="flex items-start relative">
            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const done = currentStep >= i;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 z-10 ${
                    done ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                  }`}>
                    {done ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Icon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className={`mt-2 text-xs text-center ${done ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  {i < statusSteps.length - 1 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${done && currentStep > i ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Items ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id}>
                  <div className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      {item.trackingNum && (
                        <p className="text-xs text-blue-600 mt-1">
                          Tracking: {item.trackingNum}
                        </p>
                      )}
                    </div>
                    <p className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Order Total</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="border rounded-xl p-5">
              <h2 className="font-semibold mb-3">Shipping Address</h2>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                <br />
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}

          <LinkButton href="/orders" variant="outline" className="w-full">
            Back to Orders
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
