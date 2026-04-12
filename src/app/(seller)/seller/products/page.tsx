import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import DeleteProductButton from "@/components/seller/DeleteProductButton";

export default async function SellerProductsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!seller) redirect("/seller/apply");

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id, status: { not: "DELETED" } },
    include: {
      category: { select: { name: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColor: Record<string, string> = {
    ACTIVE: "border-green-300 text-green-700 bg-green-50",
    DRAFT: "border-gray-300 text-gray-700 bg-gray-50",
    INACTIVE: "border-red-300 text-red-700 bg-red-50",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <LinkButton href="/seller/products/new">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </LinkButton>
      </div>

      {products.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">No products yet</p>
          <LinkButton href="/seller/products/new">Add Your First Product</LinkButton>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Category</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        )}
                      </div>
                      <span className="font-medium line-clamp-1">{product.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {product.category.name}
                  </td>
                  <td className="p-4 font-medium">${product.price.toFixed(2)}</td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className={product.stock === 0 ? "text-red-600 font-medium" : ""}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColor[product.status] ?? ""}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/seller/products/${product.id}`}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
