// ImageGalleryItem Component - Preserves image quality
// Never stretches beyond native resolution

export default function ImageGalleryItem({ photo, onClick }) {
  return (
    <div
      className="break-inside-avoid rounded-xl overflow-hidden bg-charcoal-800 border border-charcoal-700 hover:border-cobalt/50 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full">
        {photo.image_url ? (
          <img
            src={photo.image_url}
            alt={photo.project_name || photo.description || "Project photo"}
            className="w-full h-auto block"
            loading="lazy"
            style={{
              // CRITICAL: Prevent stretching beyond native resolution
              maxWidth: "100%",
              width: "100%",
              // Ensure natural aspect ratio is maintained without distortion
              objectFit: "contain",
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-48 text-silver-600 bg-charcoal-700">
            No image
          </div>
        )}
      </div>
      <div className="p-5">
        {photo.project_name && (
          <h3 className="text-warmwhite font-heading font-semibold text-lg mb-2 line-clamp-1">
            {photo.project_name}
          </h3>
        )}
        {photo.location && (
          <p className="text-silver-400 text-sm mb-3">{photo.location}</p>
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
  );
}
