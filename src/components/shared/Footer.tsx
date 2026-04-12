import Link from "next/link";
import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <Store className="h-5 w-5 text-blue-600" />
              ShopHub
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop marketplace for thousands of products from verified sellers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-foreground transition-colors">Featured</Link></li>
              <li><Link href="/products?sortBy=price&order=asc" className="hover:text-foreground transition-colors">Best Deals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/profile" className="hover:text-foreground transition-colors">My Profile</Link></li>
              <li><Link href="/orders" className="hover:text-foreground transition-colors">My Orders</Link></li>
              <li><Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Sell</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/seller/apply" className="hover:text-foreground transition-colors">Become a Seller</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-foreground transition-colors">Seller Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ShopHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
