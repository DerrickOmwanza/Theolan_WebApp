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
];

const FINISHES = [
  { value: "mill", label: "Mill" },
  { value: "silver", label: "Silver" },
  { value: "black", label: "Black" },
  { value: "champagne", label: "Champagne" },
  { value: "bronze", label: "Bronze" },
];

export default function AdminGalleryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    image_url: "",
    category: "windows",
    finish: "",
    project_name: "",
    location: "",
    description: "",
    published: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-gallery", activeCategory],
    queryFn: () =>
      productApi.getGallery(
        activeCategory !== "all" ? { category: activeCategory, limit: 100 } : { limit: 100 },
      ),
    enabled: !!user && user.role === "admin",
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (data) => productApi.uploadGallery(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      toast.success("Image uploaded successfully");
      setShowUploadForm(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to upload image");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.deleteGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      toast.success("Image deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.updateGallery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      toast.success("Image updated successfully");
      setEditingId(null);
    },
    onError: () => {
      toast.error("Failed to update image");
    },
  });

  const resetForm = () => {
    setFormData({
      image_url: "",
      category: "windows",
      finish: "",
      project_name: "",
      location: "",
      description: "",
      published: true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image_url.trim()) {
      toast.error("Image URL is required");
      return;
    }
    uploadMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePublish = (item) => {
    updateMutation.mutate({
      id: item.id,
      data: { published: !item.published },
    });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      image_url: item.image_url || "",
      category: item.category || "windows",
      finish: item.finish || "",
      project_name: item.project_name || "",
      location: item.location || "",
      description: item.description || "",
      published: item.published,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.image_url.trim()) {
      toast.error("Image URL is required");
      return;
    }
    updateMutation.mutate({ id: editingId, data: formData });
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

  const items = data?.data?.data || [];
  const categories = [
    "all",
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
            Gallery Management
          </h2>
          <p className="text-silver-400">
            Add, edit, and manage portfolio images
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-silver-500">
            {items.length} image{items.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              resetForm();
            }}
            className="btn-primary"
          >
            {showUploadForm ? "Cancel" : "+ Add Image"}
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-warmwhite mb-4">
            Upload New Image
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Image URL *</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://res.cloudinary.com/..."
                  className="input-field"
                  required
                />
                <p className="text-xs text-silver-500 mt-1">
                  Upload image to Cloudinary first, then paste the URL here
                </p>
              </div>
              <div>
                <label className="input-label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
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
                <label className="input-label">Finish</label>
                <select
                  value={formData.finish}
                  onChange={(e) =>
                    setFormData({ ...formData, finish: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">None</option>
                  {FINISHES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Project Name</label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  placeholder="e.g. Commercial Office Tower"
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Nairobi, Kenya"
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the project..."
                  className="input-field min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm text-silver-400">
                Publish immediately
              </label>
            </div>
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="btn-primary"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-warmwhite mb-4">
            Edit Image
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Image URL *</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="input-field"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Finish</label>
                <select
                  value={formData.finish}
                  onChange={(e) =>
                    setFormData({ ...formData, finish: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">None</option>
                  {FINISHES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Project Name</label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-published"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="edit-published" className="text-sm text-silver-400">
                Published
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn-primary"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              activeCategory === cat
                ? "bg-cobalt text-white"
                : "bg-charcoal-700 text-silver-400 hover:text-warmwhite hover:bg-charcoal-600"
            }`}
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-silver-400 mb-4">No gallery images yet</p>
          <button onClick={() => setShowUploadForm(true)} className="btn-primary">
            Upload Your First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="card overflow-hidden group relative"
            >
              {/* Status badge */}
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    item.published
                      ? "bg-green-500/20 text-green-400"
                      : "bg-silver-500/20 text-silver-400"
                  }`}
                >
                  {item.published ? "Published" : "Draft"}
                </span>
              </div>

              {/* Image */}
              <div className="aspect-video bg-charcoal-700 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.project_name || "Gallery item"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="hidden absolute inset-0 items-center justify-center text-silver-500 text-sm"
                  style={{ display: item.image_url ? "none" : "flex" }}
                >
                  Image not available
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-warmwhite font-medium truncate">
                  {item.project_name || "Untitled"}
                </h3>
                {item.location && (
                  <p className="text-sm text-silver-500">{item.location}</p>
                )}
                {item.description && (
                  <p className="text-sm text-silver-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="px-2 py-0.5 bg-cobalt/10 text-cobalt-300 text-xs rounded-full capitalize">
                    {item.category?.replace("_", " ")}
                  </span>
                  {item.finish && (
                    <span className="px-2 py-0.5 bg-silver/10 text-silver-300 text-xs rounded-full capitalize">
                      {item.finish}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-charcoal-600">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 text-xs px-2 py-1.5 bg-charcoal-600 text-silver-300 rounded hover:bg-charcoal-500 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="flex-1 text-xs px-2 py-1.5 bg-charcoal-600 text-silver-300 rounded hover:bg-charcoal-500 transition-colors"
                  >
                    {item.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs px-2 py-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
