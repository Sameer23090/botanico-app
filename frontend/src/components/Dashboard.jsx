import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogOut, TrendingUp, Leaf, Sprout, Calendar, Bell, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { plantsAPI, remindersAPI, achievementAPI } from '../api';

const DARK_NAV = {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 40px', height: 64,
    background: 'rgba(10,15,13,0.92)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 1px 0 rgba(34,197,94,0.06)',
};

export default function Dashboard({ user, onLogout }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [reminders, setReminders] = useState([]);
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [plantRes, remRes, achRes] = await Promise.all([
                    plantsAPI.getAll().catch(() => ({ data: { plants: [] } })),
                    remindersAPI.getAll().catch(() => ({ data: { reminders: [] } })),
                    achievementAPI.getUnlocked().catch(() => ({ data: { achievements: [] } }))
                ]);
                
                const plantsData = plantRes?.data?.plants || [];
                const remindersData = remRes?.data?.reminders || [];
                const achievementsData = achRes?.data?.achievements || [];

                setPlants(plantsData);
                setReminders(remindersData);
                setAchievements(achievementsData);

                // Auto-unlock logic for new users
                if (achievementsData.length === 0 && plantsData.length > 0) {
                    try {
                        await achievementAPI.unlock({
                            title: 'First Contact',
                            description: 'Established the first digital link with a botanical subject.',
                            category: 'Consistency',
                            rarity: 'Common',
                            points: 50,
                            icon: 'ShieldCheck'
                        });
                        const newAchRes = await achievementAPI.getUnlocked();
                        setAchievements(newAchRes?.data?.achievements || []);
                    } catch (e) {
                        console.warn('Achievement unlock failed', e);
                    }
                }
            } catch (err) {
                console.error('Dashboard load error', err);
                setError(t('dashboard.failed_load') || 'Critical system error detected.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [t]);

    const filteredPlants = (plants || []).filter(p => {
        const name = p.commonName || '';
        const scientific = p.scientificName || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             scientific.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleLogout = () => { onLogout(); navigate('/'); };

    const STATS = [
        { icon: <Sprout size={20} />, label: t('dashboard.total_plants') || 'Total Plants', value: (plants || []).length },
        { icon: <TrendingUp size={20} />, label: t('dashboard.active') || 'Active', value: (plants || []).filter(p => p.status === 'active').length },
        { icon: <Calendar size={20} />, label: t('dashboard.days_growing') || 'Days Growing', value: (plants || []).length > 0 ? Math.max(...(plants || []).map(p => p.daysSincePlanting || 0)) : 0 },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--night)', position: 'relative', zIndex: 1 }}>

            {/* Nav */}
            <nav className="mobile-nav" style={DARK_NAV}>
                <div style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22, fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--pearl) 0%, var(--sage) 60%, var(--gold) 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                }}>{t('app_title') || 'Botanico'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span style={{ fontSize: 13, color: 'rgba(240,253,244,0.45)', fontFamily: "var(--font-body)", fontWeight: 400 }}>
                        {user?.name || t('dashboard.botanists') || 'Botanist'} 👋
                    </span>
                    <Link to="/marketplace" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gold)' }}>
                        <ShoppingBag size={14} /> Marketplace
                    </Link>
                    <Link to="/reminders" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--jade)' }}>
                        <Bell size={14} /> Reminders
                        {(reminders || []).length > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />}
                    </Link>
                    <button onClick={handleLogout} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <LogOut size={14} /> {t('navigation.logout') || 'Logout'}
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
                        }}>{t('dashboard.title') || 'Command Center'}</h1>
                        <p style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: '0.16em',
                            color: 'var(--mist)',
                            textTransform: 'uppercase',
                            opacity: 0.7,
                        }}>{t('dashboard.tracked_count', { count: (plants || []).length }) || `${(plants || []).length} Specimens Logged`}</p>
                    </div>
                    <Link to="/add-plant" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Plus size={15} /> {t('dashboard.add_plant') || 'Add Specimen'}
                    </Link>
                </div>

                {/* Stats */}
                <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 44 }}>
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

                {/* Mission Briefing & Achievements */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 44 }}>
                    {/* Mission Briefing */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 24, padding: 24 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Bell size={18} style={{ color: 'var(--jade)' }} />
                                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, color: 'var(--pearl)' }}>Mission Briefing</h2>
                            </div>
                            <Link to="/reminders" style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: 'var(--jade)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>View All</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {(reminders || []).length > 0 ? reminders.slice(0, 3).map((r, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.priority === 'High' ? 'var(--gold)' : 'var(--jade)' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--pearl)' }}>{r.taskName}</div>
                                        <div style={{ fontSize: 11, color: 'var(--mist)', opacity: 0.6 }}>{r.plantId?.commonName} • {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '20px 0', opacity: 0.4, fontSize: 13 }}>No critical tasks scheduled.</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Achievements */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        style={{ background: 'rgba(255,215,0,0.02)', border: '1px solid rgba(255,215,0,0.1)', borderRadius: 24, padding: 24 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <ShieldCheck size={18} style={{ color: 'var(--gold)' }} />
                            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, color: 'var(--pearl)' }}>Milestones</h2>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {(achievements || []).length > 0 ? achievements.map((a, i) => (
                                <div key={i} title={a.description} style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                                    <ShieldCheck size={20} />
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '20px 0', opacity: 0.4, fontSize: 13, width: '100%' }}>Complete tasks to unlock milestones.</div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 24 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Search & Filter */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
                    <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder={t('dashboard.search_placeholder') || 'Search your botanical collection...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 44 }}
                        />
                        <Leaf size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: 'var(--jade)' }} />
                    </div>
                    <select 
                        className="select-field" 
                        style={{ width: 'auto', minWidth: 160 }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="dormant">Dormant</option>
                        <option value="harvested">Harvested</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {/* Plants Grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>
                ) : filteredPlants.length === 0 ? (
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
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 30, color: 'var(--pearl)', marginBottom: 8 }}>{searchTerm || statusFilter !== 'all' ? 'No results found' : (t('dashboard.no_plants') || 'No specimens tracked yet.')}</h2>
                        <p style={{ color: 'rgba(240,253,244,0.35)', marginBottom: 28, fontSize: 14 }}>{searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : (t('dashboard.start_journey') || 'Start your scientific journey today.')}</p>
                        {!(searchTerm || statusFilter !== 'all') && (
                            <Link to="/add-plant" className="btn-primary">
                                <Plus size={15} style={{ marginRight: 8 }} /> {t('dashboard.add_first_plant') || 'Initialize First Specimen'}
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 18 }}>
                        {filteredPlants.map((plant, i) => (
                            <motion.div
                                key={plant.id || i}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06, type: 'spring', stiffness: 140 }}
                            >
                                <Link to={`/plant/${plant.id}`} className="card-botanical" style={{ display: 'block', textDecoration: 'none' }}>
                                    {/* Image Preview */}
                                    <div style={{ height: 160, width: '100%', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                                        {plant.firstPhotoUrl ? (
                                            <img 
                                                src={plant.firstPhotoUrl} 
                                                alt={plant.commonName} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                                className="hover-scale"
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.15 }}>
                                                <Leaf size={48} />
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                                            <span className="badge badge-success" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                                                Day {plant.daysSincePlanting || 0}
                                            </span>
                                        </div>
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
                                        }}>{t(`plants.${(plant.commonName || '').split(' (')[0]}`, plant.commonName)}</h3>
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
                                            {plant.plantType && <span className="badge badge-info">{plant.plantType}</span>}
                                            <span className="badge badge-success">{t(`status.${plant.status}`, plant.status)}</span>
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
