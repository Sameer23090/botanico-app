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
        'Amla (Indian Gooseberry)': { scientific: 'Phyllanthus emblica', family: 'Phyllanthaceae', type: 'Fruit', habit: 'Tree' },
        'Ashoka Tree': { scientific: 'Saraca asoca', family: 'Fabaceae', type: 'Tree', habit: 'Tree' },
        'Banyan Tree (Vat)': { scientific: 'Ficus benghalensis', family: 'Moraceae', type: 'Tree', habit: 'Tree' },
        'Curry Leaf': { scientific: 'Murraya koenigii', family: 'Rutaceae', type: 'Herb', habit: 'Shrub' },
        'Guava': { scientific: 'Psidium guajava', family: 'Myrtaceae', type: 'Fruit', habit: 'Tree' },
        'Hibiscus (Gudhal)': { scientific: 'Hibiscus rosa-sinensis', family: 'Malvaceae', type: 'Flower', habit: 'Shrub' },
        'Jack fruit': { scientific: 'Artocarpus heterophyllus', family: 'Moraceae', type: 'Fruit', habit: 'Tree' },
        'Jamun': { scientific: 'Syzygium cumini', family: 'Myrtaceae', type: 'Fruit', habit: 'Tree' },
        'Jasmine (Mogra)': { scientific: 'Jasminum sambac', family: 'Oleaceae', type: 'Flower', habit: 'Shrub' },
        'Lemon': { scientific: 'Citrus limon', family: 'Rutaceae', type: 'Fruit', habit: 'Tree' },
        'Mango': { scientific: 'Mangifera indica', family: 'Anacardiaceae', type: 'Fruit', habit: 'Tree' },
        'Marigold (Genda)': { scientific: 'Tagetes erecta', family: 'Asteraceae', type: 'Flower', habit: 'Annual' },
        'Moringa (Drumstick)': { scientific: 'Moringa oleifera', family: 'Moringaceae', type: 'Vegetable', habit: 'Tree' },
        'Neem': { scientific: 'Azadirachta indica', family: 'Meliaceae', type: 'Tree', habit: 'Tree' },
        'Pappaya': { scientific: 'Carica papaya', family: 'Caricaceae', type: 'Fruit', habit: 'Tree' },
        'Peepal Tree': { scientific: 'Ficus religiosa', family: 'Moraceae', type: 'Tree', habit: 'Tree' },
        'Pine apple': { scientific: 'Ananas comosus', family: 'Bromeliaceae', type: 'Fruit', habit: 'Perennial' },
        'Pomegranate': { scientific: 'Punica granatum', family: 'Lythraceae', type: 'Fruit', habit: 'Shrub' },
        'Tulsi (Holy Basil)': { scientific: 'Ocimum tenuiflorum', family: 'Lamiaceae', type: 'Herb', habit: 'Shrub' }
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
        if (!capturedCoords) {
            setError('Please capture the plant location (GPS) first.');
            setLoading(false);
            return;
        }
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
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <select className="select-field" style={{ marginBottom: 0 }} value={Object.keys(plantPresets).includes(form.commonName) ? form.commonName : "CUSTOM"} onChange={handlePresetChange}>
                                            <option value="">Select a plant</option>
                                            {Object.keys(plantPresets).filter(k=>k).map(k => <option key={k} value={k}>{k}</option>)}
                                            <option value="CUSTOM">-- Other (Type below) --</option>
                                        </select>
                                        {(!Object.keys(plantPresets).includes(form.commonName) || form.commonName === "CUSTOM") && (
                                            <input className="input-field" placeholder="Enter plant name" required value={form.commonName === "CUSTOM" ? "" : form.commonName} onChange={e => setForm({...form, commonName: e.target.value})} />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="label-text" style={{ fontStyle: 'normal' }}>Scientific Name</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <select className="select-field" style={{ marginBottom: 0 }} value={Object.values(plantPresets).some(v=>v.scientific === form.scientificName) ? form.scientificName : "CUSTOM"} onChange={e => setForm({...form, scientificName: e.target.value})}>
                                            <option value="">Select</option>
                                            {[...new Set(Object.values(plantPresets).map(v=>v.scientific).filter(Boolean))].sort().map(s => <option key={s} value={s}>{s}</option>)}
                                            <option value="CUSTOM">-- Other (Type below) --</option>
                                        </select>
                                        {(!Object.values(plantPresets).some(v=>v.scientific === form.scientificName) || form.scientificName === "CUSTOM") && (
                                            <input className="input-field" placeholder="Enter scientific name" value={form.scientificName === "CUSTOM" ? "" : form.scientificName} onChange={e => setForm({...form, scientificName: e.target.value})} />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="label-text">Family</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <select className="select-field" style={{ marginBottom: 0 }} value={Object.values(plantPresets).some(v=>v.family === form.family) ? form.family : "CUSTOM"} onChange={e => setForm({...form, family: e.target.value})}>
                                            <option value="">Select</option>
                                            {[...new Set(Object.values(plantPresets).map(v=>v.family).filter(Boolean))].sort().map(f => <option key={f} value={f}>{f}</option>)}
                                            <option value="CUSTOM">-- Other (Type below) --</option>
                                        </select>
                                        {(!Object.values(plantPresets).some(v=>v.family === form.family) || form.family === "CUSTOM") && (
                                            <input className="input-field" placeholder="Enter family" value={form.family === "CUSTOM" ? "" : form.family} onChange={e => setForm({...form, family: e.target.value})} />
                                        )}
                                    </div>
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

                        <div onClick={captureGPS} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px',
                            background: capturedCoords ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.06)',
                            border: capturedCoords ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 12,
                            cursor: 'pointer', transition: 'all 0.3s',
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: capturedCoords ? 'var(--jade)' : '#ef4444', boxShadow: capturedCoords ? '0 0 8px var(--jade)' : '0 0 8px #ef4444' }} />
                            <span style={{ fontSize: 13, color: capturedCoords ? 'var(--jade)' : '#fca5a5', fontWeight: 600 }}>{capturedCoords ? '✓ Location Captured' : '📍 TAP TO CAPTURE LOCATION (REQUIRED)'}</span>
                            <small style={{ marginLeft: 'auto', fontFamily: "var(--font-mono)", fontSize: 10, color: capturedCoords ? 'var(--jade)' : '#ef4444' }}>{gpsCoords}</small>
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
