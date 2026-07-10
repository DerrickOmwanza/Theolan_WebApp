// ImageGalleryItem Component - Grid layout design
// Fixed height for consistent grid display

export default function ImageGalleryItem({ photo, onClick }) {
  // Smart video detection: check both media_type AND URL extension
  const isVideoType = photo.media_type === "video";
  const isVideoUrl = photo.image_url && 
    /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(photo.image_url);
  const isVideo = isVideoType || isVideoUrl;

  return (
    <div
      className="rounded-xl overflow-hidden bg-charcoal-800 border border-charcoal-700 hover:border-cobalt/50 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative w-full overflow-hidden">
        {photo.image_url ? (
          isVideo ? (
            <video
              src={photo.image_url}
              controls
              preload="metadata"
              className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => console.error('Video failed to load:', photo.image_url)}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={photo.image_url}
              alt={photo.project_name || photo.description || "Project photo"}
              className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )
        ) : (
          <div className="flex items-center justify-center h-48 sm:h-56 text-silver-600 bg-charcoal-700">
            No image
          </div>
        )}
        {/* Media type badge */}
        {isVideo && (
          <div className="absolute top-3 left-3 badge-cobalt text-xs capitalize backdrop-blur-sm">
            Video
          </div>
        )}
        {/* Image overlay with category */}
        {photo.category && !isVideo && (
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
          <h3 className="text-warmwhite font-heading font-semibold text-base mb-1 line-clamp-1 capitalize group-hover:text-cobalt-300 transition-colors">
            {photo.category?.replace("_", " ") || "Project"}
          </h3>
        )}
        {photo.location ? (
          <p className="text-silver-400 text-xs mb-2">{photo.location}</p>
        ) : (
          <p className="text-silver-500 text-xs mb-2 italic">
            {photo.finish ? `${photo.finish} finish` : "Aluminium installation"}
          </p>
        )}
        {photo.finish && (
          <span className="badge-charcoal text-xs capitalize">
            {photo.finish}
          </span>
        )}
      </div>
    </div>
  );
}
