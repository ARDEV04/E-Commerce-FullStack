import { prisma } from "@/lib/prisma";
import AddCategoryForm from "@/components/admin/AddCategoryForm";
import { Badge } from "@/components/ui/badge";

export default async function AdminCategoriesPage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  try {
    categories = await prisma.category.findMany({
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch { /* DB unreachable */ }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Slug</th>
                <th className="text-left p-4 font-medium">Products</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-muted-foreground">
                    No categories yet
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4">
                      <Badge variant="secondary">{cat.slug}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{cat._count.products}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddCategoryForm />
      </div>
    </div>
  );
}
