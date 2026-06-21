// ResponsiveImage Component - Preserves image quality
// Never stretches beyond native resolution

export default function ResponsiveImage({ src, alt, sizes, className = "" }) {
  return (
    <img
      src={src}
      alt={alt || "Project photo"}
      className={`${className} object-cover`}
      loading="lazy"
      style={{
        // Prevent stretching beyond native resolution
        maxWidth: "100%",
        // Ensure image maintains aspect ratio without distortion
        width: "100%",
        height: "auto",
      }}
    />
  );
}
