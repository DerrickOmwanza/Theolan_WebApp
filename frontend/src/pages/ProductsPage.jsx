import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../services/api.js";

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
  { value: "windows", label: "Windows" },
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
  { value: "name", label: "Name A-Z" },
];

const PLACEHOLDER_IMAGE = "/placeholder.svg";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filterCategory = searchParams.get("category") || "";
  const filterFinish = searchParams.get("finish") || "";
  const filterSort = searchParams.get("sort_by") || "";
  const filterPage = parseInt(searchParams.get("page") || "1", 10);

  // Pagination state - using 1-based numbering for display
  const ITEMS_PER_PAGE = 12;

  // Update filter and reset pagination
  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      // Reset page on filter change
      prev.delete("page");
      return prev;
    });
  };

  // Fetch products from API with filters
  const { data: productsData, isLoading, error: queryError } = useQuery({
    queryKey: ["products", filterCategory, filterFinish, filterSort, filterPage, ITEMS_PER_PAGE],
    queryFn: () => productApi.list({
      category: filterCategory || undefined,
      finish: filterFinish || undefined,
      sort_by: filterSort || undefined,
      limit: ITEMS_PER_PAGE,
      offset: (filterPage - 1) * ITEMS_PER_PAGE,
    }),
    keepPreviousData: true,
  });

  // Extract data and map image_url to image for UI compatibility
  const products = (productsData?.data?.data || []).map(p => ({
    ...p,
    image: p.image_url || p.image || null,
  }));

  const totalProducts = productsData?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Update URL when page changes
  const currentPage = filterPage;
  const totalPagesComputed = Math.max(totalPages, Math.ceil((products.length || 0) / ITEMS_PER_PAGE));

  // Handle page navigation
  const goToPage = (page) => {
    if (page < 1 || page > totalPagesComputed) return;
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      return prev;
    });
  };

  // Get Quote handler - navigates to quote calculator with product details pre-filled
  const handleGetQuote = (product) => {
    const params = new URLSearchParams();
    params.set("product_name", product.name);
    params.set("basePrice", product.base_price_per_sqm_kes);
    params.set("category", product.category);
    params.set("finish", product.finish || "bronze");
    navigate(`/quote?${params.toString()}`);
  };

  // Modal state for full product details
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle escape key for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && modalOpen) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [modalOpen]);

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (isLoading) {
    return (
      <div>
        {/* Hero Banner */}
        <section className="bg-charcoal-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">
              Our Products
            </p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-warmwhite mb-4">
              Aluminium Product Catalogue
            </h1>
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
                disabled
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
                disabled
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
                disabled
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Loading State */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gold-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-silver-400">Loading products...</p>
          </div>
        </section>
      </div>
    );
  }

  if (queryError) {
    return (
      <div>
        {/* Hero Banner */}
        <section className="bg-charcoal-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">
              Our Products
            </p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-warmwhite mb-4">
              Aluminium Product Catalogue
            </h1>
          </div>
        </section>

        {/* Error State */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card text-center py-12">
            <p className="text-red-400 mb-4">Failed to load products. Please try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Retry
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
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
                }}
                className="text-sm text-silver-400 hover:text-warmwhite underline"
              >
                Clear filters
              </button>
            )}
            <span className="ml-auto text-sm text-silver-500">
              {totalProducts > 0 ? products.length + " of " + totalProducts + " products" : "No products"}
            </span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-silver-400 mb-4">No products found matching your filters.</p>
            <button
              onClick={() => {
                setSearchParams({});
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const productImage = product.image || PLACEHOLDER_IMAGE;
                
                return (
                  <div
                    key={product.id}
                    className="card group hover:border-cobalt/50 transition-all block"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-charcoal-700">
                      <img
                        src={productImage}
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
                      <>
                        <p className="text-sm text-silver-400 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <button
                          onClick={() => openModal(product)}
                          className="text-xs text-cobalt-400 hover:text-cobalt-300 underline"
                        >
                          Read More
                        </button>
                      </>
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
                        onClick={() => handleGetQuote(product)}
                        className="btn-primary text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Get Quote
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination - Always visible */}
            <div className="flex justify-center items-center gap-6 mt-12 mb-8">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-ghost text-sm disabled:opacity-30"
              >
                ◀ Previous
              </button>
              <span className="text-sm text-silver-400 font-medium">
                Page {currentPage} of {totalPagesComputed}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPagesComputed}
                className="btn-ghost text-sm disabled:opacity-30"
              >
                Next ▶
              </button>
            </div>
          </>
        )}
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-charcoal-800 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-charcoal-600">
              <h3 className="text-lg font-heading font-semibold text-warmwhite">
                {selectedProduct.name}
              </h3>
              <button
                onClick={closeModal}
                className="text-silver-400 hover:text-warmwhite transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Product Image */}
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-charcoal-700">
                <img
                  src={selectedProduct.image || PLACEHOLDER_IMAGE}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="badge bg-charcoal-600 text-silver-300 capitalize text-xs">
                    {selectedProduct.category?.replace("_", " ")}
                  </span>
                  {selectedProduct.finish && (
                    <span className="badge bg-charcoal-600 text-silver-300 capitalize text-xs">
                      {selectedProduct.finish}
                    </span>
                  )}
                  {selectedProduct.published === false && (
                    <span className="badge bg-red-900/30 text-red-300 capitalize text-xs">
                      Unpublished
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-silver-300 mb-2">Description</h4>
                  <p className="text-sm text-warmwhite leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <p className="text-xs text-silver-500 mb-1">Price per m²</p>
                <p className="text-2xl font-semibold text-gold-400">
                  KES {Number(selectedProduct.base_price_per_sqm_kes).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t border-charcoal-600">
              <button
                onClick={closeModal}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeModal();
                  handleGetQuote(selectedProduct);
                }}
                className="flex-1 btn-primary"
              >
                Get Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
