import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../../services/api.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "windows", label: "Windows" },
  { value: "doors", label: "Doors" },
  { value: "curtain_walls", label: "Curtain Walls" },
  { value: "partitions", label: "Partitions" },
  { value: "balustrades", label: "Balustrades" },
  { value: "stainless_steel_railings", label: "Stainless Steel Railings" },
  { value: "frameless_glass", label: "Frameless Glass" },
  { value: "gypsum_ceilings", label: "Gypsum Ceilings" },
  { value: "kitchen_cabinets", label: "Kitchen Cabinets" },
  { value: "floor_tiling", label: "Floor Tiling" },
];

const FINISHES = [
  { value: "mill", label: "Mill" },
  { value: "silver", label: "Silver" },
  { value: "black", label: "Black" },
  { value: "champagne", label: "Champagne" },
  { value: "bronze", label: "Bronze" },
  { value: "clear", label: "Clear" },
  { value: "brushed", label: "Brushed" },
  { value: "white", label: "White" },
  { value: "wood_effect", label: "Wood Effect" },
  { value: "natural", label: "Natural" },
];

export default function AdminProductsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "windows",
    finish: "mill",
    description: "",
    base_price_per_sqm_kes: "",
    image_url: "",
    published: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => productApi.getAllProducts(),
    enabled: !!user && user.role === "admin",
  });

  const createMutation = useMutation({
    mutationFn: (payload) => productApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product created successfully");
      setShowForm(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product updated successfully");
      setEditingProduct(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "windows",
      finish: "mill",
      description: "",
      base_price_per_sqm_kes: "",
      image_url: "",
      published: true,
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingProduct(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.finish) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!selectedFile && !formData.image_url?.trim()) {
      toast.error("Please upload a file or provide an image URL");
      return;
    }
    const payload = selectedFile ? (() => {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("category", formData.category);
      fd.append("finish", formData.finish);
      fd.append("description", formData.description);
      fd.append("base_price_per_sqm_kes", formData.base_price_per_sqm_kes);
      fd.append("published", formData.published);
      fd.append("image", selectedFile);
      return fd;
    })() : formData;
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      category: product.category || "windows",
      finish: product.finish || "mill",
      description: product.description || "",
      base_price_per_sqm_kes: product.base_price_per_sqm_kes || "",
      image_url: product.image_url || "",
      published: product.published ?? true,
    });
    setPreviewUrl(product.image_url || "");
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="card text-center py-12">
        <p className="text-silver-400">Admin access required</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const products = data?.data?.data || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
            Product Management
          </h2>
          <p className="text-silver-400">
            Add, edit, and manage product catalogue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-silver-500">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => { setShowForm(true); resetForm(); }}
            className="btn-primary"
          >
            + Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-warmwhite mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Product Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="input-field"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 w-full rounded object-cover"
                    />
                  </div>
                )}
                <div className="my-2">
                  <label className="input-label">Or paste Cloudinary URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Standard Window"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Finish *</label>
                <select
                  value={formData.finish}
                  onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                  className="input-field"
                  required
                >
                  {FINISHES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Base Price per m² (KES) *</label>
                <input
                  type="number"
                  value={formData.base_price_per_sqm_kes}
                  onChange={(e) => setFormData({ ...formData, base_price_per_sqm_kes: e.target.value })}
                  placeholder="e.g. 1500"
                  className="input-field"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="self-end">
                <label className="flex items-center gap-2 text-sm text-silver-400">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Published
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                className="input-field min-h-[80px]"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary"
              >
                {(createMutation.isPending || updateMutation.isPending)
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Create Product"}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal-600">
              <th className="text-left px-4 py-3 text-silver-400 font-medium">Image</th>
              <th className="text-left px-4 py-3 text-silver-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-silver-400 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-silver-400 font-medium">Finish</th>
              <th className="text-right px-4 py-3 text-silver-400 font-medium">Price (KES/m²)</th>
              <th className="text-center px-4 py-3 text-silver-400 font-medium">Status</th>
              <th className="text-right px-4 py-3 text-silver-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-charcoal-700 hover:bg-charcoal-700/50 transition-colors"
              >
                <td className="px-4 py-3">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-charcoal-600 flex items-center justify-center">
                      <span className="text-xs text-silver-500">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-warmwhite font-medium">
                  {product.name}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-silver-300">
                    {product.category?.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-silver-300">
                    {product.finish}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-warmwhite">
                  {product.base_price_per_sqm_kes
                    ? parseFloat(product.base_price_per_sqm_kes).toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  {product.published ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-900/30 text-green-300">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-900/30 text-red-300">
                      Unpublished
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(product)} className="btn-secondary text-xs">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product.id, product.name)} className="btn-danger text-xs">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-silver-400">No products found.</p>
        </div>
      )}
    </div>
  );
}