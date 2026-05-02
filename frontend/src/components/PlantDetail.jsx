import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowLeft, Plus, Trash2, TrendingUp, Edit2, QrCode, X, Download, Sparkles, BrainCircuit, Camera, AlertTriangle, ShieldCheck } from 'lucide-react';
import { plantsAPI, updatesAPI, aiAPI } from '../api';

export default function PlantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plant, setPlant] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [aiMessage, setAiMessage] = useState('');
    const [diagnosisData, setDiagnosisData] = useState(null);
    const [isThinking, setIsThinking] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false);

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

    const consultAI = async () => {
        setShowAI(true);
        setIsThinking(true);
        setAiMessage('');
        setDiagnosisData(null);
        
        try {
            const res = await aiAPI.consult(id);
            setAiMessage(res.data.advice);
        } catch (err) {
            setAiMessage(err.response?.data?.error || "Metabolic scanning failed. Ensure the AI Service Key (GEMINI_API_KEY) is properly configured in the environment.");
        } finally {
            setIsThinking(false);
        }
    };

    const diagnoseImage = async (file) => {
        setAnalyzingImage(true);
        setShowAI(true);
        setIsThinking(true);
        setAiMessage('');
        setDiagnosisData(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = reader.result;
                const res = await aiAPI.diagnose(base64data, id);
                setDiagnosisData(res.data);
            };
        } catch (err) {
            setAiMessage("Visual analysis failed. Ensure high-resolution optics and valid AI credentials.");
        } finally {
            setAnalyzingImage(false);
            setIsThinking(false);
        }
    };

    const plantingDate = new Date(plant.plantingDate);
    const daysSince = plant.daysSincePlanting ?? Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

    const plantUrl = `${window.location.origin}/public/plant/${id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(plantUrl)}&color=22c55e&bgcolor=0a0f0d`;

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

            {/* QR Modal */}
            <AnimatePresence>
                {showQR && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card"
                            style={{ maxWidth: 400, width: '100%', padding: '40px 32px', textAlign: 'center' }}
                        >
                            <button 
                                onClick={() => setShowQR(false)} 
                                style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>

                            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: 'var(--pearl)', marginBottom: 8 }}>Plant ID Tag</h2>
                            <p style={{ color: 'rgba(240,253,244,0.4)', fontSize: 13, marginBottom: 28 }}>Print this QR and attach it to your physical plant to bridge it to the digital record.</p>
                            
                            <div style={{ 
                                background: '#0a0f0d', 
                                padding: 24, 
                                borderRadius: 20, 
                                border: '1px solid var(--jade)', 
                                display: 'inline-block', 
                                marginBottom: 28,
                                boxShadow: '0 0 40px rgba(34,197,94,0.15)'
                            }}>
                                <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 8 }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <a href={qrUrl} download={`label_${plant.commonName}.png`} className="btn-primary" style={{ width: '100%' }}>
                                    <Download size={16} style={{ marginRight: 8 }} /> Download PNG
                                </a>
                                <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: 'var(--jade)', opacity: 0.6 }}>ID: {id.substring(0,8).toUpperCase()}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Botanist Modal */}
            <AnimatePresence>
                {showAI && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(10,15,13,0.95)', backdropFilter: 'blur(12px)' }}
                    >
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="card"
                            style={{ maxWidth: 500, width: '100%', padding: '48px 40px', border: '1px solid var(--jade)', boxShadow: '0 0 50px rgba(34,197,94,0.1)' }}
                        >
                            <button onClick={() => setShowAI(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer' }}><X size={20} /></button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                                <div className="stat-icon" style={{ width: 56, height: 56, background: 'rgba(34,197,94,0.1)', color: 'var(--jade)' }}>
                                    <BrainCircuit size={28} />
                                </div>
                                <div>
                                    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: 'var(--pearl)', margin: 0 }}>AI Botanist</h2>
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: 'var(--mist)', opacity: 0.6, letterSpacing: '0.15em', margin: 0 }}>BIOMETRIC CONSULTATION</p>
                                </div>
                            </div>

                            {isThinking ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <motion.div 
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{ fontSize: 14, color: 'var(--jade)', fontFamily: "var(--font-mono)" }}
                                    >
                                        {analyzingImage ? 'ANALYZING VISUAL DATA...' : 'SCANNING DATABASE...'}
                                    </motion.div>
                                    <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,0.05)', margin: '12px auto', position: 'relative', overflow: 'hidden' }}>
                                        <motion.div 
                                            animate={{ left: ['-100%', '100%'] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            style={{ position: 'absolute', top: 0, width: '40%', height: '100%', background: 'var(--jade)' }}
                                        />
                                    </div>
                                </div>
                            ) : diagnosisData ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <span style={{ fontSize: 12, color: 'var(--pearl)', fontWeight: 700 }}>Health Index</span>
                                            <span style={{ fontSize: 18, color: diagnosisData.healthIndex > 70 ? 'var(--jade)' : '#fca5a5', fontWeight: 800 }}>{diagnosisData.healthIndex}%</span>
                                        </div>
                                        <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                                            <div style={{ height: '100%', width: `${diagnosisData.healthIndex}%`, background: diagnosisData.healthIndex > 70 ? 'var(--jade)' : 'var(--gold)', borderRadius: 10 }} />
                                        </div>
                                    </div>

                                    <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                                            <AlertTriangle size={16} style={{ color: 'var(--gold)', marginTop: 2 }} />
                                            <div>
                                                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 4 }}>Diagnosis</div>
                                                <p style={{ fontSize: 14, color: 'var(--pearl)', margin: 0, lineHeight: 1.5 }}>{diagnosisData.diagnosis}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                            <ShieldCheck size={16} style={{ color: 'var(--jade)', marginTop: 2 }} />
                                            <div>
                                                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: 'var(--jade)', textTransform: 'uppercase', marginBottom: 4 }}>Protocol</div>
                                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'rgba(240,253,244,0.6)' }}>
                                                    {diagnosisData.remediations.map((r, idx) => <li key={idx} style={{ marginBottom: 4 }}>{r}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAI(false)} className="btn-primary" style={{ width: '100%' }}>Initialize Remediation</button>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div style={{ 
                                        padding: 24, 
                                        background: 'rgba(0,0,0,0.3)', 
                                        borderRadius: 16, 
                                        border: '1px solid rgba(34,197,94,0.1)', 
                                        marginBottom: 32,
                                        fontFamily: "var(--font-body)",
                                        fontSize: 15,
                                        lineHeight: 1.6,
                                        color: 'rgba(240,253,244,0.85)',
                                        position: 'relative'
                                    }}>
                                        <Sparkles size={16} style={{ position: 'absolute', top: -8, left: 16, color: 'var(--gold)' }} />
                                        {aiMessage}
                                    </div>
                                    <button onClick={() => setShowAI(false)} className="btn-primary" style={{ width: '100%' }}>Acknowledge Guidance</button>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    <label className="btn-ghost" style={{ color: 'var(--gold)', padding: '8px 10px', display: 'flex', cursor: 'pointer' }} title="AI Diagnosis">
                        <Camera size={17} />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => diagnoseImage(e.target.files[0])} />
                    </label>
                    <button onClick={() => setShowQR(true)} className="btn-ghost" style={{ color: 'var(--mist)', padding: '8px 10px', display: 'flex' }} title="Generate QR Label">
                        <QrCode size={17} />
                    </button>
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
                                <button onClick={consultAI} className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--gold)', border: '1px solid rgba(245,158,11,0.2)', cursor: 'pointer' }}>
                                    <Sparkles size={11} style={{ marginRight: 4 }} /> AI Botanist
                                </button>
                            </div>

                            {/* Vitality Trend */}
                            <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: 'var(--mist)', opacity: 0.6, letterSpacing: '0.1em' }}>VITALITY TREND</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--jade)' }}>
                                        {updates.length > 0 ? (updates[0].healthStatus === 'excellent' ? 'Peak Performance' : 'Stable') : 'Establishing...'}
                                    </span>
                                </div>
                                <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: updates.length > 0 ? '85%' : '20%' }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        style={{ 
                                            height: '100%', 
                                            background: 'linear-gradient(90deg, var(--emerald), var(--jade))',
                                            boxShadow: '0 0 10px rgba(34,197,94,0.3)'
                                        }} 
                                    />
                                </div>
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
                                    <p style={{ fontSize: 13, color: 'rgba(240,253,244,0.55)', lineHeight: 1.75, marginBottom: 12 }}>
                                        {u.observations}
                                    </p>
                                )}

                                {u.drivePhotos && u.drivePhotos.length > 0 && (
                                    <div className="photo-grid" style={{ marginBottom: 14 }}>
                                        {u.drivePhotos.map((photo, idx) => (
                                            <motion.div 
                                                key={idx}
                                                whileHover={{ scale: 1.02 }}
                                                style={{ height: 120, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}
                                            >
                                                <img 
                                                    src={photo.displayUrl} 
                                                    alt={photo.originalFilename} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
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
