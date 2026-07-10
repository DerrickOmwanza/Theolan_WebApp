import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi, quoteApi } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useQuery } from '@tanstack/react-query';

const FINISHES = [
  { value: 'mill', label: 'Mill Finish', multiplier: 1.0 },
  { value: 'silver', label: 'Silver Anodized', multiplier: 1.05 },
  { value: 'black', label: 'Black Anodized', multiplier: 1.15 },
  { value: 'champagne', label: 'Champagne', multiplier: 1.10 },
  { value: 'bronze', label: 'Bronze', multiplier: 1.12 },
  { value: 'clear', label: 'Clear/Transparent', multiplier: 1.0 },
  { value: 'brushed', label: 'Brushed', multiplier: 1.05 },
  { value: 'white', label: 'White', multiplier: 1.02 },
  { value: 'wood_effect', label: 'Wood Effect', multiplier: 1.10 },
  { value: 'natural', label: 'Natural Finish', multiplier: 1.0 },
];

// Static mapping of product names to product IDs (matching our LOCAL_PRODUCTS)
const PRODUCT_NAME_TO_ID_MAP = {
  'Horizontal Bar Balustrade': 'balustrade-horizontal-bars',
  'Frameless Glass Balustrade': 'balustrade-frameless',
  'Post-System Balustrade': 'balustrade-post-system',
  'Juliet Balcony Gate': 'balustrade-juliet',
  'Spider Curtain Wall System': 'curtain-wall-spider',
  'Stick Curtain Wall System': 'curtain-wall-stick',
  'Structural Glazing Facade': 'curtain-wall-structural',
  'French Double Door': 'door-french-double',
  'Hinged Aluminium Door': 'door-hinged-single',
  'Sliding 2-Panel Door': 'door-sliding-2panel',
  'Sliding 3-Panel Door': 'door-sliding-3panel',
  'Frameless Glass Partition': 'partition-glass-frameless',
  'Stainless Steel Railings': 'railings-stainless-steel',
  'Frameless Glass Sunroof': 'glass-sunroof-pergola',
  'Gypsum Ceiling with LED': 'gypsum-ceiling-led',
  'Gypsum Wall Partition': 'gypsum-wall-partition',
  'Kitchen & Wardrobe Cabinets': 'cabinetry-kitchen-wardrobe',
  'Floor Tiling Installation': 'floor-tiling-porcelain',
};

// Our local products array (same as in ProductsPage)
const LOCAL_PRODUCTS = [
  { id: 'balustrade-horizontal-bars', name: 'Horizontal Bar Balustrade', category: 'balustrades', base_price_per_sqm_kes: 8500, finish: 'bronze' },
  { id: 'balustrade-frameless', name: 'Frameless Glass Balustrade', category: 'balustrades', base_price_per_sqm_kes: 12000, finish: 'clear' },
  { id: 'balustrade-post-system', name: 'Post-System Balustrade', category: 'balustrades', base_price_per_sqm_kes: 6500, finish: 'silver' },
  { id: 'balustrade-juliet', name: 'Juliet Balcony Gate', category: 'balustrades', base_price_per_sqm_kes: 9500, finish: 'black' },
  { id: 'curtain-wall-spider', name: 'Spider Curtain Wall System', category: 'curtain_walls', base_price_per_sqm_kes: 14500, finish: 'silver' },
  { id: 'curtain-wall-stick', name: 'Stick Curtain Wall System', category: 'curtain_walls', base_price_per_sqm_kes: 11000, finish: 'white' },
  { id: 'curtain-wall-structural', name: 'Structural Glazing Facade', category: 'curtain_walls', base_price_per_sqm_kes: 18000, finish: 'silver' },
  { id: 'door-french-double', name: 'French Double Door', category: 'doors', base_price_per_sqm_kes: 14000, finish: 'champagne' },
  { id: 'door-hinged-single', name: 'Hinged Aluminium Door', category: 'doors', base_price_per_sqm_kes: 7500, finish: 'black' },
  { id: 'door-sliding-2panel', name: 'Sliding 2-Panel Door', category: 'doors', base_price_per_sqm_kes: 9000, finish: 'silver' },
  { id: 'door-sliding-3panel', name: 'Sliding 3-Panel Door', category: 'doors', base_price_per_sqm_kes: 11000, finish: 'bronze' },
  { id: 'partition-glass-frameless', name: 'Frameless Glass Partition', category: 'partitions', base_price_per_sqm_kes: 10500, finish: 'clear' },
  { id: 'railings-stainless-steel', name: 'Stainless Steel Railings', category: 'stainless_steel_railings', base_price_per_sqm_kes: 13500, finish: 'brushed' },
  { id: 'glass-sunroof-pergola', name: 'Frameless Glass Sunroof', category: 'frameless_glass', base_price_per_sqm_kes: 16500, finish: 'clear' },
  { id: 'gypsum-ceiling-led', name: 'Gypsum Ceiling with LED', category: 'gypsum_ceilings', base_price_per_sqm_kes: 6800, finish: 'white' },
  { id: 'gypsum-wall-partition', name: 'Gypsum Wall Partition', category: 'gypsum_ceilings', base_price_per_sqm_kes: 5500, finish: 'white' },
  { id: 'cabinetry-kitchen-wardrobe', name: 'Kitchen & Wardrobe Cabinets', category: 'kitchen_cabinets', base_price_per_sqm_kes: 22000, finish: 'wood_effect' },
  { id: 'floor-tiling-porcelain', name: 'Floor Tiling Installation', category: 'floor_tiling', base_price_per_sqm_kes: 9500, finish: 'natural' },
];

export default function QuotePage() {
  const [searchParams] = useSearchParams();
  
  // Get pre-fill parameters from URL
  const prefillName = searchParams.get('product_name') || '';
  const prefillBasePrice = searchParams.get('basePrice') ? Number(searchParams.get('basePrice')) : null;
  const prefillFinish = searchParams.get('finish') || 'mill';

  const [form, setForm] = useState({
    product_id: '',
    width_meters: '',
    height_meters: '',
    quantity: 1,
    double_glazing: false,
    finish: 'mill',
    base_price: prefillBasePrice,
  });
  
  const [errors, setErrors] = useState({});
  const [quoteResult, setQuoteResult] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // Fetch products for dropdown
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productApi.list({ limit: 100 }),
  });
  
  // Combine API products with local products
  const apiProducts = productsData?.data?.data || [];
  const localProductsById = {};
  LOCAL_PRODUCTS.forEach(p => { localProductsById[p.id] = p; });
  const products = [...apiProducts, ...Object.values(localProductsById).filter(p => !apiProducts.find(ap => ap.id === p.id))];

  // Auto-populate form from URL params on mount
  useEffect(() => {
    if (prefillName && !prefilled) {
      const productId = PRODUCT_NAME_TO_ID_MAP[prefillName] || '';
      if (productId) {
        setForm(prev => ({
          ...prev,
          product_id: productId,
          base_price: prefillBasePrice,
          finish: prefillFinish,
        }));
        setPrefilled(true);
      }
    }
  }, [prefillName, prefillBasePrice, prefillFinish, prefilled]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    if (field !== 'finish') setQuoteResult(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.product_id) errs.product_id = 'Select a product';
    if (!form.width_meters || form.width_meters < 0.5 || form.width_meters > 10) errs.width_meters = 'Width must be 0.5–10m';
    if (!form.height_meters || form.height_meters < 0.5 || form.height_meters > 10) errs.height_meters = 'Height must be 0.5–10m';
    if (!form.quantity || form.quantity < 1 || form.quantity > 100) errs.quantity = 'Quantity must be 1–100';
    if (!form.finish) errs.finish = 'Select a finish';
    return errs;
  };

  // Find selected product
  const selectedProduct = products.find(p => p.id === form.product_id) || 
                          LOCAL_PRODUCTS.find(p => p.id === form.product_id) ||
                          ({ base_price_per_sqm_kes: form.base_price, name: prefillName });

  // Live price calculation (memoized for performance)
  const liveQuote = useMemo(() => {
    const { product_id, width_meters, height_meters, quantity, double_glazing, finish } = form;
    
    if (!product_id || !width_meters || !height_meters || !quantity || !finish) {
      return null;
    }

    const product = products.find(p => p.id === product_id) || 
                   LOCAL_PRODUCTS.find(p => p.id === product_id);
    const basePrice = product?.base_price_per_sqm_kes || 0;
    const finishRecord = FINISHES.find(f => f.value === finish);
    const finishMultiplier = finishRecord?.multiplier || 1.0;
    const glazingMultiplier = double_glazing ? 1.35 : 1.0;
    const area = Number(width_meters) * Number(height_meters);
    const total = area * basePrice * Number(quantity) * finishMultiplier * glazingMultiplier;

    return {
      area,
      basePrice,
      finishMultiplier,
      glazingMultiplier,
      total: Math.round(total),
    };
  }, [form, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setQuoteLoading(true);
    setQuoteResult(null);
    try {
      const res = await quoteApi.calculate({
        product_id: form.product_id,
        width_meters: Number(form.width_meters),
        height_meters: Number(form.height_meters),
        quantity: Number(form.quantity),
        double_glazing: form.double_glazing,
        finish: form.finish,
      });
      setQuoteResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Quote calculation failed. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setQuoteLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">Instant Estimate</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-warmwhite mb-4">
            Quote Estimator
          </h1>
          <p className="text-silver-300 max-w-2xl">
            Get an instant estimated price range for your aluminium project. Select a product, enter dimensions, and choose your finish.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Select */}
            <div className="md:col-span-2">
              <label className="input-label">Product *</label>
              <select
                id="quote-product"
                name="product_id"
                value={form.product_id}
                onChange={(e) => handleChange('product_id', e.target.value)}
                className={`input-field ${errors.product_id ? 'border-red-500' : ''}`}
                disabled={productsLoading}
              >
                <option value="">{productsLoading ? 'Loading products...' : 'Select a product'}</option>
                {products.map(p => {
                  const localMatch = LOCAL_PRODUCTS.find(lp => lp.id === p.id);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category?.replace('_', ' ')})
                    </option>
                  );
                })}
              </select>
              {errors.product_id && <p className="input-error">{errors.product_id}</p>}
              {selectedProduct && !errors.product_id && (
                <p className="text-xs text-silver-500 mt-1">
                  Base price: KES {Number(selectedProduct.base_price_per_sqm_kes || 0).toLocaleString()}/sqm
                </p>
              )}
            </div>

            {/* Width */}
            <div>
              <label className="input-label">Width (meters) *</label>
              <input
                id="quote-width"
                name="width_meters"
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={form.width_meters}
                onChange={(e) => handleChange('width_meters', e.target.value)}
                className={`input-field ${errors.width_meters ? 'border-red-500' : ''}`}
                placeholder="e.g. 1.5"
              />
              {errors.width_meters && <p className="input-error">{errors.width_meters}</p>}
            </div>

            {/* Height */}
            <div>
              <label className="input-label">Height (meters) *</label>
              <input
                id="quote-height"
                name="height_meters"
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={form.height_meters}
                onChange={(e) => handleChange('height_meters', e.target.value)}
                className={`input-field ${errors.height_meters ? 'border-red-500' : ''}`}
                placeholder="e.g. 2.0"
              />
              {errors.height_meters && <p className="input-error">{errors.height_meters}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label className="input-label">Quantity *</label>
              <input
                id="quote-quantity"
                name="quantity"
                type="number"
                min="1"
                max="100"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
              />
              {errors.quantity && <p className="input-error">{errors.quantity}</p>}
            </div>

            {/* Finish */}
            <div>
              <label className="input-label">Finish *</label>
              <select
                id="quote-finish"
                name="finish"
                value={form.finish}
                onChange={(e) => handleChange('finish', e.target.value)}
                className={`input-field ${errors.finish ? 'border-red-500' : ''}`}
              >
                {FINISHES.map(f => (
                  <option key={f.value} value={f.value}>
                    {f.label} ({f.multiplier}x)
                  </option>
                ))}
              </select>
              {errors.finish && <p className="input-error">{errors.finish}</p>}
            </div>

            {/* Double Glazing */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  id="quote-double-glazing"
                  name="double_glazing"
                  type="checkbox"
                  checked={form.double_glazing}
                  onChange={(e) => handleChange('double_glazing', e.target.checked)}
                  className="w-4 h-4 rounded border-silver-600 bg-charcoal-700 text-cobalt focus:ring-cobalt"
                />
                <span className="text-sm text-silver-300">Double Glazing (1.35x price multiplier)</span>
              </label>
            </div>
          </div>

          {/* Live Price Calculation Display */}
          {liveQuote && (
            <div className="mt-6 p-4 bg-charcoal-800 rounded-lg border border-gold/20">
              <h3 className="text-sm font-semibold text-silver-300 mb-3">Live Price Calculation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-silver-500">Area</p>
                  <p className="text-sm font-medium text-warmwhite">{liveQuote.area.toFixed(2)} m²</p>
                </div>
                <div>
                  <p className="text-xs text-silver-500">Base</p>
                  <p className="text-sm font-medium text-warmwhite">
                    KES {liveQuote.basePrice.toLocaleString()}/sqm
                  </p>
                </div>
                <div>
                  <p className="text-xs text-silver-500">Finishes</p>
                  <p className="text-sm font-medium text-warmwhite">
                    {liveQuote.finishMultiplier}x × {liveQuote.glazingMultiplier === 1.35 ? '1.35x' : '1.00x'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-silver-500">Total</p>
                  <p className="text-lg font-bold text-gold-400">
                    KES {liveQuote.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="mt-8">
            <button type="submit" className="btn-primary w-full md:w-auto" disabled={quoteLoading || productsLoading}>
              {quoteLoading ? <LoadingSpinner size="sm" /> : 'Calculate Quote'}
            </button>
          </div>

          {errors.submit && <p className="text-red-400 text-sm mt-2">{errors.submit}</p>}
        </form>

        {/* Quote Result */}
        {quoteResult && (
          <div className="card mt-8 border-gold/30">
            <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4">Your Estimated Quote</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-charcoal-800 rounded-lg">
                <p className="text-xs text-silver-500 uppercase tracking-wider mb-1">Minimum</p>
                <p className="text-2xl font-bold text-cobalt-300">
                  KES {Number(quoteResult.data?.estimate_min_kes || quoteResult.data?.min_kes || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-charcoal-800 rounded-lg border border-gold/30">
                <p className="text-xs text-gold-400 uppercase tracking-wider mb-1">Estimated</p>
                <p className="text-3xl font-bold text-gold-400">
                  KES {Number(quoteResult.data?.estimate_kes || quoteResult.data?.estimated_kes || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-charcoal-800 rounded-lg">
                <p className="text-xs text-silver-500 uppercase tracking-wider mb-1">Maximum</p>
                <p className="text-2xl font-bold text-cobalt-300">
                  KES {Number(quoteResult.data?.estimate_max_kes || quoteResult.data?.max_kes || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-silver-500 mb-6">
              * This is an estimate. Final pricing depends on site assessment, structural requirements, and installation complexity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/booking" className="btn-primary">Book a Site Visit</Link>
              <Link to="/products" className="btn-secondary">Browse Products</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}