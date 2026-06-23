import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { productApi } from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import FeaturedProjects from "../components/FeaturedProjects.jsx";
import ImageGalleryItem from "../components/ImageGalleryItem.jsx";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "windows", label: "Windows" },
  { value: "doors", label: "Doors" },
  { value: "curtain_walls", label: "Curtain Walls" },
  { value: "partitions", label: "Partitions" },
  { value: "balustrades", label: "Balustrades" },
  { value: "shower_enclosures", label: "Shower Enclosures" },
  { value: "office_fitout", label: "Office Fit-outs" },
];

// Need to add back FINISHES that was removed
const FINISHES = [
  { value: "", label: "All Finishes" },
  { value: "mill", label: "Mill Finish" },
  { value: "silver", label: "Silver Anodized" },
  { value: "bronze", label: "Bronze" },
  { value: "black", label: "Black Anodized" },
  { value: "champagne", label: "Champagne" },
];

// Note: LOCATIONS array reserved for future location-based filtering
// eslint-disable-next-line no-unused-vars
const _LOCATIONS = [
  "Nairobi Westlands",
  "Nairobi Kileleshwa",
  "Nairobi Muthaiga",
  "Nairobi Gigiri",
  "Nairobi Karen",
  "Nairobi Industrial Area",
  "Mombasa",
  "Kisumu",
];

/**
 * Generate local gallery data for development/fallback
 * Uses images from public/images folder (24 images with proper categorization)
 */
const generateLocalGalleryData = () => {
  // Categorization based on the analysis provided
  const imageData = [
    // Group 1: Windows (image_2, image_11, image_15)
    { id: 2, category: "windows", finish: "bronze" },
    { id: 11, category: "windows", finish: "silver" },
    { id: 15, category: "windows", finish: "bronze" },
    // Group 2: Doors (image_1, image_8, image_13)
    { id: 1, category: "doors", finish: "black" },
    { id: 8, category: "doors", finish: "silver" },
    { id: 13, category: "doors", finish: "silver" },
    // Group 3: Curtain Walls (image_3, image_12)
    { id: 3, category: "curtain_walls", finish: "black" },
    { id: 12, category: "curtain_walls", finish: "silver" },
    // Group 4: Partitions (image_4, image_6, image_14)
    { id: 4, category: "partitions", finish: "white" },
    { id: 6, category: "partitions", finish: "white" },
    { id: 14, category: "partitions", finish: "white" },
    // Group 5: Balustrades (image_7, image_9, image_10)
    { id: 7, category: "balustrades", finish: "black" },
    { id: 9, category: "balustrades", finish: "black" },
    { id: 10, category: "balustrades", finish: "black" },
    // Group 6: Shower Enclosures/Glazing (image_5)
    { id: 5, category: "shower_enclosures", finish: "silver" },
    // Group 7: Fabrication & Workshop (image_16-20)
    { id: 16, category: "partitions", finish: "mill" },
    { id: 17, category: "windows", finish: "mill" },
    { id: 18, category: "doors", finish: "mill" },
    { id: 19, category: "curtain_walls", finish: "mill" },
    { id: 20, category: "balustrades", finish: "mill" },
  ];

  return imageData.map((img) => ({
    id: `local-${img.id}`,
    image_url: `/images/image_${img.id}.jpg`,
    project_name: "", // Admin will fill in
    description: "", // Admin will fill in
    category: img.category,
    finish: img.finish,
    location: "", // Admin will fill in
  }));
};

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const finish = searchParams.get("finish") || "";
  const search = searchParams.get("search") || "";
  const [page, setPage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const LIMIT = 16; // 16 images per page for 4x4 grid

  // Query for paginated grid display
  const { data, isLoading, error } = useQuery({
    queryKey: ["gallery", category, finish, search, page],
    queryFn: () =>
      productApi
        .getGallery({
          category: category || undefined,
          finish: finish || undefined,
          search: search || undefined,
          limit: LIMIT,
          offset: page * LIMIT,
        })
        .catch(() => {
          // Fallback to local data if API fails
          const allLocal = generateLocalGalleryData();
          const filtered = allLocal
            .filter((p) => !category || p.category === category)
            .filter((p) => !finish || p.finish === finish)
            .filter(
              (p) =>
                !search ||
                (p.project_name &&
                  p.project_name
                    .toLowerCase()
                    .includes(search.toLowerCase())) ||
                (p.description &&
                  p.description.toLowerCase().includes(search.toLowerCase())),
            );
          return {
            data: {
              data: filtered.slice(page * LIMIT, (page + 1) * LIMIT),
              total: filtered.length,
            },
          };
        }),
  });

  // Query for FULL gallery (lightbox navigation across all images)
  const { data: allGalleryData } = useQuery({
    queryKey: ["gallery-all", category, finish, search],
    queryFn: () =>
      productApi
        .getGallery({
          category: category || undefined,
          finish: finish || undefined,
          search: search || undefined,
          limit: 1000, // Get all images for lightbox
        })
        .catch(() => {
          return {
            data: generateLocalGalleryData()
              .filter((p) => !category || p.category === category)
              .filter((p) => !finish || p.finish === finish)
              .filter(
                (p) =>
                  !search ||
                  (p.project_name &&
                    p.project_name
                      .toLowerCase()
                      .includes(search.toLowerCase())) ||
                  (p.description &&
                    p.description.toLowerCase().includes(search.toLowerCase())),
              ),
          };
        }),
  });

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
    setPage(0);
  };

  // Grid display uses paginated data - properly calculated for fallback
  const photos = data?.data?.data || [];
  const total = data?.data?.total || 0;

  // eslint-disable-next-line no-unused-vars
  const _totalPages = Math.ceil(total / LIMIT);

  // If API returned no data, use fallback
  const displayPhotos =
    photos.length > 0
      ? photos
      : generateLocalGalleryData()
          .filter((p) => !category || p.category === category)
          .filter((p) => !finish || p.finish === finish)
          .filter(
            (p) =>
              !search ||
              (p.project_name &&
                p.project_name.toLowerCase().includes(search.toLowerCase())) ||
              (p.description &&
                p.description.toLowerCase().includes(search.toLowerCase())),
          )
          .slice(page * LIMIT, (page + 1) * LIMIT);

  const displayTotal =
    total > 0
      ? total
      : generateLocalGalleryData()
          .filter((p) => !category || p.category === category)
          .filter((p) => !finish || p.finish === finish).length;

  const displayTotalPages = Math.ceil(displayTotal / LIMIT);

  // Lightbox uses ALL images for cross-page navigation
  const allPhotos =
    allGalleryData?.data?.data?.length > 0
      ? allGalleryData.data.data
      : generateLocalGalleryData()
          .filter((p) => !category || p.category === category)
          .filter((p) => !finish || p.finish === finish);

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () =>
    setLightboxIndex((i) => (i > 0 ? i - 1 : allPhotos.length - 1));
  const nextPhoto = () =>
    setLightboxIndex((i) => (i < allPhotos.length - 1 ? i + 1 : 0));

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">
            Our Work
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-warmwhite mb-4">
            Project Gallery
          </h1>
          <p className="text-silver-300 max-w-2xl">
            Explore our completed projects across Nairobi and Kenya. Every
            installation reflects our commitment to precision and quality.
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <FeaturedProjects />

      {/* Filters */}
      <section className="border-b border-charcoal-600 bg-charcoal-800 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={category}
              onChange={(e) => setFilter("category", e.target.value)}
              className="input-field w-auto min-w-[160px] text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={finish}
              onChange={(e) => setFilter("finish", e.target.value)}
              className="input-field w-auto min-w-[160px] text-sm"
            >
              {FINISHES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setFilter("search", e.target.value)}
              className="input-field w-auto min-w-[200px] text-sm"
            />
            {(category || finish || search) && (
              <button
                onClick={() => {
                  setSearchParams({});
                  setPage(0);
                }}
                className="text-sm text-silver-400 hover:text-warmwhite underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Grid - 4x4 Grid Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="card text-center py-12 mx-4">
            <p className="text-red-400">Failed to load gallery.</p>
          </div>
        ) : displayPhotos.length === 0 ? (
          <div className="card text-center py-16 mx-4">
            <p className="text-silver-400 text-lg mb-4">
              No images found matching your filters.
            </p>
            <button
              onClick={() => setSearchParams({})}
              className="btn-primary text-sm"
            >
              View All Gallery
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {displayPhotos.map((photo, idx) => {
                const allIndex = allPhotos.findIndex((p) => p.id === photo.id);
                return (
                  <ImageGalleryItem
                    key={photo.id}
                    photo={photo}
                    onClick={() => openLightbox(allIndex >= 0 ? allIndex : idx)}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {displayTotalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-ghost text-sm disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-silver-400">
                  Page {page + 1} of {displayTotalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(displayTotalPages - 1, p + 1))
                  }
                  disabled={page >= displayTotalPages - 1}
                  className="btn-ghost text-sm disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && allPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl z-20 touch-target"
            onClick={closeLightbox}
          >
            &times;
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-20 touch-target"
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
          >
            &#8249;
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-20 touch-target"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
          >
            &#8250;
          </button>
          <div
            className="max-w-6xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {allPhotos[lightboxIndex].image_url ? (
              <img
                src={allPhotos[lightboxIndex].image_url}
                alt={allPhotos[lightboxIndex].project_name || "Project photo"}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                loading="eager"
              />
            ) : (
              <div className="text-silver-500 text-center py-20">
                No image available
              </div>
            )}
            <div className="mt-4 px-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-silver-500">
                  Image {lightboxIndex + 1} of {allPhotos.length}
                </span>
                <div className="flex gap-2">
                  {allPhotos[lightboxIndex].category && (
                    <span className="badge-cobalt text-xs capitalize">
                      {allPhotos[lightboxIndex].category.replace("_", " ")}
                    </span>
                  )}
                  {allPhotos[lightboxIndex].finish && (
                    <span className="badge-charcoal text-xs capitalize">
                      {allPhotos[lightboxIndex].finish}
                    </span>
                  )}
                </div>
              </div>
              {allPhotos[lightboxIndex].project_name && (
                <h3 className="text-warmwhite font-heading text-xl mb-2">
                  {allPhotos[lightboxIndex].project_name}
                </h3>
              )}
              {allPhotos[lightboxIndex].location && (
                <p className="text-silver-400 text-sm">
                  {allPhotos[lightboxIndex].location}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
