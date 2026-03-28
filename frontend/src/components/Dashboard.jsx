import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogOut, TrendingUp, Leaf, Calendar, Sprout } from 'lucide-react';
import { plantsAPI } from '../api';
import { getPlantImage, GENERIC_PLANT_IMAGE } from '../utils/plantImages';

const DARK_NAV = {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 40px', height: 64,
    background: 'rgba(10,15,13,0.92)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 1px 0 rgba(34,197,94,0.06)',
};

// Plant card image with smart fallback
function PlantCardImage({ plant }) {
    const [imgSrc, setImgSrc] = useState(() => {
        if (plant.firstPhotoUrl) return plant.firstPhotoUrl;
        return getPlantImage(plant.commonName) || GENERIC_PLANT_IMAGE;
    });
    const [errored, setErrored] = useState(false);

    const handleError = () => {
        if (!errored) {
            setErrored(true);
            setImgSrc(GENERIC_PLANT_IMAGE);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={plant.commonName}
            onError={handleError}
            style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s cubic-bezier(.22,.68,0,1.1)',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
    );
}

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
        { icon: <Sprout size={20} />, label: 'Total Plants', value: plants.length },
        { icon: <TrendingUp size={20} />, label: 'Active', value: plants.filter(p => p.status === 'active').length },
        { icon: <Calendar size={20} />, label: 'Days Growing', value: plants.length > 0 ? Math.max(...plants.map(p => p.daysSincePlanting || 0)) : 0 },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--night)', position: 'relative', zIndex: 1 }}>

            {/* Nav */}
            <nav style={DARK_NAV}>
                <div style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22, fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--pearl) 0%, var(--sage) 60%, var(--gold) 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                }}>Botanico</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span style={{ fontSize: 13, color: 'rgba(240,253,244,0.45)', fontFamily: "var(--font-body)", fontWeight: 400 }}>
                        {user?.name || 'Botanist'} 👋
                    </span>
                    <button onClick={handleLogout} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div className="section-header">
                    <div>
                        <h1 style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: 'clamp(30px,4vw,44px)',
                            fontWeight: 700,
                            color: 'var(--pearl)',
                            marginBottom: 6,
                            lineHeight: 1.1,
                        }}>My Plant Journal</h1>
                        <p style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: '0.16em',
                            color: 'var(--mist)',
                            textTransform: 'uppercase',
                            opacity: 0.7,
                        }}>{plants.length} plant{plants.length !== 1 ? 's' : ''} tracked</p>
                    </div>
                    <Link to="/add-plant" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Plus size={15} /> Add Plant
                    </Link>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 44 }}>
                    {STATS.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.09, type: 'spring', stiffness: 160 }} className="stat-card">
                            <div className="stat-icon">{s.icon}</div>
                            <div>
                                <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--pearl)', fontFamily: "var(--font-serif)", lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: '0.12em', color: 'rgba(240,253,244,0.35)', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 24 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Plants Grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>
                ) : plants.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{
                            width: 80, height: 80,
                            background: 'rgba(34,197,94,0.07)',
                            border: '1px solid rgba(34,197,94,0.12)',
                            borderRadius: 24,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <Leaf size={36} style={{ color: 'rgba(34,197,94,0.3)' }} />
                        </div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 30, color: 'var(--pearl)', marginBottom: 8 }}>No plants yet</h2>
                        <p style={{ color: 'rgba(240,253,244,0.35)', marginBottom: 28, fontSize: 14 }}>Start your botanical journey by adding your first plant.</p>
                        <Link to="/add-plant" className="btn-primary">
                            <Plus size={15} style={{ marginRight: 8 }} /> Add Your First Plant
                        </Link>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 18 }}>
                        {plants.map((plant, i) => (
                            <motion.div
                                key={plant.id}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06, type: 'spring', stiffness: 140 }}
                            >
                                <Link to={`/plant/${plant.id}`} className="card-botanical" style={{ display: 'block', textDecoration: 'none' }}>
                                    {/* Image */}
                                    <div style={{
                                        aspectRatio: '16/10',
                                        overflow: 'hidden',
                                        background: 'linear-gradient(135deg, var(--forest), var(--grove))',
                                        position: 'relative',
                                    }}>
                                        <PlantCardImage plant={plant} />
                                        {/* Gradient overlay */}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(to top, rgba(10,15,13,0.6) 0%, transparent 50%)',
                                        }} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding: '16px 18px' }}>
                                        <h3 style={{
                                            fontFamily: "var(--font-serif)",
                                            fontSize: 19,
                                            fontWeight: 600,
                                            color: 'var(--pearl)',
                                            marginBottom: 2,
                                            letterSpacing: '-0.01em',
                                        }}>{plant.commonName}</h3>
                                        {plant.scientificName && (
                                            <p style={{
                                                fontSize: 12,
                                                color: 'var(--mist)',
                                                fontStyle: 'italic',
                                                fontFamily: "var(--font-serif)",
                                                marginBottom: 12,
                                                opacity: 0.7,
                                            }}>{plant.scientificName}</p>
                                        )}
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <span className="badge badge-botanical">
                                                <Calendar size={9} />&nbsp;{new Date(plant.plantingDate).toLocaleDateString()}
                                            </span>
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
