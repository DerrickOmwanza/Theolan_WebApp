// Featured Projects Component
// Modern masonry grid design - admin manages all content via web admin panel

import { useQuery } from "@tanstack/react-query";
import { productApi } from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function FeaturedProjects() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-gallery"],
    queryFn: () =>
      productApi.getGallery({ limit: 6 }).catch(() => ({ data: [] })),
  });

  const featuredPhotos = data?.data?.data || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-charcoal-900 to-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (!featuredPhotos.length) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-charcoal-900 to-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-3">
            Featured Projects
          </h2>
          <p className="text-silver-400 max-w-2xl mx-auto">
            Showcasing our finest aluminium installations across Nairobi and
            Kenya
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {featuredPhotos.slice(0, 6).map((photo, idx) => (
            <div
              key={photo.id}
              className="group cursor-pointer break-inside-avoid rounded-xl overflow-hidden bg-charcoal-800 border border-charcoal-700 hover:border-cobalt/50 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                {photo.image_url ? (
                  <img
                    src={photo.image_url}
                    alt={photo.project_name || "Project photo"}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : null}
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

        <p className="text-silver-500 text-sm mt-8 text-center">
          Admin manages image details, categories, and locations via the admin
          panel
        </p>
      </div>
    </section>
  );
}
