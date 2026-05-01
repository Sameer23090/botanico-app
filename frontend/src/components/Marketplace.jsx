import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Filter, Tag, MapPin, Plus, ExternalLink, Leaf, Loader2 } from 'lucide-react';
import api from '../api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Marketplace() {
    const { t } = useTranslation();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        listingType: '',
        city: '',
        minPrice: '',
        maxPrice: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchListings();
    }, [filters]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => {
                if (v) params.append(k, v);
            });
            const res = await api.get(`/marketplace?${params.toString()}`);
            setListings(res.data.listings || []);
        } catch (err) {
            console.error("Marketplace fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredListings = listings.filter(l => 
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.plantId?.commonName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', padding: '40px 24px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            
            {/* Header */}
            <div className="section-header" style={{ marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 'clamp(32px, 5vw, 48px)', color: 'var(--pearl)', marginBottom: 8 }}>
                        {t('marketplace.title') || 'Botanical Exchange'}
                    </h1>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: '0.15em', color: 'var(--mist)', opacity: 0.7, textTransform: 'uppercase' }}>
                        Discover seeds, saplings, and rare specimens
                    </p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={18} /> {t('marketplace.create_listing') || 'Create Listing'}
                </button>
            </div>

            {/* Search & Filters Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 44 }}>
                <div style={{ flex: 2, minWidth: 300, position: 'relative' }}>
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Search for plants, seeds, or gear..." 
                        style={{ paddingLeft: 48, height: 54, fontSize: 16 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--jade)', opacity: 0.5 }} />
                </div>
                
                <select 
                    className="select-field" 
                    style={{ flex: 1, minWidth: 160, height: 54 }}
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                    <option value="">All Categories</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Saplings">Saplings</option>
                    <option value="Mature Plants">Mature Plants</option>
                    <option value="Organic Fertilizer">Organic Fertilizer</option>
                    <option value="Equipment">Equipment</option>
                </select>

                <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
                    <input 
                        type="number" 
                        className="input-field" 
                        placeholder="Min ₹" 
                        style={{ height: 54 }}
                        value={filters.minPrice}
                        onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    />
                    <input 
                        type="number" 
                        className="input-field" 
                        placeholder="Max ₹" 
                        style={{ height: 54 }}
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 20 }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--jade)' }} />
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: 'var(--mist)', opacity: 0.5 }}>SCANNING MARKETPLACE...</p>
                </div>
            ) : filteredListings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 24px' }}>
                    <div className="stat-icon" style={{ width: 80, height: 80, margin: '0 auto 24px', opacity: 0.2 }}>
                        <ShoppingBag size={40} />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: 'var(--pearl)', marginBottom: 12 }}>No listings found</h2>
                    <p style={{ color: 'rgba(240,253,244,0.4)', maxWidth: 400, margin: '0 auto' }}>Try adjusting your filters or search terms to find what you're looking for.</p>
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
                            {/* Listing Image */}
                            <div style={{ height: 200, background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
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
                                <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                                    <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                        {l.price?.currency === 'INR' ? '₹' : '$'}{l.price?.amount}
                                    </span>
                                </div>
                            </div>

                            {/* Listing Info */}
                            <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, color: 'var(--pearl)', lineHeight: 1.2 }}>{l.title}</h3>
                                </div>
                                
                                <p style={{ fontSize: 13, color: 'rgba(240,253,244,0.5)', marginBottom: 16, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {l.description}
                                </p>

                                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--mist)' }}>
                                        <MapPin size={14} className="text-jade" />
                                        <span>{l.location?.city}, {l.location?.state}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--mist)' }}>
                                        <Tag size={14} className="text-jade" />
                                        <span>{l.category}</span>
                                    </div>
                                    
                                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--jade)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                                                {l.userId?.name?.[0]}
                                            </div>
                                            <span style={{ fontSize: 12, color: 'var(--pearl)', fontWeight: 500 }}>{l.userId?.name}</span>
                                        </div>
                                        <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
                                            View Details <ExternalLink size={12} style={{ marginLeft: 4 }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
