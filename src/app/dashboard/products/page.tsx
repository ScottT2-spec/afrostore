"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Archive,
  ArrowUpDown,
  Package,
  ImageIcon,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Grid3X3,
  List,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

const products = [
  {
    id: "1",
    name: "Ankara Maxi Dress",
    description: "Beautiful handmade Ankara print maxi dress with modern cut",
    price: 15000,
    compareAt: 22000,
    stock: 12,
    category: "Fashion",
    status: "active" as const,
    image: "from-pink-400 to-rose-500",
    variants: 3,
    sold: 48,
  },
  {
    id: "2",
    name: "Gold Hoop Earrings",
    description: "18k gold-plated statement hoop earrings",
    price: 9000,
    stock: 25,
    category: "Jewelry",
    status: "active" as const,
    image: "from-amber-400 to-orange-500",
    variants: 2,
    sold: 36,
  },
  {
    id: "3",
    name: "Leather Crossbody Bag",
    description: "Genuine leather crossbody bag with African-inspired pattern",
    price: 15000,
    stock: 4,
    category: "Accessories",
    status: "active" as const,
    image: "from-amber-600 to-yellow-600",
    variants: 4,
    sold: 29,
  },
  {
    id: "4",
    name: "Shea Butter Skincare Set",
    description: "Natural shea butter face cream, body lotion, and lip balm",
    price: 8000,
    stock: 42,
    category: "Beauty",
    status: "active" as const,
    image: "from-green-400 to-emerald-500",
    variants: 1,
    sold: 24,
  },
  {
    id: "5",
    name: "African Print Sneakers",
    description: "Custom-designed sneakers with Kente cloth pattern",
    price: 18000,
    compareAt: 25000,
    stock: 8,
    category: "Shoes",
    status: "active" as const,
    image: "from-blue-400 to-indigo-500",
    variants: 5,
    sold: 21,
  },
  {
    id: "6",
    name: "Dashiki Summer Shirt",
    description: "Lightweight dashiki-style shirt for warm weather",
    price: 12000,
    stock: 0,
    category: "Fashion",
    status: "draft" as const,
    image: "from-purple-400 to-violet-500",
    variants: 3,
    sold: 0,
  },
  {
    id: "7",
    name: "Beaded Statement Necklace",
    description: "Handcrafted beaded necklace with Maasai-inspired design",
    price: 6500,
    stock: 18,
    category: "Jewelry",
    status: "active" as const,
    image: "from-red-400 to-pink-500",
    variants: 2,
    sold: 15,
  },
  {
    id: "8",
    name: "Coconut Oil Hair Treatment",
    description: "Premium cold-pressed coconut oil for hair growth and moisture",
    price: 4500,
    stock: 60,
    category: "Beauty",
    status: "active" as const,
    image: "from-teal-400 to-cyan-500",
    variants: 1,
    sold: 42,
  },
];

const categories = ["All", "Fashion", "Jewelry", "Beauty", "Accessories", "Shoes"];

export default function ProductsPage() {
  const [view, setView] = useState<"grid" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <DashboardHeader
        title="Products"
        subtitle={`${products.length} products in your store`}
        action={{ label: "Add Product", onClick: () => setShowAddModal(true) }}
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-brand-50 text-brand-700 border border-brand-200"
                    : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-colors ${
                view === "list" ? "bg-surface-100 text-surface-900" : "text-surface-400 hover:text-surface-600"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-colors ${
                view === "grid" ? "bg-surface-100 text-surface-900" : "text-surface-400 hover:text-surface-600"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Products Table */}
        {view === "list" ? (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-surface-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden lg:table-cell">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden lg:table-cell">
                    Sold
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <input type="checkbox" className="rounded border-surface-300" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-11 w-11 rounded-xl bg-gradient-to-br ${product.image} flex-shrink-0`}
                        />
                        <div>
                          <div className="text-sm font-semibold text-surface-900">
                            {product.name}
                          </div>
                          <div className="text-[10px] text-surface-400">
                            {product.variants} variant{product.variants > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className="inline-flex rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-medium text-surface-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm font-semibold text-surface-900">
                        ₦{product.price.toLocaleString()}
                      </div>
                      {product.compareAt && (
                        <div className="text-[10px] text-surface-400 line-through">
                          ₦{product.compareAt.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        {product.stock === 0 ? (
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        ) : product.stock < 10 ? (
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        )}
                        <span
                          className={`text-sm ${
                            product.stock === 0
                              ? "text-red-600 font-semibold"
                              : product.stock < 10
                                ? "text-amber-600"
                                : "text-surface-600"
                          }`}
                        >
                          {product.stock === 0 ? "Out of stock" : product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                          product.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-surface-50 text-surface-500 border-surface-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.status === "active"
                              ? "bg-green-500"
                              : "bg-surface-400"
                          }`}
                        />
                        {product.status === "active" ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <span className="text-sm text-surface-600">{product.sold}</span>
                    </td>
                    <td className="px-6 py-3">
                      <button className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border border-surface-200 bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className={`aspect-square bg-gradient-to-br ${product.image} relative`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-surface-700 hover:bg-surface-50">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-surface-700 hover:bg-surface-50">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {product.status === "draft" && (
                    <div className="absolute top-2 left-2 rounded-full bg-surface-800/80 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Draft
                    </div>
                  )}
                  {product.compareAt && (
                    <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      -{Math.round(((product.compareAt - product.price) / product.compareAt) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-surface-900 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-base font-bold text-surface-900">
                        ₦{product.price.toLocaleString()}
                      </span>
                      {product.compareAt && (
                        <span className="ml-1.5 text-xs text-surface-400 line-through">
                          ₦{product.compareAt.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-surface-400">
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add product card */}
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-2xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center gap-3 py-12 text-surface-400 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50/50 transition-all"
            >
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">Add Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <div>
                <h2 className="text-lg font-bold text-surface-900">Add New Product</h2>
                <p className="text-xs text-surface-500 mt-0.5">Add a product to your store</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-surface-400 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* AI Generate Banner */}
              <div className="rounded-xl bg-gradient-to-r from-brand-50 to-accent-50 border border-brand-100 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-surface-900">Let AI generate this product</p>
                  <p className="text-xs text-surface-500">Upload an image or describe your product and AI fills in everything.</p>
                </div>
                <button className="btn-primary text-xs py-2 px-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  Use AI
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Product name</label>
                <input type="text" className="input-field" placeholder="e.g., Ankara Maxi Dress" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <textarea className="input-field min-h-[100px] resize-y" placeholder="Describe your product..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Price (₦)</label>
                  <input type="number" className="input-field" placeholder="15,000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Compare at price (₦)</label>
                  <input type="number" className="input-field" placeholder="22,000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Category</label>
                  <select className="input-field">
                    <option>Select category</option>
                    <option>Fashion</option>
                    <option>Beauty</option>
                    <option>Electronics</option>
                    <option>Food</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Stock quantity</label>
                  <input type="number" className="input-field" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Product images</label>
                <div className="border-2 border-dashed border-surface-300 rounded-xl p-8 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-sm text-surface-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-surface-400 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-surface-100 bg-surface-50 rounded-b-2xl">
              <button className="btn-ghost text-sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <div className="flex gap-3">
                <button className="btn-secondary text-sm">Save as Draft</button>
                <button className="btn-primary text-sm">
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
