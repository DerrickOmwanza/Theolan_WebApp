import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi, quoteApi } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const FINISHES = [
  { value: 'mill', label: 'Mill Finish', multiplier: '1.00x' },
  { value: 'silver', label: 'Silver Anodized', multiplier: '1.05x' },
  { value: 'black', label: 'Black Anodized', multiplier: '1.15x' },
  { value: 'champagne', label: 'Champagne', multiplier: '1.10x' },
  { value: 'bronze', label: 'Bronze', multiplier: '1.12x' },
];

export default function QuotePage() {
  const [searchParams] = useSearchParams();
  const preselectedProduct = searchParams.get('product_id') || '';

  const [form, setForm] = useState({
    product_id: preselectedProduct,
    width_meters: '',
    height_meters: '',
    quantity: 1,
    double_glazing: false,
    finish: 'mill',
  });
  const [errors, setErrors] = useState({});
  const [quoteResult, setQuoteResult] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productApi.list({ limit: 100 }),
  });

  const products = productsData?.data?.data || [];

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

  const selectedProduct = products.find(p => p.id === form.product_id);

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
                value={form.product_id}
                onChange={(e) => handleChange('product_id', e.target.value)}
                className={`input-field ${errors.product_id ? 'border-red-500' : ''}`}
                disabled={productsLoading}
              >
                <option value="">{productsLoading ? 'Loading products...' : 'Select a product'}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category?.replace('_', ' ')})</option>
                ))}
              </select>
              {errors.product_id && <p className="input-error">{errors.product_id}</p>}
              {selectedProduct && (
                <p className="text-xs text-silver-500 mt-1">
                  Base price: KES {Number(selectedProduct.base_price_per_sqm_kes).toLocaleString()}/sqm
                </p>
              )}
            </div>

            {/* Width */}
            <div>
              <label className="input-label">Width (meters) *</label>
              <input
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
                value={form.finish}
                onChange={(e) => handleChange('finish', e.target.value)}
                className={`input-field ${errors.finish ? 'border-red-500' : ''}`}
              >
                {FINISHES.map(f => (
                  <option key={f.value} value={f.value}>{f.label} ({f.multiplier})</option>
                ))}
              </select>
              {errors.finish && <p className="input-error">{errors.finish}</p>}
            </div>

            {/* Double Glazing */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.double_glazing}
                  onChange={(e) => handleChange('double_glazing', e.target.checked)}
                  className="w-4 h-4 rounded border-silver-600 bg-charcoal-700 text-cobalt focus:ring-cobalt"
                />
                <span className="text-sm text-silver-300">Double Glazing (1.35x price multiplier)</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex items-center gap-4">
            <button type="submit" className="btn-primary" disabled={quoteLoading}>
              {quoteLoading ? <LoadingSpinner size="sm" /> : 'Calculate Quote'}
            </button>
            {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}
          </div>
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
