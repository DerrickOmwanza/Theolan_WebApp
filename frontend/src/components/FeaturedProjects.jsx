// Featured Projects Component
// 2x3 Grid layout - Admin controls which images are featured via backend

import { useQuery } from "@tanstack/react-query";
import { productApi } from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function FeaturedProjects() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-gallery"],
    queryFn: () =>
      productApi
        .getGallery({ limit: 6, featured: true })
        .catch(() => ({ data: [] })),
  });

  const featuredPhotos = data?.data?.data || [];

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-charcoal-900 to-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no featured photos from admin
  if (featuredPhotos.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-charcoal-900 to-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-3">
            Featured Projects
          </h2>
          <p className="text-silver-400 max-w-2xl mx-auto">
            Showcasing our finest aluminium installations
          </p>
        </div>

        {/* 2x3 Grid - Featured images controlled by admin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {featuredPhotos.slice(0, 6).map((photo) => (
            <div
              key={photo.id}
              className="rounded-xl overflow-hidden bg-charcoal-800 border border-charcoal-700 group"
            >
              <div className="relative w-full overflow-hidden">
                {photo.image_url ? (
                  <img
                    src={photo.image_url}
                    alt={photo.project_name || "Project photo"}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : null}
                {photo.category && (
                  <div className="absolute top-3 right-3 badge-cobalt text-xs capitalize backdrop-blur-sm">
                    {photo.category.replace("_", " ")}
                  </div>
                )}
              </div>
              <div className="p-4">
                {photo.project_name ? (
                  <h3 className="text-warmwhite font-heading font-semibold text-base mb-1 line-clamp-1 group-hover:text-cobalt-300 transition-colors">
                    {photo.project_name}
                  </h3>
                ) : (
                  <h3 className="text-warmwhite font-heading font-semibold text-base mb-1 line-clamp-1 capitalize">
                    {photo.category?.replace("_", " ") || "Project"}
                  </h3>
                )}
                {photo.location ? (
                  <p className="text-silver-400 text-xs mb-2">
                    {photo.location}
                  </p>
                ) : (
                  <p className="text-silver-500 text-xs mb-2 italic">
                    {photo.finish
                      ? `${photo.finish} finish`
                      : "Aluminium installation"}
                  </p>
                )}
                {photo.finish && (
                  <span className="badge-charcoal text-xs capitalize">
                    {photo.finish}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
