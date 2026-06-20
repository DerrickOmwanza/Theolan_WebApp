// Featured Projects Component
// Shows strong project images - admin manages all content via web admin panel

import { useQuery } from "@tanstack/react-query";
import { productApi } from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function FeaturedProjects() {
  // Fetch first 8 published images for featured showcase
  const { data, isLoading } = useQuery({
    queryKey: ["featured-gallery"],
    queryFn: () =>
      productApi.getGallery({ limit: 8 }).catch(() => ({ data: [] })),
  });

  const featuredPhotos = data?.data?.data || [];

  if (isLoading) {
    return (
      <section className="bg-charcoal-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (!featuredPhotos.length) {
    return null; // No featured images yet
  }

  return (
    <section className="bg-charcoal-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-heading font-bold text-warmwhite mb-6">
          Featured Work
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredPhotos.slice(0, 8).map((photo) => (
            <div key={photo.id} className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-charcoal-700 border border-charcoal-600 group-hover:border-cobalt transition-colors">
                {photo.image_url ? (
                  <img
                    src={photo.image_url}
                    alt={
                      photo.project_name || photo.category || "Project photo"
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : null}
              </div>
              {photo.project_name && (
                <p className="text-silver-400 text-xs mt-2 text-center truncate">
                  {photo.project_name}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-silver-500 text-sm mt-4 text-center">
          Admin can mark any gallery image as featured via the admin panel
        </p>
      </div>
    </section>
  );
}
