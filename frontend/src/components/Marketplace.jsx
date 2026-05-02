import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Tag, MapPin, Plus, ExternalLink, Leaf, Loader2, X, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import api, { marketplaceAPI, plantsAPI, aiAPI } from '../api';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export default function Marketplace() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [myPlants, setMyPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [newListing, setNewListing] = useState({
        plantId: '', title: '', description: '',
        listingType: 'Sale', category: 'Seeds',
        price: { amount: '', currency: 'INR' },
        location: { city: '', state: '' },
    });
    const [filters, setFilters] = useState({
        category: '', listingType: '', city: '', minPrice: '', maxPrice: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchListings();
        plantsAPI.getAll().then(r => setMyPlants(r.data.plants || [])).catch(() => {});
    }, [filters]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
            const res = await api.get(`/marketplace?${params.toString()}`);
            setListings(res.data.listings || []);
        } catch (err) {
            console.error('Marketplace fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateListing = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateError('');
        try {
            await marketplaceAPI.createListing({
                ...newListing,
                price: { amount: Number(newListing.price.amount), currency: newListing.price.currency }
            });
            setShowCreateModal(false);
            setNewListing({ plantId: '', title: '', description: '', listingType: 'Sale', category: 'Seeds', price: { amount: '', currency: 'INR' }, location: { city: '', state: '' } });
            fetchListings();
        } catch (err) {
            setCreateError(err.response?.data?.error || 'Failed to create listing');
        } finally {
            setCreating(false);
        }
    };

    const generateAiDescription = async () => {
        if (!newListing.title) {
            setCreateError('Please enter a title first to generate a description.');
            return;
        }
        setGenerating(true);
        setCreateError('');
        try {
            const plant = myPlants.find(p => p.id === newListing.plantId);
            const prompt = `Act as an expert botanist and marketplace seller. Generate a short, compelling listing description (max 60 words) for:
            Item: ${newListing.title}
            Category: ${newListing.category}
            Type: ${newListing.listingType}
            ${plant ? `Plant Details: ${plant.commonName} (${plant.scientificName || ''})` : ''}
            
            Focus on plant health, rarity, and care tips.`;
            
            const res = await aiAPI.chat(prompt, []);
            setNewListing(prev => ({ ...prev, description: res.data.reply }));
        } catch (err) {
            setCreateError('AI generation failed. Please write manually.');
        } finally {
            setGenerating(false);
        }
    };

    // Safe search — handles null plantId
    const filteredListings = listings.filter(l => {
        const title = (l.title || '').toLowerCase();
        const plantName = (l.plantId?.commonName || '').toLowerCase();
        return title.includes(searchTerm.toLowerCase()) || plantName.includes(searchTerm.toLowerCase());
    });

    const NAV_STYLE = {
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: 'rgba(10,15,13,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(34,197,94,0.06)',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--night)', position: 'relative', zIndex: 1 }}>

            {/* Nav */}
            <nav style={NAV_STYLE}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link to="/dashboard" className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}>
                        <ArrowLeft size={17} />
                    </Link>
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--pearl)', fontSize: 20, letterSpacing: '-0.02em' }}>
                        Botanical Exchange
                    </span>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} /> {t('marketplace.create_listing') || 'Create Listing'}
                </button>
            </nav>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--pearl)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                        {t('marketplace.title') || 'Botanical Exchange'}
                    </h1>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--mist)', opacity: 0.6, textTransform: 'uppercase' }}>
                        Discover seeds, saplings, and rare specimens
                    </p>
                </div>

                {/* Search & Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 40 }}>
                    <div style={{ flex: 2, minWidth: 260, position: 'relative' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search plants, seeds, equipment..."
                            style={{ paddingLeft: 46, height: 50, fontSize: 15 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--jade)', opacity: 0.5 }} />
                    </div>
                    <select
                        className="select-field"
                        style={{ flex: 1, minWidth: 150, height: 50 }}
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        <option value="Seeds">Seeds</option>
                        <option value="Saplings">Saplings</option>
                        <option value="Mature Plants">Mature Plants</option>
                        <option value="Organic Fertilizer">Organic Fertilizer</option>
                        <option value="Equipment">Equipment</option>
                    </select>
                    <select
                        className="select-field"
                        style={{ flex: 1, minWidth: 130, height: 50 }}
                        value={filters.listingType}
                        onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="Sale">For Sale</option>
                        <option value="Trade">For Trade</option>
                        <option value="Free">Free</option>
                    </select>
                    <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
                        <input type="number" className="input-field" placeholder="Min ₹" style={{ height: 50 }}
                            value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                        <input type="number" className="input-field" placeholder="Max ₹" style={{ height: 50 }}
                            value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 20 }}>
                        <Loader2 size={40} style={{ color: 'var(--jade)', animation: 'spin 1s linear infinite' }} />
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--mist)', opacity: 0.5, letterSpacing: '0.15em' }}>SCANNING MARKETPLACE...</p>
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <div className="stat-icon" style={{ width: 80, height: 80, margin: '0 auto 24px', opacity: 0.15 }}>
                            <ShoppingBag size={40} />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--pearl)', marginBottom: 10 }}>No listings found</h2>
                        <p style={{ color: 'rgba(240,253,244,0.35)', maxWidth: 360, margin: '0 auto 28px' }}>
                            Be the first to list a plant or equipment in the exchange.
                        </p>
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={16} /> Create First Listing
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                        {filteredListings.map((l, i) => (
                            <motion.div
                                key={l.id || l._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="card-botanical"
                                style={{ display: 'flex', flexDirection: 'column' }}
                            >
                                {/* Image */}
                                <div style={{ height: 200, background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                                    {l.photos && l.photos[0] ? (
                                        <img src={l.photos[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                            <Leaf size={60} />
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                        <span className="badge badge-info" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>{l.listingType}</span>
                                    </div>
                                    {l.price?.amount > 0 && (
                                        <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 22, fontWeight: 800, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                            {l.price?.currency === 'INR' ? '₹' : '$'}{l.price?.amount}
                                        </div>
                                    )}
                                    {l.listingType === 'Free' && (
                                        <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 14, fontWeight: 700, color: 'var(--jade)', background: 'rgba(0,0,0,0.6)', padding: '3px 10px', borderRadius: 100, backdropFilter: 'blur(4px)' }}>FREE</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 700, color: 'var(--pearl)', lineHeight: 1.2, marginBottom: 8 }}>{l.title}</h3>
                                    <p style={{ fontSize: 13, color: 'rgba(240,253,244,0.45)', marginBottom: 16, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {l.description}
                                    </p>

                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {l.location?.city && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--mist)' }}>
                                                <MapPin size={13} style={{ color: 'var(--jade)' }} />
                                                <span>{l.location.city}{l.location.state ? `, ${l.location.state}` : ''}</span>
                                            </div>
                                        )}
                                        {l.category && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--mist)' }}>
                                                <Tag size={13} style={{ color: 'var(--jade)' }} />
                                                <span>{l.category}</span>
                                            </div>
                                        )}

                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--jade)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                                                    {(l.userId?.name || '?')[0].toUpperCase()}
                                                </div>
                                                <span style={{ fontSize: 12, color: 'var(--pearl)', fontWeight: 500 }}>{l.userId?.name || 'Anonymous'}</span>
                                            </div>
                                            <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                View <ExternalLink size={11} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Listing Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card"
                            style={{ maxWidth: 520, width: '100%', padding: '40px 36px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                                <div>
                                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--pearl)', marginBottom: 4 }}>New Listing</h2>
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--mist)', letterSpacing: '0.15em', opacity: 0.6 }}>BOTANICAL EXCHANGE</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', padding: 4 }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateListing}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                                    <div>
                                        <label className="label-text">Select Plant (from your collection)</label>
                                        <select className="select-field" value={newListing.plantId}
                                            onChange={(e) => setNewListing({ ...newListing, plantId: e.target.value })} required>
                                            <option value="">Choose a plant...</option>
                                            {myPlants.map(p => <option key={p.id} value={p.id}>{p.commonName}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="label-text">Listing Title</label>
                                        <input type="text" className="input-field" placeholder="e.g. Rare Monstera Deliciosa cutting"
                                            value={newListing.title} onChange={(e) => setNewListing({ ...newListing, title: e.target.value })} required />
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <label className="label-text" style={{ marginBottom: 0 }}>Description</label>
                                            <button 
                                                type="button"
                                                onClick={generateAiDescription}
                                                disabled={generating}
                                                style={{ background: 'none', border: 'none', color: 'var(--jade)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', opacity: generating ? 0.6 : 1 }}
                                            >
                                                {generating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                                {generating ? 'Generating...' : 'AI Generate'}
                                            </button>
                                        </div>
                                        <textarea className="input-field" placeholder="Describe condition, age, care tips..." rows={3}
                                            style={{ resize: 'vertical', minHeight: 80 }}
                                            value={newListing.description} onChange={(e) => setNewListing({ ...newListing, description: e.target.value })} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div>
                                            <label className="label-text">Type</label>
                                            <select className="select-field" value={newListing.listingType}
                                                onChange={(e) => setNewListing({ ...newListing, listingType: e.target.value })}>
                                                <option value="Sale">For Sale</option>
                                                <option value="Trade">For Trade</option>
                                                <option value="Free">Free</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-text">Category</label>
                                            <select className="select-field" value={newListing.category}
                                                onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}>
                                                <option value="Seeds">Seeds</option>
                                                <option value="Saplings">Saplings</option>
                                                <option value="Mature Plants">Mature Plants</option>
                                                <option value="Organic Fertilizer">Organic Fertilizer</option>
                                                <option value="Equipment">Equipment</option>
                                            </select>
                                        </div>
                                    </div>

                                    {newListing.listingType !== 'Free' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                                            <div>
                                                <label className="label-text">Price</label>
                                                <input type="number" className="input-field" placeholder="0" min="0"
                                                    value={newListing.price.amount}
                                                    onChange={(e) => setNewListing({ ...newListing, price: { ...newListing.price, amount: e.target.value } })} required />
                                            </div>
                                            <div>
                                                <label className="label-text">Currency</label>
                                                <select className="select-field" value={newListing.price.currency}
                                                    onChange={(e) => setNewListing({ ...newListing, price: { ...newListing.price, currency: e.target.value } })}>
                                                    <option value="INR">₹ INR</option>
                                                    <option value="USD">$ USD</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div>
                                            <label className="label-text">City</label>
                                            <input type="text" className="input-field" placeholder="e.g. Bangalore"
                                                value={newListing.location.city}
                                                onChange={(e) => setNewListing({ ...newListing, location: { ...newListing.location, city: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label className="label-text">State</label>
                                            <input type="text" className="input-field" placeholder="e.g. Karnataka"
                                                value={newListing.location.state}
                                                onChange={(e) => setNewListing({ ...newListing, location: { ...newListing.location, state: e.target.value } })} />
                                        </div>
                                    </div>

                                    {createError && (
                                        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#fca5a5', fontSize: 13 }}>
                                            ⚠️ {createError}
                                        </div>
                                    )}

                                    <button type="submit" className="btn-primary" disabled={creating}
                                        style={{ width: '100%', padding: '16px', fontSize: 15, opacity: creating ? 0.6 : 1 }}>
                                        {creating ? 'Publishing...' : 'Publish Listing'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
