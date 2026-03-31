import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, Plus, Trash2, TrendingUp, Edit2 } from 'lucide-react';
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
        <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 1, position: 'relative' }}>
            <Leaf size={48} style={{ color: 'rgba(34,197,94,0.15)' }} />
            <p style={{ color: 'rgba(240,253,244,0.4)', fontSize: 15 }}>{error}</p>
            <Link to="/dashboard" className="btn-primary">← Back to Dashboard</Link>
        </div>
    );

    if (!plant) return null;

    const plantingDate = new Date(plant.plantingDate);
    const daysSince = plant.daysSincePlanting ?? Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

    const NAV_STYLE = {
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: 'rgba(10,15,13,0.92)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(34,197,94,0.06)',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--night)', position: 'relative', zIndex: 1 }}>

            {/* Nav */}
            <nav style={NAV_STYLE}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link to="/dashboard" className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}><ArrowLeft size={17} /></Link>
                    <span style={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 600, color: 'var(--pearl)', fontSize: 17,
                        letterSpacing: '-0.01em',
                    }}>{plant.commonName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link to={`/plant/${id}/add-update`} className="btn-primary" style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Plus size={13} /> Log Entry
                    </Link>
                    <button onClick={handleDelete} className="btn-ghost" style={{ color: '#fca5a5', padding: '8px 10px', display: 'flex' }}>
                        <Trash2 size={15} />
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

                {/* Plant Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 140 }}
                    className="card"
                    style={{ marginBottom: 32, overflow: 'hidden' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {/* Info */}
                        <div style={{ padding: '28px 30px', flex: 1 }}>
                            <h1 style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: 34, fontWeight: 700,
                                color: 'var(--pearl)',
                                marginBottom: 4,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1,
                            }}>{plant.commonName}</h1>

                            {plant.scientificName && (
                                <p style={{
                                    fontFamily: "var(--font-serif)",
                                    fontStyle: 'italic', color: 'var(--mist)',
                                    fontSize: 15, marginBottom: 16, opacity: 0.75,
                                }}>{plant.scientificName}</p>
                            )}

                            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}>
                                <span className="badge badge-botanical">Day {daysSince}</span>
                                {plant.plantType && <span className="badge badge-info">{plant.plantType}</span>}
                                <span className="badge badge-success">{plant.status}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 13, marginBottom: 16 }}>
                                {[
                                    ['Family', plant.family],
                                    ['Location', plant.location],
                                    ['Soil', plant.soilType],
                                    ['Sunlight', plant.sunlightExposure],
                                    ['Planted', plantingDate.toLocaleDateString()],
                                ].filter(([, v]) => v).map(([k, v]) => (
                                    <div key={k}>
                                        <span style={{
                                            color: 'rgba(240,253,244,0.35)',
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 9, letterSpacing: '0.12em',
                                            textTransform: 'uppercase', display: 'block', marginBottom: 2,
                                        }}>{k}</span>
                                        <span style={{ color: 'var(--pearl)', fontWeight: 500, fontSize: 13 }}>{v}</span>
                                    </div>
                                ))}
                            </div>

                            {plant.description && (
                                <p style={{ fontSize: 13, color: 'rgba(240,253,244,0.5)', lineHeight: 1.75, fontWeight: 300 }}>
                                    {plant.description}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Growth Log Header */}
                <div className="section-header">
                    <h2 style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 26, fontWeight: 700,
                        color: 'var(--pearl)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        letterSpacing: '-0.02em',
                    }}>
                        <TrendingUp size={20} style={{ color: 'var(--jade)' }} /> Growth Log
                    </h2>
                    <span className="badge badge-success">{updates.length} entries</span>
                </div>

                {/* Updates */}
                {updates.length === 0 ? (
                    <div className="card" style={{ padding: '56px 40px', textAlign: 'center' }}>
                        <div style={{
                            width: 64, height: 64,
                            background: 'rgba(34,197,94,0.06)',
                            border: '1px solid rgba(34,197,94,0.1)',
                            borderRadius: 18,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <Leaf size={28} style={{ color: 'rgba(34,197,94,0.25)' }} />
                        </div>
                        <p style={{ color: 'rgba(240,253,244,0.35)', marginBottom: 20, fontSize: 14 }}>
                            No entries yet. Log your first observation!
                        </p>
                        <Link to={`/plant/${id}/add-update`} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={14} /> Log First Entry
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {updates.map((u, i) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, x: -14 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.055, type: 'spring', stiffness: 150 }}
                                className="card"
                                style={{ padding: '22px 26px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <div>
                                        <h3 style={{
                                            fontFamily: "var(--font-serif)",
                                            fontSize: 18, color: 'var(--pearl)', marginBottom: 6,
                                            fontWeight: 600, letterSpacing: '-0.01em',
                                        }}>
                                            {u.title || `Day ${u.dayNumber} Entry`}
                                        </h3>
                                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                                            <span className="badge badge-botanical">
                                                {new Date(u.entryDate).toLocaleDateString()}
                                            </span>
                                            {u.healthStatus && <span className="badge badge-success">{u.healthStatus}</span>}
                                            {u.floweringStage && <span className="badge badge-info">{u.floweringStage}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                        <span style={{
                                            fontFamily: "var(--font-serif)",
                                            fontSize: 30, fontWeight: 700,
                                            color: 'rgba(34,197,94,0.12)',
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1,
                                        }}>D{u.dayNumber}</span>
                                        <Link 
                                            to={`/plant/${id}/update/${u.id || u._id}/edit`} 
                                            className="btn-ghost" 
                                            style={{ padding: '6px', borderRadius: '50%', color: 'var(--jade)', opacity: 0.6 }}
                                            title="Edit Entry"
                                        >
                                            <Edit2 size={14} />
                                        </Link>
                                    </div>
                                </div>

                                {u.observations && (
                                    <p style={{ fontSize: 13, color: 'rgba(240,253,244,0.55)', lineHeight: 1.75, marginBottom: 10 }}>
                                        {u.observations}
                                    </p>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: 12 }}>
                                    {u.temperatureCelsius && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(240,253,244,0.4)' }}>
                                            {u.temperatureCelsius}°C
                                        </span>
                                    )}
                                    {u.soilMoisture && <span style={{ color: 'rgba(240,253,244,0.4)' }}>{u.soilMoisture} Moisture</span>}
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
