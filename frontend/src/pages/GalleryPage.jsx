import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { productApi } from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import FeaturedProjects from "../components/FeaturedProjects.jsx";

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

const FINISHES = [
  { value: "", label: "All Finishes" },
  { value: "mill", label: "Mill Finish" },
  { value: "silver", label: "Silver Anodized" },
  { value: "bronze", label: "Bronze" },
  { value: "black", label: "Black Anodized" },
  { value: "champagne", label: "Champagne" },
];

const LOCATIONS = [
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
  const LIMIT = 12;

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
          return {
            data: {
              data: generateLocalGalleryData()
                .filter((p) => !category || p.category === category)
                .filter((p) => !finish || p.finish === finish)
                .filter(
                  (p) =>
                    !search ||
                    p.project_name
                      .toLowerCase()
                      .includes(search.toLowerCase()) ||
                    p.description.toLowerCase().includes(search.toLowerCase()),
                )
                .slice(page * LIMIT, (page + 1) * LIMIT),
              total: generateLocalGalleryData().length,
            },
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

  // Use API data or fallback to local data
  const photos =
    data?.data?.data?.length > 0 ? data.data.data : generateLocalGalleryData();
  const total = data?.data?.total || photos.length;
  const totalPages = Math.ceil(total / LIMIT);

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () =>
    setLightboxIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  const nextPhoto = () =>
    setLightboxIndex((i) => (i < photos.length - 1 ? i + 1 : 0));

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
            <span className="ml-auto text-sm text-silver-500">
              {total} project{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Gallery Grid - Modern Masonry Design */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <p className="text-red-400">Failed to load gallery.</p>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="group cursor-pointer break-inside-avoid rounded-xl overflow-hidden bg-charcoal-800 border border-charcoal-700 hover:border-cobalt/50 transition-all duration-300"
                  onClick={() => openLightbox(idx)}
                >
                  <div className="relative overflow-hidden">
                    {photo.image_url ? (
                      <img
                        src={photo.image_url}
                        alt={
                          photo.project_name ||
                          photo.description ||
                          "Project photo"
                        }
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-silver-600 bg-charcoal-700">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5">
                    {photo.project_name && (
                      <h3 className="text-warmwhite font-heading font-semibold text-lg mb-2 line-clamp-1">
                        {photo.project_name}
                      </h3>
                    )}
                    {photo.location && (
                      <p className="text-silver-400 text-sm mb-3">
                        {photo.location}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {photo.category && (
                        <span className="badge-cobalt text-xs">
                          {photo.category.replace("_", " ")}
                        </span>
                      )}
                      {photo.finish && (
                        <span className="badge-charcoal text-xs capitalize">
                          {photo.finish}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-ghost text-sm disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-silver-400">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
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
      {lightboxIndex !== null && photos[lightboxIndex] && (
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
            {photos[lightboxIndex].image_url ? (
              <img
                src={photos[lightboxIndex].image_url}
                alt={photos[lightboxIndex].project_name || "Project photo"}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                loading="eager"
              />
            ) : (
              <div className="text-silver-500 text-center py-20">
                No image available
              </div>
            )}
            <div className="mt-4 px-4">
              {photos[lightboxIndex].project_name && (
                <h3 className="text-warmwhite font-heading text-xl mb-2">
                  {photos[lightboxIndex].project_name}
                </h3>
              )}
              {photos[lightboxIndex].location && (
                <p className="text-silver-400 text-sm">
                  {photos[lightboxIndex].location}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
