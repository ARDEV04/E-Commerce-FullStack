"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "next/image";
import { X, Upload } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  comparePrice?: number | null;
  stock?: number;
  categoryId?: string;
  images?: string[];
  tags?: string[];
  weight?: number | null;
  sku?: string | null;
  status?: string;
  featured?: boolean;
}

export default function ProductForm({
  categories,
  initialData,
}: {
  categories: Category[];
  initialData?: ProductData;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price?.toString() ?? "",
    comparePrice: initialData?.comparePrice?.toString() ?? "",
    stock: initialData?.stock?.toString() ?? "0",
    categoryId: initialData?.categoryId ?? "",
    images: initialData?.images ?? [] as string[],
    tags: initialData?.tags?.join(", ") ?? "",
    weight: initialData?.weight?.toString() ?? "",
    sku: initialData?.sku ?? "",
    status: initialData?.status ?? "ACTIVE",
    featured: initialData?.featured ?? false,
  });

  const update = (key: string, value: string | boolean | string[] | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        urls.push(data.url);
      }
      update("images", [...form.images, ...urls]);
      toast.success("Images uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    update("images", form.images.filter((i) => i !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock: parseInt(form.stock),
        categoryId: form.categoryId,
        images: form.images,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        weight: form.weight ? parseFloat(form.weight) : null,
        sku: form.sku || null,
        status: form.status,
        featured: form.featured,
      };

      const url = initialData?.id ? `/api/products/${initialData.id}` : "/api/products";
      const method = initialData?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save product");
      }

      toast.success(initialData?.id ? "Product updated" : "Product created");
      router.push("/seller/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Product Information</h2>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Product title"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe your product..."
                rows={6}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="electronics, gadget, wireless"
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Images *</h2>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Click to upload images"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" sizes="100px" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Pricing</h2>
            <div>
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0.00"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="comparePrice">Compare at Price</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                value={form.comparePrice}
                onChange={(e) => update("comparePrice", e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Inventory</h2>
            <div>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="SKU-001"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Organization</h2>
            <div>
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => update("categoryId", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured Product</Label>
              <Switch
                id="featured"
                checked={form.featured}
                onCheckedChange={(v) => update("featured", v)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || uploading}>
            {loading ? "Saving..." : initialData?.id ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
