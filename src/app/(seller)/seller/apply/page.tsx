"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";

export default function SellerApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    storeName: "",
    description: "",
    phone: "",
    address: "",
    paypalEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to submit");
        return;
      }
      toast.success("Application submitted! We'll review it shortly.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Store className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Become a Seller</h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to apply as a seller on ShopHub.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seller Application</CardTitle>
            <CardDescription>
              Your application will be reviewed within 1-2 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={form.storeName}
                  onChange={(e) => update("storeName", e.target.value)}
                  placeholder="My Awesome Store"
                  className="mt-1"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <Label htmlFor="description">Store Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Tell us about your store and what you sell..."
                  rows={4}
                  className="mt-1"
                  required
                  minLength={20}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="123 Main St, City, Country"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paypalEmail">PayPal Email (for payouts)</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={form.paypalEmail}
                  onChange={(e) => update("paypalEmail", e.target.value)}
                  placeholder="paypal@youremail.com"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
