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

  const labelClass =
    "block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-2";

  const inputClass =
    "w-full bg-[#1a0505] border border-[#3a1010] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/40 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0303] via-[#120202] to-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">

        {/* Page Header */}
        <div>
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-2">
            HR Sales
          </p>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-red-600 leading-none">
            Generate Invoice
          </h1>
          <p className="text-sm text-gray-400 mt-3">
            Fill in the details below to generate and download a PDF invoice.
          </p>
          <div className="w-16 h-[3px] bg-red-600 rounded-full mt-5" />
        </div>

        {/* Customer Details */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <label className={labelClass}>
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              placeholder="e.g. Pinky Lenka"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+91 9XXXXXXXXX"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Bill No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.billNo}
                onChange={(e) => updateField("billNo", e.target.value)}
                placeholder="e.g. HRS-150"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="e.g. Koida, Odisha"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className={labelClass}>
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.invoiceDate}
                onChange={(e) => updateField("invoiceDate", e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
              Products
            </h2>
          </div>

          {form.products.map((product, index) => (
            <div
              key={index}
              className="border border-[#3a1010] rounded-xl p-4 sm:p-5 space-y-4 bg-[#150404]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-red-500">
                  Item #{index + 1}
                </span>
                {form.products.length > 1 && (
                  <button
                    onClick={() => removeProduct(index)}
                    className="text-gray-500 text-xs hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={product.title}
                  onChange={(e) => updateProduct(index, "title", e.target.value)}
                  placeholder="e.g. Electric Scooty Ola (Black)"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Details</label>
                <textarea
                  value={product.details}
                  onChange={(e) => updateProduct(index, "details", e.target.value)}
                  placeholder="Battery capacity, charger spec, serial no..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className={labelClass}>Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={product.qty}
                    onChange={(e) => updateProduct(index, "qty", Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={product.amount}
                    onChange={(e) => updateProduct(index, "amount", Number(e.target.value))}
                    placeholder="e.g. 75000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addProduct}
            className="w-full border-2 border-dashed border-[#3a1010] rounded-xl py-3 text-sm font-semibold text-gray-500 hover:border-red-600 hover:text-red-500 transition-colors"
          >
            + Add Product
          </button>

          <div className="flex justify-end pt-1">
            <div className="text-sm font-semibold text-gray-400">
              Total:{" "}
              <span className="text-xl font-black text-red-500">
                ₹ {total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-700 text-white font-bold uppercase tracking-wide py-4 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-lg shadow-red-900/40"
        >
          {loading ? "Generating PDF..." : "Generate PDF"}
        </button>

      </div>
    </div>
  );
}