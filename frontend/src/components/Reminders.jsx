import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, Plus, AlertCircle, Droplets, Leaf, Thermometer, X, ArrowLeft, Bell } from 'lucide-react';
import { remindersAPI, plantsAPI } from '../api';

const PRIORITY_STYLES = {
    High: { color: '#fb7185', border: 'rgba(251,113,133,0.25)', bg: 'rgba(251,113,133,0.07)' },
    Medium: { color: '#fbbf24', border: 'rgba(251,191,36,0.25)', bg: 'rgba(251,191,36,0.07)' },
    Low: { color: '#34d399', border: 'rgba(52,211,153,0.25)', bg: 'rgba(52,211,153,0.07)' },
};

const NAV_STYLE = {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: 64,
    background: 'rgba(10,15,13,0.92)',
    backdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 1px 0 rgba(34,197,94,0.06)',
};

const getTaskIcon = (name = '') => {
    const task = name.toLowerCase();
    if (task.includes('water')) return <Droplets size={20} />;
    if (task.includes('fertilize') || task.includes('feed')) return <Leaf size={20} />;
    if (task.includes('temp') || task.includes('heat')) return <Thermometer size={20} />;
    return <Clock size={20} />;
};

const isOverdue = (dueDate) => new Date(dueDate) < new Date();

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [plants, setPlants] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [newReminder, setNewReminder] = useState({
        plantId: '', taskName: 'Watering', dueDate: '', priority: 'Medium', frequency: 'Once'
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [remRes, plantRes] = await Promise.all([
                remindersAPI.getAll(),
                plantsAPI.getAll(),
            ]);
            setReminders(remRes.data.reminders || []);
            setPlants(plantRes.data.plants || []);
        } catch (err) {
            console.error('Failed to fetch reminders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');
        try {
            await remindersAPI.create(newReminder);
            setShowModal(false);
            setNewReminder({ plantId: '', taskName: 'Watering', dueDate: '', priority: 'Medium', frequency: 'Once' });
            fetchData();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to create reminder');
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = async (id) => {
        try {
            await remindersAPI.complete(id);
            setReminders(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            console.error('Failed to complete:', err);
        }
    };

    const highCount = reminders.filter(r => r.priority === 'High').length;
    const overdueCount = reminders.filter(r => isOverdue(r.dueDate)).length;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--night)', position: 'relative', zIndex: 1 }}>

            {/* Nav */}
            <nav style={NAV_STYLE}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link to="/dashboard" className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}>
                        <ArrowLeft size={17} />
                    </Link>
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--pearl)', fontSize: 20, letterSpacing: '-0.02em' }}>
                        Mission Control
                    </span>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={16} /> Set Protocol
                </button>
            </nav>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

                {/* Header */}
                <div style={{ marginBottom: 36 }}>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--pearl)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                        Care Protocols
                    </h1>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--mist)', opacity: 0.6, textTransform: 'uppercase' }}>
                        Operational tasks and growth maintenance
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 40 }}>
                    {[
                        { icon: <Bell size={18} />, label: 'Active Tasks', value: reminders.length, color: 'var(--jade)' },
                        { icon: <AlertCircle size={18} />, label: 'High Priority', value: highCount, color: '#fb7185' },
                        { icon: <Clock size={18} />, label: 'Overdue', value: overdueCount, color: '#fbbf24' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
                            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pearl)', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', color: 'rgba(240,253,244,0.35)', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Task List */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <AnimatePresence mode="popLayout">
                            {reminders.length > 0 ? reminders.map((r, idx) => {
                                const pStyle = PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.Low;
                                const overdue = isOverdue(r.dueDate);
                                return (
                                    <motion.div
                                        key={r._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -60, scale: 0.95 }}
                                        transition={{ delay: idx * 0.04, type: 'spring', stiffness: 160 }}
                                        className="card"
                                        style={{ padding: '20px 24px', borderLeft: `3px solid ${overdue ? '#fb7185' : pStyle.color}` }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                                                {/* Icon */}
                                                <div style={{
                                                    width: 46, height: 46, borderRadius: 14,
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.07)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--jade)', flexShrink: 0,
                                                }}>
                                                    {getTaskIcon(r.taskName)}
                                                </div>

                                                <div>
                                                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--pearl)', marginBottom: 4 }}>
                                                        {r.taskName}
                                                    </h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 12, color: 'rgba(240,253,244,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Leaf size={11} /> {r.plantId?.commonName || 'Unknown Plant'}
                                                        </span>
                                                        <span style={{ fontSize: 12, color: overdue ? '#fb7185' : 'rgba(240,253,244,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Clock size={11} />
                                                            {overdue ? '⚠ ' : ''}
                                                            {new Date(r.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: 100,
                                                    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                                                    color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}`,
                                                }}>
                                                    {r.priority}
                                                </span>
                                                <button
                                                    onClick={() => handleComplete(r._id)}
                                                    style={{
                                                        width: 40, height: 40, borderRadius: 12,
                                                        background: 'rgba(34,197,94,0.08)',
                                                        border: '1px solid rgba(34,197,94,0.2)',
                                                        color: 'var(--jade)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                    title="Mark as complete"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            }) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
                                    <div style={{ width: 72, height: 72, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                                        <CheckCircle2 size={32} style={{ color: 'rgba(34,197,94,0.25)' }} />
                                    </div>
                                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--pearl)', marginBottom: 8 }}>All Clear</h2>
                                    <p style={{ color: 'rgba(240,253,244,0.35)', marginBottom: 28, fontSize: 14 }}>No active protocols. All plant systems are operational.</p>
                                    <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                        <Plus size={15} /> Schedule First Task
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Add Reminder Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card"
                            style={{ maxWidth: 460, width: '100%', padding: '40px 36px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                                <div>
                                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--pearl)', marginBottom: 2 }}>Initialize Task</h2>
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--mist)', letterSpacing: '0.15em', opacity: 0.6 }}>CARE PROTOCOL</p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', padding: 4 }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAdd}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    <div>
                                        <label className="label-text">Plant Subject</label>
                                        <select className="select-field" value={newReminder.plantId}
                                            onChange={(e) => setNewReminder({ ...newReminder, plantId: e.target.value })} required>
                                            <option value="">Choose a plant...</option>
                                            {plants.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.commonName}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="label-text">Task Name</label>
                                        <input type="text" className="input-field" placeholder="e.g. Watering, Repotting, Fertilizing"
                                            value={newReminder.taskName}
                                            onChange={(e) => setNewReminder({ ...newReminder, taskName: e.target.value })} required />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div>
                                            <label className="label-text">Due Date</label>
                                            <input type="date" className="input-field"
                                                value={newReminder.dueDate}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="label-text">Priority</label>
                                            <select className="select-field" value={newReminder.priority}
                                                onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value })}>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label-text">Frequency</label>
                                        <select className="select-field" value={newReminder.frequency}
                                            onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value })}>
                                            <option value="Once">Once</option>
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Bi-weekly">Bi-weekly</option>
                                            <option value="Monthly">Monthly</option>
                                        </select>
                                    </div>

                                    {formError && (
                                        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#fca5a5', fontSize: 13 }}>
                                            ⚠️ {formError}
                                        </div>
                                    )}

                                    <button type="submit" className="btn-primary" disabled={submitting}
                                        style={{ width: '100%', padding: '16px', fontSize: 15, opacity: submitting ? 0.6 : 1 }}>
                                        {submitting ? 'Activating...' : 'Activate Protocol'}
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
