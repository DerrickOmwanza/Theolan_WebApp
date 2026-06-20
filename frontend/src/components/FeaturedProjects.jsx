// Featured Projects Component
// Displays strong case-study projects above the filterable grid

import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Featured project data - to be updated with client-confirmed locations
 * These images will be moved to /public/images/featured/[project]/
 */
const FEATURED_PROJECTS = [
  {
    id: "modern-villa-black",
    title: "Modern Villa",
    location: "Location TBD", // Requires client confirmation: Karen/Runda/etc
    category: "curtain_walls",
    description:
      "Large modern villa with black curtain walls and mirrored glass balustrades",
    images: [
      { url: "/images/image 24.jpg", caption: "Exterior front view" },
      { url: "/images/image 25.jpg", caption: "Wide project view" },
      { url: "/images/image 29.jpg", caption: "Interior staircase glazing" },
      { url: "/images/image 31.jpg", caption: "Balcony balustrade detail" },
    ],
  },
  {
    id: "lodge-cottages",
    title: "Resort Lodge Cottages",
    location: "Location TBD", // Requires client confirmation
    category: "windows",
    description: "Cluster of cottages with green tiled roofs and cream walls",
    images: [
      { url: "/images/image 61.jpg", caption: "Cottages exterior hero" },
      { url: "/images/image 62.jpg", caption: "Gazebo view" },
      { url: "/images/image 63.jpg", caption: "Window detail" },
    ],
  },
  {
    id: "modern-charcoal",
    title: "Modern Curved Facade",
    location: "Location TBD", // Requires client confirmation
    category: "windows",
    description:
      "Architecturally distinctive building with charcoal frames and curved fascia",
    images: [
      { url: "/images/image 64.jpg", caption: "Curved facade" },
      { url: "/images/image 65.jpg", caption: "Full glazed front" },
      { url: "/images/image 69.jpg", caption: "Window grid detail" },
      { url: "/images/image 70.jpg", caption: "Balcony railing close-up" },
    ],
  },
  {
    id: "grey-villa",
    title: "Landscaped Villa",
    location: "Location TBD", // Requires client confirmation
    category: "windows",
    description: "Finished modern villa with landscaped front yard",
    images: [
      { url: "/images/image 45.jpg", caption: "Front exterior hero" },
      { url: "/images/image 46.jpg", caption: "Window and entrance detail" },
    ],
  },
];

export default function FeaturedProjects() {
  const [activeProject, setActiveProject] = useState(0);

  return (
    <section className="bg-charcoal-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-heading font-bold text-warmwhite mb-6">
          Featured Projects
        </h2>

        {/* Project Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FEATURED_PROJECTS.map((project, idx) => (
            <button
              key={project.id}
              onClick={() => setActiveProject(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeProject === idx
                  ? "bg-cobalt text-white"
                  : "bg-charcoal-700 text-silver-300 hover:bg-charcoal-600"
              }`}
            >
              {project.title}
            </button>
          ))}
        </div>

        {/* Active Project Display */}
        {FEATURED_PROJECTS[activeProject] && (
          <div className="card">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Main Image */}
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-charcoal-700">
                {FEATURED_PROJECTS[activeProject].images[0]?.url ? (
                  <img
                    src={FEATURED_PROJECTS[activeProject].images[0].url}
                    alt={FEATURED_PROJECTS[activeProject].title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-xl font-heading font-bold text-warmwhite mb-2">
                  {FEATURED_PROJECTS[activeProject].title}
                </h3>
                <p className="text-silver-400 text-sm mb-4">
                  {FEATURED_PROJECTS[activeProject].location} •{" "}
                  {FEATURED_PROJECTS[activeProject].category.replace("_", " ")}
                </p>
                <p className="text-silver-300 mb-4">
                  {FEATURED_PROJECTS[activeProject].description}
                </p>

                {/* Thumbnail Strip */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {FEATURED_PROJECTS[activeProject].images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-16 rounded border-2 border-charcoal-600 flex-shrink-0"
                    >
                      <img
                        src={img.url}
                        alt={img.caption}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
