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

  // Fallback to local images if no database data
  const displayPhotos =
    featuredPhotos.length > 0
      ? featuredPhotos.slice(0, 6)
      : Array.from({ length: 6 }, (_, i) => ({
          id: `local-${i + 1}`,
          image_url: `/images/image_${i + 1}.jpg`,
          category: [
            "windows",
            "doors",
            "curtain_walls",
            "partitions",
            "balustrades",
          ][i % 5],
          finish: ["bronze", "black", "silver", "white", "mill"][i % 5],
        }));

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

  return (
    <section className="py-16 bg-gradient-to-b from-charcoal-900 to-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-3">
            Featured Projects
          </h2>
          <p className="text-silver-400 max-w-2xl mx-auto">
            Showcasing our finest aluminium installations
          </p>
        </div>

        {/* Masonry Grid - Images displayed at native resolution */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {displayPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className="break-inside-avoid rounded-xl overflow-hidden bg-charcoal-800 border border-charcoal-700"
            >
              <div className="w-full">
                {photo.image_url ? (
                  <img
                    src={photo.image_url}
                    alt={photo.project_name || "Project photo"}
                    className="w-full h-auto block"
                    loading="lazy"
                    style={{
                      maxWidth: "100%",
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : null}
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
          Admin manages image details via the gallery admin panel
        </p>
      </div>
    </section>
  );
}
