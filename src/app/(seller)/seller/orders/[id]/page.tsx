import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import FulfillOrderForm from "@/components/seller/FulfillOrderForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) redirect("/seller/apply");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        where: { sellerId: seller.id },
        include: { product: { select: { title: true, images: true } } },
      },
      customer: { select: { name: true, email: true } },
      shippingAddress: true,
    },
  });

  if (!order || order.items.length === 0) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/seller/orders" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <Badge>{order.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Your Items in This Order</h2>
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
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  {item.trackingNum ? (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        Tracking: {item.trackingNum}
                      </p>
                      {item.shippedAt && (
                        <p className="text-xs text-blue-600 mt-1">
                          Shipped: {format(new Date(item.shippedAt), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <FulfillOrderForm orderId={order.id} itemId={item.id} />
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-3">Customer</h2>
            <p className="text-sm font-medium">{order.customer.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
          </div>

          {order.shippingAddress && (
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-3">Ship To</h2>
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

          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-3">Order Info</h2>
            <p className="text-sm text-muted-foreground">
              Placed: {format(new Date(order.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
