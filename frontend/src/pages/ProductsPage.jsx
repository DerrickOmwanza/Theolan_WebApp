import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// ============================================
// Static Product Inventory (18 items)
// ============================================
const LOCAL_PRODUCTS = [
  // Balustrades (4 products)
  {
    id: "balustrade-horizontal-bars",
    name: "Horizontal Bar Balustrade",
    category: "balustrades",
    base_price_per_sqm_kes: 8500,
    description:
      "Modern horizontal aluminium bar balustrade with premium powder-coated finish. Perfect for balconies and terraces with unobstructed views.",
    image: "/media/product_page/balustrade-horizontal-bars.png",
    finish: "bronze",
  },
  {
    id: "balustrade-frameless",
    name: "Frameless Glass Balustrade",
    category: "balustrades",
    base_price_per_sqm_kes: 12000,
    description:
      "Sleek frameless tempered glass balustrade with minimal aluminium connectors. Seamless integration for modern architectural designs.",
    image: "/media/product_page/balustrade-frameless.png",
    finish: "clear",
  },
  {
    id: "balustrade-post-system",
    name: "Post-System Balustrade",
    category: "balustrades",
    base_price_per_sqm_kes: 6500,
    description:
      "Robust post-system balustrade with elegant aluminium posts and glass infill. Cost-effective solution for commercial applications.",
    image: "/media/product_page/balustrade-post-system.png",
    finish: "silver",
  },
  {
    id: "balustrade-juliet",
    name: "Juliet Balcony Gate",
    category: "balustrades",
    base_price_per_sqm_kes: 9500,
    description:
      "Compact Juliet balcony gate system with hidden mounting brackets. Elegant safety barrier for glass doors without visual obstruction.",
    image: "/media/product_page/balustrade-juliet.png",
    finish: "black",
  },
  // Curtain Walls (3 products)
  {
    id: "curtain-wall-spider",
    name: "Spider Curtain Wall System",
    category: "curtain_walls",
    base_price_per_sqm_kes: 14500,
    description:
      "Structural glazing spider curtain wall with minimal aluminium mullions. Maximum glass area for superior natural lighting in commercial buildings.",
    image: "/media/product_page/curtain-wall-spider.png",
    finish: "silver",
  },
  {
    id: "curtain-wall-stick",
    name: "Stick Curtain Wall System",
    category: "curtain_walls",
    base_price_per_sqm_kes: 11000,
    description:
      "Traditional stick-built curtain wall system with exposed aluminium mullions. Cost-effective solution for mid-rise commercial projects.",
    image: "/media/product_page/curtain-wall-stick.png",
    finish: "white",
  },
  {
    id: "curtain-wall-structural",
    name: "Structural Glazing Facade",
    category: "curtain_walls",
    base_price_per_sqm_kes: 18000,
    description:
      "Premium structural glazing curtain wall with integrated aluminium extrusions. Seamless facade for high-end commercial and residential towers.",
    image: "/media/product_page/curtain-wall-structural.png",
    finish: "silver",
  },
  // Doors (4 products)
  {
    id: "door-french-double",
    name: "French Double Door",
    category: "doors",
    base_price_per_sqm_kes: 14000,
    description:
      "Elegant French double-leaf aluminium door with full-height glass panels. Perfect for grand entrances and internal room divisions.",
    image: "/media/product_page/door-french-double.png",
    finish: "champagne",
  },
  {
    id: "door-hinged-single",
    name: "Hinged Aluminium Door",
    category: "doors",
    base_price_per_sqm_kes: 7500,
    description:
      "Premium single-leaf hinged aluminium door with optional sidelights. Smooth operation and secure locking mechanism for residential and commercial use.",
    image: "/media/product_page/door-hinged-single.png",
    finish: "black",
  },
  {
    id: "door-sliding-2panel",
    name: "Sliding 2-Panel Door",
    category: "doors",
    base_price_per_sqm_kes: 9000,
    description:
      "Space-saving sliding aluminium door with two panels. Ideal for narrow openings and modern interior requirements.",
    image: "/media/product_page/door-sliding-2panel.png",
    finish: "silver",
  },
  {
    id: "door-sliding-3panel",
    name: "Sliding 3-Panel Door",
    category: "doors",
    base_price_per_sqm_kes: 11000,
    description:
      "Multi-panel aluminium sliding door system with three sliding leaves. Maximum flexibility for wide openings and large spans.",
    image: "/media/product_page/door-sliding-3panel.png",
    finish: "bronze",
  },
  // Partitions (1 product)
  {
    id: "partition-glass-frameless",
    name: "Frameless Glass Partition",
    category: "partitions",
    base_price_per_sqm_kes: 10500,
    description:
      "Minimalist frameless glass partition with floor-to-ceiling installation. Creates open spaces while providing privacy and noise reduction.",
    image: "/media/product_page/partition-glass-frameless.png",
    finish: "clear",
  },
  // New Service Categories (6 products)
  {
    id: "railings-stainless-steel",
    name: "Stainless Steel Railings",
    category: "stainless_steel_railings",
    base_price_per_sqm_kes: 13500,
    description:
      "Premium 316-grade stainless steel railings with brushed or mirror finish. Handrails and balusters for modern architectural installations.",
    image: "/media/product_page/railings-stainless-steel.png",
    finish: "brushed",
  },
  {
    id: "glass-sunroof-pergola",
    name: "Frameless Glass Sunroof",
    category: "frameless_glass",
    base_price_per_sqm_kes: 16500,
    description:
      "Retractable frameless glass sunroof system with motorized operation. Natural light maximization with full weather protection for outdoor living spaces.",
    image: "/media/product_page/glass-sunroof-pergola.png",
    finish: "clear",
  },
  {
    id: "gypsum-ceiling-led",
    name: "Gypsum Ceiling with LED",
    category: "gypsum_ceilings",
    base_price_per_sqm_kes: 6800,
    description:
      "Professional gypsum ceiling installation with integrated LED lighting system. Acoustic benefits and seamless aesthetic finish for commercial spaces.",
    image: "/media/product_page/gypsum-ceiling-led.png",
    finish: "white",
  },
  {
    id: "gypsum-wall-partition",
    name: "Gypsum Wall Partition",
    category: "gypsum_ceilings",
    base_price_per_sqm_kes: 5500,
    description:
      "Smooth gypsum wall partitioning system with customizable finishes. Ideal for office spaces and room divisions with clean lines.",
    image: "/media/product_page/gypsum-wall-partition.png",
    finish: "white",
  },
  {
    id: "cabinetry-kitchen-wardrobe",
    name: "Kitchen & Wardrobe Cabinets",
    category: "kitchen_cabinets",
    base_price_per_sqm_kes: 22000,
    description:
      "Custom aluminium kitchen and wardrobe cabinets with wood-effect powder coating. Modular design with smart storage solutions.",
    image: "/media/product_page/cabinetry-kitchen-wardrobe.png",
    finish: "wood_effect",
  },
  {
    id: "floor-tiling-porcelain",
    name: "Floor Tiling Installation",
    category: "floor_tiling",
    base_price_per_sqm_kes: 9500,
    description:
      "Professional porcelain floor tiling with precision laying and grouting. Available for interior and exterior applications with variety of finishes.",
    image: "/media/product_page/floor-tiling-porcelain.png",
    finish: "natural",
  },
];

// ============================================
// UI Constants
// ============================================
const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "balustrades", label: "Balustrades" },
  { value: "curtain_walls", label: "Curtain Walls" },
  { value: "doors", label: "Doors" },
  { value: "partitions", label: "Partitions" },
  { value: "stainless_steel_railings", label: "Stainless Steel Railings & Balusters" },
  { value: "frameless_glass", label: "Frameless Glass & Sunroofs" },
  { value: "gypsum_ceilings", label: "Gypsum Walls & Ceilings" },
  { value: "kitchen_cabinets", label: "Kitchen & Wardrobe Cabinets" },
  { value: "floor_tiling", label: "Floor Tiling" },
];

const FINISHES = [
  { value: "", label: "All Finishes" },
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "black", label: "Black" },
  { value: "champagne", label: "Champagne" },
  { value: "white", label: "White" },
  { value: "clear", label: "Clear" },
  { value: "brushed", label: "Brushed" },
  { value: "wood_effect", label: "Wood Effect" },
  { value: "natural", label: "Natural" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name", label: "Name A–Z" },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filterCategory = searchParams.get("category") || "";
  const filterFinish = searchParams.get("finish") || "";
  const filterSort = searchParams.get("sort_by") || "";

  // Pagination state - using 1-based numbering for display
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Update filter and reset pagination
  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      return prev;
    });
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Apply filters to LOCAL_PRODUCTS
  let filteredProducts = [...LOCAL_PRODUCTS];

  if (filterCategory) {
    filteredProducts = filteredProducts.filter((p) => p.category === filterCategory);
  }

  if (filterFinish) {
    filteredProducts = filteredProducts.filter((p) => p.finish === filterFinish);
  }

  // Apply sorting
  if (filterSort === "price_asc") {
    filteredProducts.sort((a, b) => a.base_price_per_sqm_kes - b.base_price_per_sqm_kes);
  } else if (filterSort === "price_desc") {
    filteredProducts.sort((a, b) => b.base_price_per_sqm_kes - a.base_price_per_sqm_kes);
  } else if (filterSort === "name") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Pagination calculations (1-based pages)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get Quote handler - navigates to quote calculator with product details pre-filled
  const handleGetQuote = (product) => {
    const params = new URLSearchParams();
    params.set('product_name', product.name);
    params.set('basePrice', product.base_price_per_sqm_kes);
    params.set('category', product.category);
    params.set('finish', product.finish || 'bronze');
    navigate(`/quote?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">
            Our Products
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-warmwhite mb-4">
            Aluminium Product Catalogue
          </h1>
          <p className="text-silver-300 max-w-2xl">
            Browse our full range of precision-crafted aluminium products. Each
            item displays high-quality visuals — filter by category and finish
            to find exactly what you need.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-charcoal-600 bg-charcoal-800 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={filterCategory}
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
              value={filterFinish}
              onChange={(e) => setFilter("finish", e.target.value)}
              className="input-field w-auto min-w-[160px] text-sm"
            >
              {FINISHES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={filterSort}
              onChange={(e) => setFilter("sort_by", e.target.value)}
              className="input-field w-auto min-w-[180px] text-sm"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {(filterCategory || filterFinish || filterSort) && (
              <button
                onClick={() => {
                  setSearchParams({});
                  setCurrentPage(1);
                }}
                className="text-sm text-silver-400 hover:text-warmwhite underline"
              >
                Clear filters
              </button>
            )}
            <span className="ml-auto text-sm text-silver-500">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {displayProducts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-silver-400 mb-4">No products found matching your filters.</p>
            <button
              onClick={() => {
                setSearchParams({});
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <div
                  key={product.id}
                  className="card group hover:border-cobalt/50 transition-all block"
                >
                  {/* Product Image */}
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-charcoal-700">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-warmwhite group-hover:text-cobalt-300 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-silver-500 capitalize">
                        {product.category?.replace("_", " ")}
                      </p>
                    </div>
                    {product.finish && (
                      <span className="badge bg-charcoal-600 text-silver-300 capitalize text-xs">
                        {product.finish}
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-sm text-silver-400 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-end justify-between mt-auto pt-2 border-t border-charcoal-600">
                    <div>
                      <p className="text-xs text-silver-500">From</p>
                      <p className="text-lg font-semibold text-gold-400">
                        KES {Number(product.base_price_per_sqm_kes).toLocaleString()}
                        <span className="text-xs text-silver-500 font-normal">
                          /sqm
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleGetQuote(product.name)}
                      className="btn-primary text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Get Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Always visible */}
            <div className="flex justify-center items-center gap-6 mt-12 mb-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-ghost text-sm disabled:opacity-30"
              >
                ◀ Previous
              </button>
              <span className="text-sm text-silver-400 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-ghost text-sm disabled:opacity-30"
              >
                Next ▶
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}