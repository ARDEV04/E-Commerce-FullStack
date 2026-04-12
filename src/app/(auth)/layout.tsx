import Link from "next/link";
import { Store } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <Store className="h-6 w-6 text-blue-600" />
        ShopHub
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
