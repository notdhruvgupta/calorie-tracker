import { useState, useRef } from 'react';
import Button from './Button';
import { analyzeText, analyzeImage } from '../utils/claude';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function AddFood({ onConfirm, onBack }) {
  const [mode, setMode] = useState('text');
  const [dishName, setDishName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [category, setCategory] = useState('Lunch');
  const fileRef = useRef();

  async function handleAnalyze() {
    setError(null);
    setLoading(true);
    try {
      let data;
      if (mode === 'text') {
        if (!dishName.trim()) throw new Error('Enter a dish name');
        data = await analyzeText(dishName, ingredients);
      } else {
        if (!imageData) throw new Error('Upload an image first');
        data = await analyzeImage(imageData, mediaType);
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaType(file.type);
    setImagePreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveItem(idx) {
    setResult((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  }

  function handleUpdateQty(idx, newQty) {
    setResult((prev) => {
      const items = [...prev.items];
      const item = { ...items[idx] };
      const ratio = newQty / (item.qty || 1);
      item.qty = newQty;
      item.calories = Math.round(item.calories * ratio);
      item.protein = Math.round(item.protein * ratio);
      item.carbs = Math.round(item.carbs * ratio);
      item.fat = Math.round(item.fat * ratio);
      items[idx] = item;
      return { ...prev, items };
    });
  }

  function handleConfirm() {
    if (!result || result.items.length === 0) return;
    const totalCalories = result.items.reduce((s, i) => s + i.calories, 0);
    onConfirm({
      id: crypto.randomUUID(),
      category,
      dishName: result.dishName,
      items: result.items,
      totalCalories,
      timestamp: Date.now(),
    });
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="font-heading text-2xl font-bold">Add Food</h1>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-surface rounded-xl p-1 gap-1">
        {['text', 'image'].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setResult(null); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer ${
              mode === m ? 'bg-accent text-neutral-950' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {m === 'text' ? 'Text' : 'Photo'}
          </button>
        ))}
      </div>

      {/* Input Area */}
      {!result && (
        <>
          {mode === 'text' ? (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Dish name (e.g. Chicken Biryani)"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-accent transition-colors"
              />
              <textarea
                placeholder="Ingredients & weights (optional)&#10;e.g. Rice 200g, Chicken 150g, Oil 15ml"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={3}
                className="bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Food" className="w-full max-h-60 object-cover rounded-xl" />
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-surface-lighter rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-500 hover:border-accent hover:text-accent transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <span className="text-sm">Upload a photo</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreview && (
                <Button variant="ghost" onClick={() => { setImagePreview(null); setImageData(null); }}>
                  Remove photo
                </Button>
              )}
            </div>
          )}

          {error && <p className="text-danger text-sm">{error}</p>}

          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                Analyzing…
              </span>
            ) : (
              'Analyze'
            )}
          </Button>
        </>
      )}

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-bold">{result.dishName}</h2>

          {/* Nutrition Table */}
          <div className="bg-surface rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-500 border-b border-surface-lighter">
                  <th className="text-left px-4 py-2 font-medium">Item</th>
                  <th className="px-2 py-2 font-medium">Qty</th>
                  <th className="px-2 py-2 font-medium">Cal</th>
                  <th className="px-2 py-2 font-medium">P</th>
                  <th className="px-2 py-2 font-medium">C</th>
                  <th className="px-2 py-2 font-medium">F</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-surface-light last:border-0">
                    <td className="text-left px-4 py-2">{item.name}</td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleUpdateQty(idx, Number(e.target.value) || 0)}
                        className="w-14 bg-surface-light rounded px-1 py-0.5 text-center text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <span className="text-xs text-neutral-500 ml-0.5">{item.unit}</span>
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums text-accent font-medium">{item.calories}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-neutral-400">{item.protein}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-neutral-400">{item.carbs}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-neutral-400">{item.fat}</td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-neutral-600 hover:text-danger transition-colors cursor-pointer"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium border-t border-surface-lighter">
                  <td className="text-left px-4 py-2">Total</td>
                  <td></td>
                  <td className="px-2 py-2 text-center tabular-nums text-accent">
                    {result.items.reduce((s, i) => s + i.calories, 0)}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums text-neutral-400">
                    {result.items.reduce((s, i) => s + i.protein, 0)}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums text-neutral-400">
                    {result.items.reduce((s, i) => s + i.carbs, 0)}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums text-neutral-400">
                    {result.items.reduce((s, i) => s + i.fat, 0)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-400">Meal category</label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-accent text-neutral-950'
                      : 'bg-surface text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setResult(null)} className="flex-1">
              Re-analyze
            </Button>
            <Button onClick={handleConfirm} className="flex-1" disabled={result.items.length === 0}>
              Confirm & Log
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
