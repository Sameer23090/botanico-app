import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { plantsAPI } from '../api';

export default function AddPlant() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        commonName: '', scientificName: '', family: '', genus: '', species: '',
        variety: '', plantType: '', growthHabit: '', nativeRegion: '',
        description: '', plantingDate: new Date().toISOString().split('T')[0],
        location: '', soilType: '', sunlightExposure: '', plantingMethod: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gpsText, setGpsText] = useState('📍 Auto-detect plant location');
    const [gpsCoords, setGpsCoords] = useState('TAP');
    const [capturedCoords, setCapturedCoords] = useState(null);

    const captureGPS = () => {
        setGpsText('Locating...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const lat = pos.coords.latitude.toFixed(6);
                    const lng = pos.coords.longitude.toFixed(6);
                    setGpsText('Location captured');
                    setGpsCoords(`${lat}, ${lng}`);
                    setCapturedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    setGpsText('Location failed');
                    setGpsCoords('ERR');
                }
            );
        } else {
            setGpsText('Not supported');
            setGpsCoords('ERR');
        }
    };

    const plantPresets = {
        '': { scientific: '', family: '', type: '', habit: '' },
        'Mango': { scientific: 'Mangifera indica', family: 'Anacardiaceae', type: 'Fruit', habit: 'Tree' },
        'Lemon': { scientific: 'Citrus limon', family: 'Rutaceae', type: 'Fruit', habit: 'Tree' },
        'Jamun': { scientific: 'Syzygium cumini', family: 'Myrtaceae', type: 'Fruit', habit: 'Tree' },
        'Neem': { scientific: 'Azadirachta indica', family: 'Meliaceae', type: 'Tree', habit: 'Tree' },
        'Jack fruit': { scientific: 'Artocarpus heterophyllus', family: 'Moraceae', type: 'Fruit', habit: 'Tree' },
        'Pine apple': { scientific: 'Ananas comosus', family: 'Bromeliaceae', type: 'Fruit', habit: 'Perennial' },
        'Pappaya': { scientific: 'Carica papaya', family: 'Caricaceae', type: 'Fruit', habit: 'Tree' }
    };

    const handlePresetChange = (e) => {
        const val = e.target.value;
        setForm({
            ...form,
            commonName: val,
            scientificName: plantPresets[val]?.scientific || '',
            family: plantPresets[val]?.family || '',
            plantType: plantPresets[val]?.type || '',
            growthHabit: plantPresets[val]?.habit || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
        if (capturedCoords) {
            formData.append('coordinates[lat]', capturedCoords.lat);
            formData.append('coordinates[lng]', capturedCoords.lng);
        }
        try {
            const res = await plantsAPI.create(formData);
            const plantId = res.data.plant?.id || res.data.plant?._id || res.data.id;
            navigate(`/plant/${plantId}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add plant.');
        } finally {
            setLoading(false);
        }
    };

    const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--night)' }}>
            <nav style={{ 
                position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', 
                padding: '0 32px', height: 64, background: 'rgba(10,15,13,0.92)', 
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', 
                borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12 
            }}>
                <Link to="/dashboard" className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}>
                    <ArrowLeft size={18} />
                </Link>
                <span style={{ 
                    fontFamily: "var(--font-serif)", fontWeight: 700, 
                    color: 'var(--pearl)', fontSize: 17, letterSpacing: '-0.01em' 
                }}>
                    Add New Plant
                </span>
            </nav>

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 140 }} className="card" style={{ padding: '36px 40px' }}>
                    {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>{error}</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div>
                            <h2 style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: 20, fontWeight: 700,
                                color: 'var(--pearl)',
                                marginBottom: 16,
                                letterSpacing: '-0.01em',
                            }}>Basic Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-text">Common Name *</label>
                                    <select className="select-field" required value={form.commonName} onChange={handlePresetChange}>
                                        <option value="">Select a plant</option>
                                        {Object.keys(plantPresets).filter(k=>k).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text" style={{ fontStyle: 'normal' }}>Scientific Name</label>
                                    <select className="select-field" value={form.scientificName} onChange={e => setForm({...form, scientificName: e.target.value})}>
                                        <option value="">Select</option>
                                        {Object.values(plantPresets).filter(v=>v.scientific).map(v => <option key={v.scientific} value={v.scientific}>{v.scientific}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">Family</label>
                                    <select className="select-field" value={form.family} onChange={e => setForm({...form, family: e.target.value})}>
                                        <option value="">Select</option>
                                        {Object.values(plantPresets).filter(v=>v.family).map(v => <option key={v.family} value={v.family}>{v.family}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">Plant Type</label>
                                    <select className="select-field" {...f('plantType')}>
                                        <option value="">Select type</option>
                                        {['Vegetable', 'Fruit', 'Herb', 'Flower', 'Shrub', 'Tree', 'Succulent', 'Fern', 'Grass', 'Other'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">Planting Date *</label>
                                    <input type="date" className="input-field" required {...f('plantingDate')} />
                                </div>
                                <div>
                                    <label className="label-text">Growth Habit</label>
                                    <select className="select-field" {...f('growthHabit')}>
                                        <option value="">Select habit</option>
                                        {['Annual', 'Perennial', 'Biennial', 'Vine', 'Climbing', 'Spreading'].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: 20, fontWeight: 700,
                                color: 'var(--pearl)',
                                marginBottom: 16,
                                letterSpacing: '-0.01em',
                            }}>Growing Conditions</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-text">Location</label>
                                    <input className="input-field" placeholder="e.g. Backyard garden" {...f('location')} />
                                </div>
                                <div>
                                    <label className="label-text">Soil Type</label>
                                    <select className="select-field" {...f('soilType')}>
                                        <option value="">Select soil</option>
                                        {['Loamy', 'Sandy', 'Clay', 'Silt', 'Peat', 'Chalky', 'Mixed'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">Sunlight Exposure</label>
                                    <select className="select-field" {...f('sunlightExposure')}>
                                        <option value="">Select exposure</option>
                                        {['Full Sun', 'Partial Sun', 'Partial Shade', 'Full Shade'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div>
                            <label className="label-text">Description / Notes</label>
                            <textarea className="textarea-field" rows={3} placeholder="Describe your plant..." {...f('description')} />
                        </div>

                        {/* GPS badge */}
                        <div onClick={captureGPS} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px',
                            background: 'rgba(34,197,94,0.06)',
                            border: '1px solid rgba(34,197,94,0.15)',
                            borderRadius: 12,
                            cursor: 'pointer', transition: 'all 0.3s',
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--jade)', boxShadow: '0 0 8px var(--jade)' }} />
                            <span style={{ fontSize: 13, color: 'var(--jade)', fontWeight: 500 }}>{gpsText}</span>
                            <small style={{ marginLeft: 'auto', fontFamily: "var(--font-mono)", fontSize: 10, color: 'rgba(34,197,94,0.5)' }}>{gpsCoords}</small>
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <Link to="/dashboard" className="btn-secondary" style={{ flex: 1, textAlign: 'center', borderRadius: 50, padding: '13px' }}>Cancel</Link>
                            <button type="submit" className="btn-primary" style={{ flex: 1, borderRadius: 50 }} disabled={loading}>
                                {loading ? 'Adding Plant...' : 'Add Plant'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
