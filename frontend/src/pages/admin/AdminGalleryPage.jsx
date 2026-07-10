import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../../services/api.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "aluminium_fabrications", label: "Aluminium Fabrications" },
  { value: "stainless_steel_railings", label: "Stainless Steel Railings & Balusters" },
  { value: "frameless_glass", label: "Frameless Glass & Sunroofs" },
  { value: "gypsum_ceilings", label: "Gypsum Walls & Ceilings" },
  { value: "kitchen_cabinets", label: "Kitchen & Wardrobe Cabinets" },
  { value: "floor_tiling", label: "Floor Tiling" },
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
        activeCategory !== "all"
          ? { category: activeCategory, limit: 100 }
          : { limit: 100 },
      ),
    enabled: !!user && user.role === "admin",
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (payload) => productApi.uploadGallery(payload),
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
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (50MB max)
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

    if (!selectedFile && !formData.image_url?.trim()) {
      toast.error("Please upload a file or provide an image URL");
      return;
    }

    if (selectedFile) {
      // File upload via FormData
      const uploadData = new FormData();
      uploadData.append("image", selectedFile);
      uploadData.append("category", formData.category);
      if (formData.finish) uploadData.append("finish", formData.finish);
      if (formData.project_name)
        uploadData.append("project_name", formData.project_name);
      if (formData.location) uploadData.append("location", formData.location);
      if (formData.description)
        uploadData.append("description", formData.description);
      uploadData.append("published", formData.published);

      uploadMutation.mutate(uploadData);
    } else {
      // URL upload via JSON
      uploadMutation.mutate(formData);
    }
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
    setPreviewUrl(item.image_url || "");
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
            Add, edit, and manage portfolio images and videos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-silver-500">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              resetForm();
            }}
            className="btn-primary"
          >
            {showUploadForm ? "Cancel" : "+ Add Media"}
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-warmwhite mb-4">
            Upload New Image or Video
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">
                  Upload Media (recommended)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="input-field"
                />

                {previewUrl && (
                  <div className="mt-2">
                    {selectedFile?.type?.startsWith("video/") ? (
                      <video
                        src={previewUrl}
                        controls
                        className="max-h-40 w-full rounded"
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-40 w-full rounded object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="my-2">
                  <label className="input-label">
                    Or paste Cloudinary URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://res.cloudinary.com/..."
                    className="input-field"
                  />
                </div>

                <p className="text-xs text-silver-500 mt-1">
                  File types: JPG, PNG, WebP, GIF, MP4, WebM | Max size: 50MB
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
              {uploadMutation.isPending ? "Uploading..." : "Upload Media"}
            </button>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-warmwhite mb-4">
            Edit Media
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Image URL</label>
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
              <label
                htmlFor="edit-published"
                className="text-sm text-silver-400"
              >
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
          <p className="text-silver-400 mb-4">No gallery media yet</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="btn-primary"
          >
            Upload Your First Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card overflow-hidden group relative">
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
                {item.media_type && item.media_type !== "image" && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                    {item.media_type}
                  </span>
                )}
              </div>

              {/* Media */}
              <div className="aspect-video bg-charcoal-700 flex items-center justify-center overflow-hidden">
                {(() => {
                  const isVideoType = item.media_type === "video";
                  const isVideoUrl = item.image_url && 
                    /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(item.image_url);
                  
                  if (isVideoType || isVideoUrl) {
                    return (
                      <video
                        src={item.image_url}
                        controls
                        className="w-full h-full object-cover"
                        poster={item.image_url.replace(/\/upload\//, '/upload/w_400,h_300,c_fill/')}
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    );
                  }
                  
                  return (
                    <img
                      src={item.image_url}
                      alt={item.project_name || "Gallery item"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  );
                })()}
                <div
                  className="hidden absolute inset-0 items-center justify-center text-silver-500 text-sm"
                  style={{ display: item.image_url ? "none" : "flex" }}
                >
                  No media available
                </div>
              </div>

              {/* Details overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-900 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <h4 className="text-warmwhite font-semibold mb-1">
                  {item.project_name}
                </h4>
                <p className="text-silver-300 text-sm">
                  {item.category?.replace("_", " ")}
                </p>
                {item.finish && (
                  <span className="text-xs text-silver-400 capitalize">
                    {item.finish}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
                <button
                  onClick={() => handleTogglePublish(item)}
                  className="p-2 bg-charcoal-700 text-silver-400 rounded-full hover:text-warmwhite transition-colors"
                  title={item.published ? "Unpublish" : "Publish"}
                >
                  {item.published ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 bg-charcoal-700 text-silver-400 rounded-full hover:text-warmwhite transition-colors"
                  title="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-5 4v-4h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v4h-4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-charcoal-700 text-red-400 rounded-full hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.143 21H7.857a2 2 0 01-1.997-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
