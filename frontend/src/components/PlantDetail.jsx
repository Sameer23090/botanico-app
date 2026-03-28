import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, Plus, Calendar, TrendingUp, Trash2, Thermometer } from 'lucide-react';
import { plantsAPI, updatesAPI } from '../api';

export default function PlantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plant, setPlant] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plantRes, updatesRes] = await Promise.all([
                    plantsAPI.getById(id),
                    updatesAPI.getByPlantId(id),
                ]);
                setPlant(plantRes.data.plant);
                setUpdates(updatesRes.data.updates || []);
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Plant not found.');
                } else {
                    setError('Failed to load plant data.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Delete this plant and all its data?')) return;
        try {
            await plantsAPI.delete(id);
            navigate('/dashboard');
        } catch {
            alert('Failed to delete plant.');
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--soil)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', background: 'var(--soil)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Leaf size={48} style={{ color: 'rgba(82,183,136,0.2)' }} />
            <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 16 }}>{error}</p>
            <Link to="/dashboard" className="btn-primary" style={{ borderRadius: 50 }}>← Back to Dashboard</Link>
        </div>
    );

    if (!plant) return null;

    const plantingDate = new Date(plant.plantingDate);
    const daysSince = plant.daysSincePlanting ?? Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

    const NAV_STYLE = {
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: 'rgba(28,16,6,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--soil)' }}>

            {/* Nav */}
            <nav style={NAV_STYLE}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link to="/dashboard" className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}><ArrowLeft size={18} /></Link>
                    <Leaf size={18} style={{ color: 'var(--sprout)' }} />
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--cream)', fontSize: 16 }}>{plant.commonName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link to={`/plant/${id}/add-update`} className="btn-primary" style={{ borderRadius: 50, padding: '10px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Plus size={14} /> Log Entry
                    </Link>
                    <button onClick={handleDelete} className="btn-ghost" style={{ color: '#fca5a5', padding: '8px 10px', display: 'flex' }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

                {/* Plant Info Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 32, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {/* Photo placeholder or real photo */}
                        <div style={{ width: 280, minHeight: 220, background: 'var(--moss)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {plant.firstPhotoUrl
                                ? <img src={plant.firstPhotoUrl} alt={plant.commonName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <Leaf size={60} style={{ color: 'rgba(82,183,136,0.2)' }} />
                            }
                        </div>

                        {/* Info */}
                        <div style={{ padding: '28px 32px', flex: 1 }}>
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: 'var(--cream)', marginBottom: 2 }}>{plant.commonName}</h1>
                            {plant.scientificName && <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--mint)', fontSize: 16, marginBottom: 14 }}>{plant.scientificName}</p>}

                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                                <span className="badge badge-botanical">Day {daysSince}</span>
                                {plant.plantType && <span className="badge badge-info">{plant.plantType}</span>}
                                <span className="badge badge-success">{plant.status}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 14, marginBottom: 16 }}>
                                {[
                                    ['Family', plant.family],
                                    ['Location', plant.location],
                                    ['Soil', plant.soilType],
                                    ['Sunlight', plant.sunlightExposure],
                                    ['Planted', plantingDate.toLocaleDateString()],
                                ].filter(([, v]) => v).map(([k, v]) => (
                                    <div key={k}>
                                        <span style={{ color: 'rgba(245,240,232,0.4)', fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}: </span>
                                        <span style={{ color: 'var(--cream)', fontWeight: 500 }}>{v}</span>
                                    </div>
                                ))}
                            </div>

                            {plant.description && <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, fontWeight: 300 }}>{plant.description}</p>}
                        </div>
                    </div>
                </motion.div>

                {/* Growth Log Header */}
                <div className="section-header">
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'var(--cream)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TrendingUp size={22} style={{ color: 'var(--sprout)' }} /> Growth Log
                    </h2>
                    <span className="badge badge-success">{updates.length} entries</span>
                </div>

                {/* Updates */}
                {updates.length === 0 ? (
                    <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                        <Leaf size={56} style={{ color: 'rgba(82,183,136,0.15)', margin: '0 auto 16px' }} />
                        <p style={{ color: 'rgba(245,240,232,0.4)', marginBottom: 20 }}>No entries yet. Log your first observation!</p>
                        <Link to={`/plant/${id}/add-update`} className="btn-primary" style={{ borderRadius: 50, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={14} /> Log First Entry
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {updates.map((u, i) => (
                            <motion.div key={u.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                className="card" style={{ padding: '22px 26px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div>
                                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--cream)', marginBottom: 6 }}>
                                            {u.title || `Day ${u.dayNumber} Entry`}
                                        </h3>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <span className="badge badge-botanical"><Calendar size={10} />&nbsp;{new Date(u.entryDate).toLocaleDateString()}</span>
                                            {u.healthStatus && <span className="badge badge-success">{u.healthStatus}</span>}
                                            {u.floweringStage && <span className="badge badge-info">{u.floweringStage}</span>}
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'rgba(82,183,136,0.25)' }}>D{u.dayNumber}</span>
                                </div>

                                {u.observations && <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.6)', lineHeight: 1.7, marginBottom: 12 }}>{u.observations}</p>}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 13 }}>
                                    {u.temperatureCelsius && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(245,240,232,0.5)' }}><Thermometer size={13} style={{ color: 'var(--sprout)' }} />{u.temperatureCelsius}°C</span>}
                                    {u.soilMoisture && <span style={{ color: 'rgba(245,240,232,0.5)' }}>💧 {u.soilMoisture}</span>}
                                    {u.pestIssues && <span style={{ color: '#fca5a5' }}>⚠️ {u.pestIssues}</span>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
