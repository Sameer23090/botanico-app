import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowLeft, Plus, Trash2, TrendingUp, Edit2, QrCode, X, Download, Sparkles, BrainCircuit, Bot, Send, Settings } from 'lucide-react';
import { plantsAPI, updatesAPI, aiAPI } from '../api';
import { useTranslation } from 'react-i18next';

export default function PlantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [plant, setPlant] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Remote Feature States
    const [showQR, setShowQR] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        commonName: '',
        scientificName: '',
        plantType: '',
        location: '',
        isPublic: false
    });
    const [saving, setSaving] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [aiMessage, setAiMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    // My AI Assistant State
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [pRes, uRes] = await Promise.all([
                    plantsAPI.getById(id),
                    updatesAPI.getByPlantId(id)
                ]);
                setPlant(pRes.data.plant);
                setUpdates(uRes.data.updates);
                
                // Initialize edit form
                setEditForm({
                    commonName: pRes.data.plant.commonName,
                    scientificName: pRes.data.plant.scientificName,
                    plantType: pRes.data.plant.plantType,
                    location: pRes.data.plant.location,
                    isPublic: pRes.data.plant.isPublic
                });
            } catch (err) {
                setError('Failed to load plant data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const res = await plantsAPI.update(id, editForm);
            setPlant(res.data.plant);
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update plant: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this plant and all its data?')) return;
        try {
            await plantsAPI.delete(id);
            navigate('/dashboard');
        } catch {
            alert('Failed to delete plant.');
        }
    };

    const handleAiAsk = async (e) => {
        if (e) e.preventDefault();
        if (!aiQuestion.trim()) return;

        setAiLoading(true);
        setAiResponse('');
        try {
            const res = await aiAPI.getAdvice(id, aiQuestion);
            setAiResponse(res.data.advice);
        } catch (err) {
            setAiResponse(t('ai_assistant.error'));
        } finally {
            setAiLoading(false);
        }
    };

    const consultAI = async () => {
        setShowAI(true);
        setIsThinking(true);
        setAiMessage('');
        
        try {
            const res = await aiAPI.consult(id);
            setAiMessage(res.data.advice);
        } catch (err) {
            setAiMessage(err.response?.data?.error || "Metabolic scanning failed. Ensure the AI Service Key is properly configured.");
        } finally {
            setIsThinking(false);
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

    // ─── Vitality Algorithm (Hardened) ──────────────────────────────────────────────
    const calculateVitality = (updates) => {
        if (updates.length === 0) return {
            score: 15, label: 'Establishing...', color: '#6b7280',
            breakdown: { health: 0, activity: 0, growth: 0, care: 0 }
        };

        const healthMap = { excellent: 100, good: 80, fair: 55, poor: 25, critical: 10 };

        // 1. HEALTH SCORE (40%) — average of last 3 logs
        const last3 = updates.slice(0, 3);
        const last3WithStatus = last3.filter(u => u.healthStatus && healthMap[u.healthStatus] !== undefined);
        const healthScore = last3WithStatus.length > 0
            ? last3WithStatus.reduce((a, u) => a + healthMap[u.healthStatus], 0) / last3WithStatus.length
            : 50; 

        let trendBonus = 0;
        if (last3WithStatus.length >= 2) {
            const newest = healthMap[last3WithStatus[0].healthStatus];
            const older  = healthMap[last3WithStatus[last3WithStatus.length - 1].healthStatus];
            trendBonus = newest > older ? 5 : newest < older ? -5 : 0;
        }

        // 2. ACTIVITY SCORE (30%)
        const rawDaysSinceLast = (Date.now() - new Date(updates[0].entryDate).getTime()) / (1000 * 60 * 60 * 24);
        const daysSinceLastLog = Math.max(0, rawDaysSinceLast);
        let activityScore;
        if      (daysSinceLastLog <= 7)  activityScore = 100;
        else if (daysSinceLastLog <= 14) activityScore = 85;
        else if (daysSinceLastLog <= 30) activityScore = 65;
        else if (daysSinceLastLog <= 60) activityScore = 40;
        else                             activityScore = 20;

        // 3. GROWTH SCORE (20%)
        const logsWithHeight = updates.filter(u => u.heightCm != null && u.heightCm > 0.01);
        let growthScore = 60;
        if (logsWithHeight.length >= 2) {
            const newest = logsWithHeight[0].heightCm;
            const oldest = logsWithHeight[logsWithHeight.length - 1].heightCm;
            const growthRate = (newest - oldest) / oldest;
            if      (growthRate > 0.15)  growthScore = 100;
            else if (growthRate > 0.05)  growthScore = 85;
            else if (growthRate >= 0)    growthScore = 70;
            else if (growthRate > -0.10) growthScore = 45;
            else                         growthScore = 20;
        }

        // 4. CARE SCORE (10%)
        let careScore = 50;
        if (updates.length >= 3) {
            const window = updates.slice(0, 5);
            const caredCount = window.filter(u => u.fertilizerUsed || u.manureUsed).length;
            careScore = (caredCount / window.length) * 100;
        }

        const raw = (healthScore * 0.40) + (activityScore * 0.30) + (growthScore * 0.20) + (careScore * 0.10) + trendBonus;
        const score = Math.max(0, Math.min(100, Math.round(raw)));

        let label, color;
        if      (score >= 85) { label = 'Peak Performance'; color = '#22c55e'; }
        else if (score >= 70) { label = 'Thriving';         color = '#4ade80'; }
        else if (score >= 55) { label = 'Stable';           color = '#84cc16'; }
        else if (score >= 40) { label = 'Needs Attention';  color = '#eab308'; }
        else if (score >= 25) { label = 'Struggling';       color = '#f97316'; }
        else                  { label = 'Critical';         color = '#ef4444'; }

        return { score, label, color, breakdown: {
            health:   Math.round(healthScore),
            activity: Math.round(activityScore),
            growth:   Math.round(growthScore),
            care:     Math.round(careScore),
        }};
    };

    const vitality = calculateVitality(updates);

    const growerName = plant.growerName || JSON.parse(localStorage.getItem('user') || '{}')?.name || 'Botanico Grower';
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
                            <p style={{ color: 'rgba(240,253,244,0.4)', fontSize: 13, marginBottom: 16 }}>Scan to view this plant's full digital record on Botanico.</p>

                            <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, textAlign: 'left' }}>
                                <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--jade)', letterSpacing: '0.12em', marginBottom: 4 }}>GROWER</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--pearl)' }}>{growerName}</div>
                                <div style={{ fontSize: 11, color: 'rgba(240,253,244,0.4)', fontStyle: 'italic', marginTop: 2 }}>
                                    {plant.commonName}{plant.scientificName ? ` · ${plant.scientificName}` : ''}
                                </div>
                            </div>
                            
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
                                        SCANNING DATABASE...
                                    </motion.div>
                                    <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,0.05)', margin: '12px auto', position: 'relative', overflow: 'hidden' }}>
                                        <motion.div 
                                            animate={{ left: ['-100%', '100%'] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            style={{ position: 'absolute', top: 0, width: '40%', height: '100%', background: 'var(--jade)' }}
                                        />
                                    </div>
                                </div>
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
                    <button onClick={() => setShowQR(true)} className="btn-ghost" style={{ color: 'var(--mist)', padding: '8px 10px', display: 'flex' }} title="Generate QR Label">
                        <QrCode size={17} />
                    </button>
                    <button onClick={() => setIsEditing(true)} className="btn-ghost" style={{ color: 'var(--mist)', padding: '8px 10px', display: 'flex' }} title="Edit Plant">
                        <Settings size={17} />
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

                            {/* Vitality Trend — Real Algorithm */}
                            <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--mist)', opacity: 0.6, letterSpacing: '0.1em' }}>VITALITY SCORE</span>
                                        <div title="Authentic logic: Health (40%), Activity (30%), Growth (20%), Care Consistency (10%)" style={{ cursor: 'help', opacity: 0.4 }}>
                                            <Sparkles size={12} color="var(--jade)" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: vitality.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{vitality.score}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: vitality.color }}>{vitality.label}</span>
                                    </div>
                                </div>

                                {/* Main progress bar */}
                                <div style={{ height: 8, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${vitality.score}%` }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                        style={{
                                            height: '100%',
                                            background: vitality.score >= 55
                                                ? `linear-gradient(90deg, #16a34a, ${vitality.color})`
                                                : `linear-gradient(90deg, #b45309, ${vitality.color})`,
                                            boxShadow: `0 0 10px ${vitality.color}55`,
                                            borderRadius: 10,
                                        }}
                                    />
                                </div>

                                {/* Breakdown mini-bars */}
                                {updates.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                                        {[
                                            { key: 'health',   label: 'Health',   val: vitality.breakdown.health,   weight: '40%' },
                                            { key: 'activity', label: 'Activity', val: vitality.breakdown.activity, weight: '30%' },
                                            { key: 'growth',   label: 'Growth',   val: vitality.breakdown.growth,   weight: '20%' },
                                            { key: 'care',     label: 'Care',     val: vitality.breakdown.care,     weight: '10%' },
                                        ].map(({ key, label, val, weight }) => (
                                            <div key={key}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(240,253,244,0.35)', letterSpacing: '0.08em' }}>{label} <span style={{ opacity: 0.5 }}>({weight})</span></span>
                                                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(240,253,244,0.5)' }}>{val}</span>
                                                </div>
                                                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${val}%` }}
                                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                                        style={{
                                                            height: '100%',
                                                            background: val >= 70 ? 'var(--jade)' : val >= 45 ? '#eab308' : '#f97316',
                                                            borderRadius: 4
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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

            {/* AI Floating Toggle */}
            <button 
                onClick={() => setIsAiOpen(true)}
                style={{
                    position: 'fixed', bottom: 32, right: 32,
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--jade), var(--emerald))',
                    color: 'white', border: 'none', cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Bot size={28} />
            </button>

            {/* AI Assistant Sidebar/Modal */}
            {isAiOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
                        background: 'rgba(10,15,13,0.95)',
                        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 200, padding: 32, display: 'flex', flexDirection: 'column',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Sparkles size={20} style={{ color: 'var(--jade)' }} />
                            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--pearl)', fontSize: 22, margin: 0 }}>{t('ai_assistant.title')}</h2>
                        </div>
                        <button onClick={() => setIsAiOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <p style={{ color: 'var(--mist)', fontSize: 14, lineHeight: 1.6, marginBottom: 24, opacity: 0.7 }}>
                        {t('ai_assistant.description', { name: plant.commonName })}
                    </p>

                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {aiResponse && (
                            <div style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 16, padding: 20,
                                color: 'var(--pearl)', fontSize: 14, lineHeight: 1.7,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {aiResponse}
                            </div>
                        )}
                        {aiLoading && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, margin: '20px auto' }}>
                                <div className="spinner" />
                                <span style={{ fontSize: 12, color: 'var(--jade)', fontFamily: 'var(--font-mono)' }}>{t('ai_assistant.thinking')}</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleAiAsk} style={{ position: 'relative' }}>
                        <textarea
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            placeholder={t('ai_assistant.placeholder')}
                            style={{
                                width: '100%', minHeight: 100,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 14, padding: '16px 48px 16px 16px',
                                color: 'var(--pearl)', fontSize: 14,
                                resize: 'none', outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                        <button 
                            type="submit"
                            disabled={aiLoading}
                            style={{
                                position: 'absolute', right: 12, bottom: 12,
                                background: 'var(--jade)', color: 'white',
                                border: 'none', width: 32, height: 32,
                                borderRadius: 10, display: 'flex', 
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </motion.div>
            )}
            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="card"
                            style={{ maxWidth: 500, width: '100%', padding: '32px' }}
                        >
                            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: 'var(--pearl)', marginBottom: 24 }}>Edit Plant Details</h2>
                            
                            <div style={{ display: 'grid', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--mist)', opacity: 0.6, display: 'block', marginBottom: 6 }}>COMMON NAME</label>
                                    <input 
                                        className="input-field" 
                                        value={editForm.commonName} 
                                        onChange={e => setEditForm({...editForm, commonName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--mist)', opacity: 0.6, display: 'block', marginBottom: 6 }}>SCIENTIFIC NAME</label>
                                    <input 
                                        className="input-field" 
                                        value={editForm.scientificName} 
                                        onChange={e => setEditForm({...editForm, scientificName: e.target.value})}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--mist)', opacity: 0.6, display: 'block', marginBottom: 6 }}>PLANT TYPE</label>
                                        <input 
                                            className="input-field" 
                                            value={editForm.plantType} 
                                            onChange={e => setEditForm({...editForm, plantType: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--mist)', opacity: 0.6, display: 'block', marginBottom: 6 }}>LOCATION</label>
                                        <input 
                                            className="input-field" 
                                            value={editForm.location} 
                                            onChange={e => setEditForm({...editForm, location: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                                <button 
                                    onClick={() => setIsEditing(false)} 
                                    className="btn-ghost" 
                                    style={{ flex: 1 }}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveEdit} 
                                    className="btn-primary" 
                                    style={{ flex: 2 }}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
