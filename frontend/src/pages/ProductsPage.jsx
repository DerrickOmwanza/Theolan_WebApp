import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { productApi } from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "aluminium_fabrications", label: "Aluminium Fabrications" },
  { value: "stainless_steel_railings", label: "Stainless Steel Railings & Balusters" },
  { value: "frameless_glass", label: "Frameless Glass & Sunroofs" },
  { value: "gypsum_ceilings", label: "Gypsum Walls & Ceilings" },
  { value: "kitchen_cabinets", label: "Kitchen & Wardrobe Cabinets" },
  { value: "floor_tiling", label: "Floor Tiling" },
  { value: "windows", label: "Windows" },
  { value: "doors", label: "Doors" },
  { value: "curtain_walls", label: "Curtain Walls" },
  { value: "partitions", label: "Partitions" },
  { value: "balustrades", label: "Balustrades" },
];

const FINISHES = [
  { value: "", label: "All Finishes" },
  { value: "mill", label: "Mill Finish" },
  { value: "silver", label: "Silver Anodized" },
  { value: "black", label: "Black Anodized" },
  { value: "champagne", label: "Champagne" },
  { value: "bronze", label: "Bronze" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name", label: "Name A–Z" },
];

// Map products to specific images for visual browsing
const getProductImage = (product) => {
  // Map based on category and product name/type for specific images
  const category = product.category;
  const name = product.name?.toLowerCase() || "";

  // Specific product image mappings
  const imageMap = {
    doors: {
      french: "/images/doors_french_double_black.webp",
      hinged: "/images/doors_hinged_single_bronze.webp",
      sliding: "/images/doors_sliding_2panel_black.webp",
      "3panel": "/images/doors_sliding_3panel_silver.webp",
    },
    windows: {
      casement: "/images/windows_casement_tophung_silver.webp",
      top: "/images/windows_casement_tophung_silver.webp",
      sliding: "/images/windows_sliding_fixed_bronze.webp",
      fixed: "/images/windows_fixed_picture_black.webp",
      picture: "/images/windows_fixed_picture_black.webp",
    },
    balustrades: {
      horizontal: "/images/balustrades_horizontal_champagne.webp",
      frameless: "/images/balustrades_frameless_glass_silver.webp",
      post: "/images/balustrades_post_system_black.webp",
      juliet: "/images/balustrades_juliet_bronze.webp",
    },
    curtain_walls: {
      spider: "/images/curtainwalls_spider_glazing_silver.webp",
      stick: "/images/curtainwalls_stick_system_black.webp",
      structural: "/images/curtainwalls_structural_glazing_silver.webp",
    },
    partitions: {
      frameless: "/images/partitions_frameless_glass_mill.webp",
      double: "/images/partitions_double_glazed_white.webp",
      glazed: "/images/partitions_frameless_glass_mill.webp",
    },
  };

  // Try to match specific product type
  if (imageMap[category]) {
    const categoryMap = imageMap[category];
    for (const [key, img] of Object.entries(categoryMap)) {
      if (name.includes(key)) return img;
    }
  }

  // Fallback to category default
  const defaultMap = {
    windows: "/images/Windows.webp",
    doors: "/images/Doors.webp",
    curtain_walls: "/images/Curtain_Walls.webp",
    partitions: "/images/Partitions.webp",
    balustrades: "/images/Balustrades.webp",
  };
  return defaultMap[category] || "/images/Custom_designs.webp";
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const finish = searchParams.get("finish") || "";
  const sort_by = searchParams.get("sort_by") || "";
  const [page, setPage] = useState(0);
  const LIMIT = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", category, finish, sort_by, page],
    queryFn: () =>
      productApi.list({
        category: category || undefined,
        finish: finish || undefined,
        sort_by: sort_by || undefined,
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

  const products = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

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
            <select
              value={sort_by}
              onChange={(e) => setFilter("sort_by", e.target.value)}
              className="input-field w-auto min-w-[180px] text-sm"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {(category || finish || sort_by) && (
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
              {total} product{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Products Grid - Now with Visual Images */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <p className="text-red-400">
              Failed to load products. Please try again.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-silver-400 mb-4">
              No products found matching your filters.
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
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/quote?product_id=${product.id}`}
                  className="card group hover:border-cobalt/50 transition-all block"
                >
                  {/* Product Image */}
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-charcoal-700">
                    <img
                      src={product.image_url || getProductImage(product)}
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
                    <p className="text-sm text-silver-400 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-end justify-between mt-auto pt-2 border-t border-charcoal-600">
                    <div>
                      <p className="text-xs text-silver-500">From</p>
                      <p className="text-lg font-semibold text-gold-400">
                        KES{" "}
                        {Number(
                          product.base_price_per_sqm_kes,
                        ).toLocaleString()}
                        <span className="text-xs text-silver-500 font-normal">
                          /sqm
                        </span>
                      </p>
                    </div>
                    <span className="btn-primary text-xs px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Get Quote
                    </span>
                  </div>
                </Link>
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
    </div>
  );
}
