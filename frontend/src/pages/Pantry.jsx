import React, { useState, useEffect } from 'react';
import { getPantry, addPantryItem, removePantryItem, clearPantry } from '../services/recipe';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { useToast, Toast } from '../components/ui/Toast';

export const Pantry = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [adding, setAdding] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = async () => {
    try { setItems(await getPantry()); }
    catch { addToast('Failed to load pantry', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      const updated = await addPantryItem(name.trim(), quantity.trim(), unit.trim());
      setItems(updated);
      setName(''); setQuantity(''); setUnit('');
      addToast('Item added to pantry!', 'success');
    } catch { addToast('Failed to add item', 'error'); }
    finally { setAdding(false); }
  };

  const handleRemove = async (itemId) => {
    try {
      const updated = await removePantryItem(itemId);
      setItems(updated);
      addToast('Item removed', 'info');
    } catch { addToast('Failed to remove item', 'error'); }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all pantry items?')) return;
    try { await clearPantry(); setItems([]); addToast('Pantry cleared', 'info'); }
    catch { addToast('Failed to clear pantry', 'error'); }
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="font-headline-xl text-headline-xl text-on-surface">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Pantry</span>
          </h1>
          <p className="text-on-surface-variant font-body-md">Track what you have at home and generate recipes from it.</p>
        </div>

        {/* Add item form */}
        <GlassCard>
          <h2 className="font-headline-md text-on-surface mb-4">Add Item</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ingredient name (e.g. chicken)"
              className="flex-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline text-on-surface"
              required
            />
            <input
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="Qty (e.g. 2)"
              className="w-24 bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline text-on-surface"
            />
            <input
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="Unit (e.g. cups)"
              className="w-28 bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline text-on-surface"
            />
            <Button type="submit" variant="primary" disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </GlassCard>

        {/* Pantry list */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-md text-on-surface">Pantry Items ({items.length})</h2>
            {items.length > 0 && (
              <button onClick={handleClear} className="text-label-sm text-error hover:opacity-70 transition-opacity">
                Clear All
              </button>
            )}
          </div>

          {loading && <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-outline-variant rounded-lg" />)}</div>}

          {!loading && items.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-30">kitchen</span>
              <p className="font-body-md">Your pantry is empty. Start by adding some ingredients!</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item._id} className="flex items-center justify-between glass-card rounded-xl px-4 py-3 group">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">kitchen</span>
                    <div>
                      <p className="font-label-md text-on-surface">{item.name}</p>
                      {(item.quantity || item.unit) && (
                        <p className="text-label-sm text-on-surface-variant">{item.quantity} {item.unit}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </>
  );
};

export default Pantry;
