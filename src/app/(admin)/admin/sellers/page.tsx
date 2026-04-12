import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import SellerActionButtons from "@/components/admin/SellerActionButtons";

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const sellers = await prisma.sellerProfile.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "SUSPENDED" } : undefined,
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
    APPROVED: "bg-green-100 text-green-700 border-green-300",
    SUSPENDED: "bg-red-100 text-red-700 border-red-300",
  };

  const tabs = ["ALL", "PENDING", "APPROVED", "SUSPENDED"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sellers ({sellers.length})</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <a
            key={tab}
            href={tab === "ALL" ? "/admin/sellers" : `/admin/sellers?status=${tab}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              (tab === "ALL" && !status) || status === tab
                ? "bg-slate-900 text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            {tab}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium">Store</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Email</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">Products</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium hidden lg:table-cell">Applied</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-muted-foreground">
                  No sellers found
                </td>
              </tr>
            ) : (
              sellers.map((seller) => (
                <tr key={seller.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{seller.storeName}</p>
                    <p className="text-xs text-muted-foreground">{seller.user.name}</p>
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {seller.user.email}
                  </td>
                  <td className="p-4 hidden sm:table-cell">{seller._count.products}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColors[seller.status] ?? ""}>
                      {seller.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell">
                    {format(new Date(seller.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <SellerActionButtons
                      sellerId={seller.id}
                      currentStatus={seller.status}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
