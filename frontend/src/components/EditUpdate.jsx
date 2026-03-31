import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, CheckCircle } from 'lucide-react';
import api, { updatesAPI } from '../api';

export default function EditUpdate() {
    const { plantId, updateId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        entryDate: '',
        title: '',
        observations: '',
        healthStatus: 'good',
        floweringStage: '',
        fruitingStage: '',
        temperatureCelsius: '',
        soilMoisture: '',
        pestIssues: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [gpsText, setGpsText] = useState('📍 Auto-detect plant location');
    const [gpsCoords, setGpsCoords] = useState('TAP');
    const [capturedCoords, setCapturedCoords] = useState(null);

    useEffect(() => {
        const fetchUpdate = async () => {
            try {
                const res = await updatesAPI.getById(updateId);
                const data = res.data.update;
                setForm({
                    entryDate: data.entryDate ? data.entryDate.split('T')[0] : '',
                    title: data.title || '',
                    observations: data.observations || '',
                    healthStatus: data.healthStatus || 'good',
                    floweringStage: data.floweringStage || '',
                    fruitingStage: data.fruitingStage || '',
                    temperatureCelsius: data.temperatureCelsius || '',
                    soilMoisture: data.soilMoisture || '',
                    pestIssues: data.pestIssues || '',
                });
                if (data.coordinates) {
                    setCapturedCoords(data.coordinates);
                    setGpsCoords(`${data.coordinates.lat?.toFixed(6)}, ${data.coordinates.lng?.toFixed(6)}`);
                    setGpsText('Location captured');
                }
            } catch (err) {
                setError('Failed to load log entry.');
            } finally {
                setLoading(false);
            }
        };
        fetchUpdate();
    }, [updateId]);

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
            return;
        }
        setSaving(true);
        setError('');

        const payload = { ...form };
        if (capturedCoords) {
            payload.coordinates = capturedCoords;
        }

        try {
            const formData = new FormData();
            Object.entries(payload).forEach(([k, v]) => {
                if (typeof v === 'object' && v !== null) {
                    Object.entries(v).forEach(([subK, subV]) => {
                        formData.append(`${k}[${subK}]`, subV);
                    });
                } else if (v !== '' && v !== null) {
                    formData.append(k, v);
                }
            });

            await updatesAPI.update(updateId, formData);
            navigate(`/plant/${plantId}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update entry.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--soil)' }}>
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 32px', height: 64, background: 'rgba(28,16,6,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12 }}>
                <Link to={`/plant/${plantId}`} className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}><ArrowLeft size={18} /></Link>
                <Leaf size={18} style={{ color: 'var(--sprout)' }} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--cream)', fontSize: 16 }}>Edit Log Entry</span>
            </nav>

            <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '36px 40px' }}>

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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

                        <div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--cream)', marginBottom: 14 }}>Observations</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label className="label-text">Entry Title</label>
                                    <input className="input-field" placeholder="e.g. First blooms appeared!" {...f('title')} />
                                </div>
                                <div>
                                    <label className="label-text">What did you observe?</label>
                                    <textarea className="textarea-field" rows={4} placeholder="Describe the plant's current state..." {...f('observations')} />
                                </div>
                            </div>
                        </div>

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

                        <div>
                            <label className="label-text">⚠️ Pest / Disease Notes (optional)</label>
                            <textarea className="textarea-field" rows={2} placeholder="Any bugs, yellowing, wilting?" {...f('pestIssues')} />
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
                            <span style={{ fontSize: 13, color: capturedCoords ? 'var(--jade)' : '#fca5a5', fontWeight: 600 }}>{capturedCoords ? '✓ Location Captured' : '📍 TAP TO CAPTURE CURRENT LOCATION (REQUIRED)'}</span>
                            <small style={{ marginLeft: 'auto', fontFamily: "var(--font-mono)", fontSize: 10, color: capturedCoords ? 'var(--jade)' : '#ef4444' }}>{gpsCoords}</small>
                        </div>

                        <div style={{ display: 'flex', gap: 14 }}>
                            <Link to={`/plant/${plantId}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', borderRadius: 50, padding: '13px' }}>Cancel</Link>
                            <button type="submit" className="btn-primary" style={{ flex: 2, borderRadius: 50 }} disabled={saving}>
                                {saving ? 'Saving...' : <><CheckCircle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Update Log Entry</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
