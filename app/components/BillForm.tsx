"use client";

import { useState } from "react";

interface Product {
  title: string;
  details: string;
  qty: number;
  amount: number;
}

interface FormData {
  customerName: string;
  phone: string;
  address: string;
  billNo: string;
  invoiceDate: string;
  products: Product[];
}

const defaultProduct = (): Product => ({
  title: "",
  details: "",
  qty: 1,
  amount: 0,
});

const defaultForm = (): FormData => ({
  customerName: "",
  phone: "",
  address: "",
  billNo: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  products: [defaultProduct()],
});

export default function BillForm() {
  const [form, setForm] = useState<FormData>(defaultForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof Omit<FormData, "products">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    setForm((prev) => {
      const products = [...prev.products];
      products[index] = { ...products[index], [field]: value };
      return { ...prev, products };
    });
  };

  const addProduct = () => {
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, defaultProduct()],
    }));
  };

  const removeProduct = (index: number) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const total = form.products.reduce((sum, p) => sum + Number(p.amount), 0);

  const handleSubmit = async () => {
    setError(null);

    if (!form.customerName.trim()) return setError("Customer name is required.");
    if (!form.billNo.trim()) return setError("Bill number is required.");
    if (!form.invoiceDate) return setError("Invoice date is required.");
    if (form.products.some((p) => !p.title.trim())) {
      return setError("All products must have a title.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to generate PDF.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${form.billNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Customer Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="123 Street, City, Country"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.billNo}
              onChange={(e) => updateField("billNo", e.target.value)}
              placeholder="INV-001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.invoiceDate}
              onChange={(e) => updateField("invoiceDate", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Products</h2>

        {form.products.map((product, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Item #{index + 1}</span>
              {form.products.length > 1 && (
                <button
                  onClick={() => removeProduct(index)}
                  className="text-red-500 text-xs hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={product.title}
                onChange={(e) => updateProduct(index, "title", e.target.value)}
                placeholder="Product name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                value={product.details}
                onChange={(e) => updateProduct(index, "details", e.target.value)}
                placeholder="Additional description (optional)"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={product.qty}
                  onChange={(e) => updateProduct(index, "qty", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={product.amount}
                  onChange={(e) => updateProduct(index, "amount", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addProduct}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + Add Product
        </button>

        <div className="flex justify-end pt-2">
          <div className="text-sm font-semibold text-gray-700">
            Total: <span className="text-lg font-bold text-gray-900">৳ {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm tracking-wide"
      >
        {loading ? "Generating PDF..." : "Generate PDF"}
      </button>
    </div>
  );
}