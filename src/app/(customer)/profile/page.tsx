import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/customer/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: true,
      sellerProfile: { select: { status: true, storeName: true } },
      _count: { select: { orders: true } },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileForm user={{ name: user.name ?? "", email: user.email }} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </span>
                </div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge className="mt-2">{user.role}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Orders</span>
                  <Link href="/orders" className="font-medium text-blue-600 hover:underline">
                    {user._count.orders}
                  </Link>
                </div>
                {user.sellerProfile && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seller Status</span>
                    <Badge variant="outline" className="text-xs">
                      {user.sellerProfile.status}
                    </Badge>
                  </div>
                )}
              </div>
              {!user.sellerProfile && (
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href="/seller/apply"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Become a Seller →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
