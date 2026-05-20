import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string }>;
}) {
  const { role, search } = await searchParams;

  let users: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  try { users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as "CUSTOMER" | "SELLER" | "ADMIN" } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      sellerProfile: { select: { status: true, storeName: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  }); } catch { /* DB unreachable */ }

  const roleColors: Record<string, string> = {
    CUSTOMER: "bg-gray-100 text-gray-700",
    SELLER: "bg-blue-100 text-blue-700",
    ADMIN: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>

      <div className="flex gap-2 mb-6">
        {["ALL", "CUSTOMER", "SELLER", "ADMIN"].map((tab) => (
          <a
            key={tab}
            href={tab === "ALL" ? "/admin/users" : `/admin/users?role=${tab}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              (tab === "ALL" && !role) || role === tab
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
              <th className="text-left p-4 font-medium">User</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Email</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">Orders</th>
              <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium">{user.name ?? "Anonymous"}</p>
                  {user.sellerProfile && (
                    <p className="text-xs text-muted-foreground">{user.sellerProfile.storeName}</p>
                  )}
                </td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">{user.email}</td>
                <td className="p-4">
                  <Badge className={roleColors[user.role] ?? ""}>{user.role}</Badge>
                </td>
                <td className="p-4 hidden sm:table-cell">{user._count.orders}</td>
                <td className="p-4 text-muted-foreground hidden lg:table-cell">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
