import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { productApi } from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

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
  { value: "anodized_silver", label: "Anodized Silver" },
  { value: "anodized_bronze", label: "Anodized Bronze" },
  { value: "anodized_black", label: "Anodized Black" },
  { value: "powder_coated_white", label: "Powder Coated White" },
  { value: "powder_coated_cream", label: "Powder Coated Cream" },
  { value: "wood_grain", label: "Wood Grain" },
];

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
      productApi.getGallery({
        category: category || undefined,
        finish: finish || undefined,
        search: search || undefined,
        limit: LIMIT,
        offset: page * LIMIT,
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

  const photos = data?.data?.data || [];
  const total = data?.data?.total || 0;
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

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <p className="text-red-400">
              Failed to load gallery. Please try again.
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-silver-400 mb-4">
              No projects found matching your filters.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setPage(0);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="group cursor-pointer rounded-lg overflow-hidden border border-charcoal-600 hover:border-cobalt/50 transition-colors"
                  onClick={() => openLightbox(idx)}
                >
                  <div className="relative aspect-[4/3] bg-charcoal-700">
                    {photo.image_url ? (
                      <img
                        src={photo.image_url}
                        alt={
                          photo.project_name ||
                          photo.description ||
                          "Project photo"
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-silver-600">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 bg-charcoal-700">
                    {photo.project_name && (
                      <h3 className="text-warmwhite font-heading font-semibold mb-1">
                        {photo.project_name}
                      </h3>
                    )}
                    {photo.location && (
                      <p className="text-sm text-silver-400 flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                        {photo.location}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {photo.category && (
                        <span className="badge bg-charcoal-600 text-silver-300 capitalize text-xs">
                          {photo.category.replace("_", " ")}
                        </span>
                      )}
                      {photo.finish && (
                        <span className="badge bg-charcoal-600 text-silver-300 capitalize text-xs">
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
              <div className="flex justify-center items-center gap-4 mt-10">
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
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl z-10"
            onClick={closeLightbox}
          >
            &times;
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10"
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
          >
            &#8249;
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
          >
            &#8250;
          </button>
          <div
            className="max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {photos[lightboxIndex].image_url ? (
              <img
                src={photos[lightboxIndex].image_url}
                alt={photos[lightboxIndex].project_name || "Project photo"}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-[50vh] text-silver-500">
                No image available
              </div>
            )}
            <div className="mt-4 text-center">
              {photos[lightboxIndex].project_name && (
                <h3 className="text-warmwhite font-heading text-xl font-semibold">
                  {photos[lightboxIndex].project_name}
                </h3>
              )}
              {photos[lightboxIndex].description && (
                <p className="text-silver-400 text-sm mt-1">
                  {photos[lightboxIndex].description}
                </p>
              )}
              {photos[lightboxIndex].location && (
                <p className="text-silver-500 text-sm mt-1">
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
