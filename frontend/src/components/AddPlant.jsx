import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft } from 'lucide-react';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
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
        <div style={{ minHeight: '100vh', background: 'var(--soil)' }}>
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 32px', height: 64, background: 'rgba(28,16,6,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12 }}>
                <Link to="/dashboard" className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}><ArrowLeft size={18} /></Link>
                <Leaf size={18} style={{ color: 'var(--sprout)' }} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--cream)', fontSize: 16 }}>Add New Plant</span>
            </nav>

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '36px 40px' }}>
                    {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>{error}</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div>
                            <h2 className="form-section-title">🌿 Basic Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-text">Common Name *</label>
                                    <input className="input-field" placeholder="e.g. Tomato" required {...f('commonName')} />
                                </div>
                                <div>
                                    <label className="label-scientific">Scientific Name</label>
                                    <input className="input-field" placeholder="e.g. Solanum lycopersicum" {...f('scientificName')} />
                                </div>
                                <div>
                                    <label className="label-text">Family</label>
                                    <input className="input-field" placeholder="e.g. Solanaceae" {...f('family')} />
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
                            <h2 className="form-section-title">🌱 Growing Conditions</h2>
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



                        <div style={{ display: 'flex', gap: 16 }}>
                            <Link to="/dashboard" className="btn-secondary" style={{ flex: 1, textAlign: 'center', borderRadius: 50, padding: '13px' }}>Cancel</Link>
                            <button type="submit" className="btn-primary" style={{ flex: 1, borderRadius: 50 }} disabled={loading}>
                                {loading ? 'Adding Plant...' : '🌱 Add Plant'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
