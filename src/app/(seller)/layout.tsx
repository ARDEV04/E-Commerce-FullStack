import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Store,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/seller/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/seller/products", icon: Package, label: "Products" },
  { href: "/seller/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/seller/settings", icon: Settings, label: "Settings" },
];

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  // Non-seller/admin users can only reach /seller/apply (enforced by auth middleware).
  // Render without the sidebar so the apply page shows its own full-screen layout.
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Store className="h-5 w-5 text-blue-400" />
            ShopHub
          </Link>
          <p className="text-xs text-gray-400 mt-1">Seller Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-3">
            <p className="font-medium text-white truncate">{session.user.name}</p>
            <p className="truncate">{session.user.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
