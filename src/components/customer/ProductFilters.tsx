"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface Category {
  name: string;
  slug: string;
}

export default function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const activeCategory = searchParams.get("category");
  const activeSort = searchParams.get("sortBy") ?? "createdAt";
  const activeOrder = searchParams.get("order") ?? "desc";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    const search = searchParams.get("search");
    router.push(search ? `/products?search=${search}` : "/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Filters</h3>
        <button onClick={clearAll} className="text-xs text-blue-600 hover:underline">
          Clear all
        </button>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Sort By</h4>
        <div className="space-y-1">
          {[
            { label: "Newest", sortBy: "createdAt", order: "desc" },
            { label: "Price: Low to High", sortBy: "price", order: "asc" },
            { label: "Price: High to Low", sortBy: "price", order: "desc" },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("sortBy", opt.sortBy);
                params.set("order", opt.order);
                params.delete("page");
                router.push(`/products?${params.toString()}`);
              }}
              className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                activeSort === opt.sortBy && activeOrder === opt.order
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium mb-3">Categories</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", null)}
            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
              !activeCategory
                ? "bg-blue-50 text-blue-700 font-medium"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateParam("category", cat.slug)}
              className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                activeCategory === cat.slug
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium mb-3">Price Range</h4>
        <div className="flex gap-2 items-center mb-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button size="sm" className="w-full" onClick={applyPriceFilter}>
          Apply
        </Button>
      </div>

      <Separator />

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.get("featured") === "true"}
            onChange={(e) => updateParam("featured", e.target.checked ? "true" : null)}
            className="rounded"
          />
          <span className="text-sm">Featured only</span>
        </label>
      </div>
    </div>
  );
}
