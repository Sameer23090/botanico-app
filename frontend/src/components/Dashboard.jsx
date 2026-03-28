import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogOut, TrendingUp, Leaf, Calendar } from 'lucide-react';
import { plantsAPI } from '../api';

const DARK_NAV = {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 40px', height: 64,
    background: 'rgba(28,16,6,0.9)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
};

export default function Dashboard({ user, onLogout }) {
    const navigate = useNavigate();
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await plantsAPI.getAll();
                setPlants(res.data.plants || []);
            } catch (err) {
                setError('Failed to load plants. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        fetchPlants();
    }, []);

    const handleLogout = () => { onLogout(); navigate('/'); };

    const STATS = [
        { icon: <Leaf size={22} />, label: 'Total Plants', value: plants.length },
        { icon: <TrendingUp size={22} />, label: 'Active', value: plants.filter(p => p.status === 'active').length },
        { icon: <Calendar size={22} />, label: 'Days Growing', value: plants.length > 0 ? Math.max(...plants.map(p => p.daysSincePlanting || 0)) : 0 },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--soil)' }}>

            {/* Nav */}
            <nav style={DARK_NAV}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, var(--cream), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Botanico</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', fontFamily: "'DM Sans', sans-serif" }}>Hello, {user?.name || 'Botanist'} 👋</span>
                    <button onClick={handleLogout} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

                {/* Header */}
                <div className="section-header">
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 4 }}>My Plant Journal</h1>
                        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: 'var(--mint)', textTransform: 'uppercase' }}>{plants.length} plant{plants.length !== 1 ? 's' : ''} tracked</p>
                    </div>
                    <Link to="/add-plant" className="btn-primary" style={{ borderRadius: 50, gap: 8, display: 'inline-flex', alignItems: 'center' }}>
                        <Plus size={16} /> Add Plant
                    </Link>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
                    {STATS.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
                            <div className="stat-icon">{s.icon}</div>
                            <div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--cream)', fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase' }}>{s.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 24 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Plants Grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>
                ) : plants.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
                        <Leaf size={64} style={{ color: 'rgba(82,183,136,0.2)', margin: '0 auto 16px' }} />
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--cream)', marginBottom: 8 }}>No plants yet!</h2>
                        <p style={{ color: 'rgba(245,240,232,0.4)', marginBottom: 24 }}>Start your botanical journey by adding your first plant.</p>
                        <Link to="/add-plant" className="btn-primary" style={{ borderRadius: 50 }}>
                            <Plus size={16} style={{ marginRight: 8 }} /> Add Your First Plant
                        </Link>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                        {plants.map((plant, i) => (
                            <motion.div key={plant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                <Link to={`/plant/${plant.id}`} className="card-botanical" style={{ display: 'block', textDecoration: 'none' }}>
                                    <div style={{ aspectRatio: '16/10', overflow: 'hidden', background: 'rgba(27,58,45,0.5)' }}>
                                        {plant.firstPhotoUrl ? (
                                            <img src={plant.firstPhotoUrl} alt={plant.commonName} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                                onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Leaf size={40} style={{ color: 'rgba(82,183,136,0.2)' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '18px 20px' }}>
                                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--cream)', marginBottom: 2 }}>{plant.commonName}</h3>
                                        {plant.scientificName && <p style={{ fontSize: 13, color: 'var(--mint)', fontStyle: 'italic', marginBottom: 12 }}>{plant.scientificName}</p>}
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <span className="badge badge-botanical"><Calendar size={10} />&nbsp;{new Date(plant.plantingDate).toLocaleDateString()}</span>
                                            {plant.plantType && <span className="badge badge-info">{plant.plantType}</span>}
                                            <span className="badge badge-success">{plant.status}</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
