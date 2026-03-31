import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api';

export default function AddUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        entryDate: new Date().toISOString().split('T')[0],
        title: '',
        observations: '',
        healthStatus: 'good',
        floweringStage: '',
        fruitingStage: '',
        temperatureCelsius: '',
        soilMoisture: '',
        pestIssues: '',
        notes: '',
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

    const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!capturedCoords) {
            setError('Please capture the current location (GPS) first.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');

        // Send only non-empty fields as JSON
        const payload = { plantId: id };
        Object.entries(form).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) payload[k] = v;
        });
        if (capturedCoords) {
            payload.coordinates = capturedCoords;
        }
        try {
            await api.post('/updates', payload);
            navigate(`/plant/${id}`);
        } catch (err) {
            const msg = err.response?.data?.error
                || err.response?.data?.errors?.[0]?.msg
                || 'Failed to save entry.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--soil)' }}>
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 32px', height: 64, background: 'rgba(28,16,6,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12 }}>
                <Link to={`/plant/${id}`} className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}><ArrowLeft size={18} /></Link>
                <Leaf size={18} style={{ color: 'var(--sprout)' }} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--cream)', fontSize: 16 }}>Log Entry</span>
            </nav>

            <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '36px 40px' }}>

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Date & Health — required */}
                        <div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--cream)', marginBottom: 14 }}>When & How</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="label-text">Entry Date *</label>
                                    <input type="date" className="input-field" required {...f('entryDate')} />
                                </div>
                                <div>
                                    <label className="label-text">Health Status *</label>
                                    <select className="select-field" required {...f('healthStatus')}>
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Title & Observations */}
                        <div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--cream)', marginBottom: 14 }}>Observations</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label className="label-text">Entry Title</label>
                                    <input className="input-field" placeholder="e.g. First blooms appeared!" {...f('title')} />
                                </div>
                                <div>
                                    <label className="label-text">What did you observe?</label>
                                    <textarea className="textarea-field" rows={4} placeholder="Describe the plant's current state, changes noticed, anything interesting..." {...f('observations')} />
                                </div>
                            </div>
                        </div>

                        {/* Growth Stage */}
                        <div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--cream)', marginBottom: 14 }}>Growth Stage</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="label-text">Plant Stage</label>
                                    <select className="select-field" {...f('floweringStage')}>
                                        <option value="">— Select stage —</option>
                                        <optgroup label="Early Growth">
                                            <option>Germination</option>
                                            <option>Seedling</option>
                                            <option>Rooting / Establishing</option>
                                        </optgroup>
                                        <optgroup label="Vegetative">
                                            <option>Vegetative</option>
                                            <option>Leaf-only Growth</option>
                                            <option>Dormant</option>
                                        </optgroup>
                                        <optgroup label="Reproductive">
                                            <option>Budding</option>
                                            <option>Blooming</option>
                                            <option>Pollinating</option>
                                            <option>Senescent / Wilting</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">Fruiting Stage</label>
                                    <select className="select-field" {...f('fruitingStage')}>
                                        <option value="">— Not applicable —</option>
                                        <option>Fruit Set</option>
                                        <option>Development</option>
                                        <option>Ripening</option>
                                        <option>Mature / Harvest Ready</option>
                                        <option>Post-Harvest</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Environment */}
                        <div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--cream)', marginBottom: 14 }}>Environment</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="label-text">Temperature (°C)</label>
                                    <input type="number" step="0.1" className="input-field" placeholder="e.g. 25.0" {...f('temperatureCelsius')} />
                                </div>
                                <div>
                                    <label className="label-text">Soil Moisture</label>
                                    <select className="select-field" {...f('soilMoisture')}>
                                        <option value="">— Select —</option>
                                        <option value="dry">Dry</option>
                                        <option value="moist">Moist</option>
                                        <option value="wet">Wet</option>
                                        <option value="waterlogged">Waterlogged</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Issues */}
                        <div>
                            <label className="label-text">⚠️ Pest / Disease Notes (optional)</label>
                            <textarea className="textarea-field" rows={2} placeholder="Any bugs, yellowing, wilting, disease signs?" {...f('pestIssues')} />
                        </div>

                        {/* GPS badge */}
                        <div onClick={captureGPS} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px',
                            background: capturedCoords ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.06)',
                            border: capturedCoords ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 12,
                            cursor: 'pointer', transition: 'all 0.3s',
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: capturedCoords ? 'var(--jade)' : '#ef4444', boxShadow: capturedCoords ? '0 0 8px var(--jade)' : '0 0 8px #ef4444' }} />
                            <span style={{ fontSize: 13, color: capturedCoords ? 'var(--jade)' : '#fca5a5', fontWeight: 600 }}>{capturedCoords ? '✓ Location Captured' : '📍 TAP TO CAPTURE CURRENT LOCATION (REQUIRED)'}</span>
                            <small style={{ marginLeft: 'auto', fontFamily: "var(--font-mono)", fontSize: 10, color: capturedCoords ? 'var(--jade)' : '#ef4444' }}>{gpsCoords}</small>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 14 }}>
                            <Link to={`/plant/${id}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', borderRadius: 50, padding: '13px' }}>Cancel</Link>
                            <button type="submit" className="btn-primary" style={{ flex: 2, borderRadius: 50 }} disabled={loading}>
                                {loading ? 'Saving...' : <><CheckCircle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Save Log Entry</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
