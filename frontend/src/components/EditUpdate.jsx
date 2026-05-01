import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, CheckCircle, FlaskConical, Cloud, Camera } from 'lucide-react';
import api, { updatesAPI, plantsAPI } from '../api';
import { useTranslation } from 'react-i18next';
import ImageUpload from './ImageUpload';

export default function EditUpdate() {
    const { plantId, updateId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [plant, setPlant] = useState(null);
    const [photos, setPhotos] = useState([]);

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
        environmentCondition: 'Other',
        fertilizerUsed: false,
        fertilizerName: '',
        fertilizerType: 'Other',
        dosage: '',
        applicationMethod: 'Other',
        fertilizerNotes: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [gpsText, setGpsText] = useState('📍 Auto-detect plant location');
    const [gpsCoords, setGpsCoords] = useState('TAP');
    const [capturedCoords, setCapturedCoords] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [updateRes, plantRes] = await Promise.all([
                    updatesAPI.getById(updateId),
                    plantsAPI.getById(plantId)
                ]);
                
                const data = updateRes.data.update;
                setPlant(plantRes.data.plant);
                setPhotos(data.drivePhotos || []);

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
                    environmentCondition: data.environmentCondition || 'Other',
                    fertilizerUsed: data.fertilizerUsed || false,
                    fertilizerName: data.fertilizerName || '',
                    fertilizerType: data.fertilizerType || 'Other',
                    dosage: data.dosage || '',
                    applicationMethod: data.applicationMethod || 'Other',
                    fertilizerNotes: data.fertilizerNotes || '',
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
        fetchData();
    }, [updateId, plantId]);

    const handleUploadComplete = (uploadData) => {
        setPhotos(prev => [...prev, {
            driveFileId: uploadData.driveFileId,
            displayUrl: uploadData.displayUrl,
            originalFilename: uploadData.originalFilename,
            takenAt: new Date(),
            imageType: uploadData.imageType
        }]);
    };

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

        if (photos.length > 0) {
            payload.drivePhotos = photos;
        }

        try {
            await updatesAPI.update(updateId, payload);
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
                            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', marginBottom: 14 }}>{t('care_log.entry_date')}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="label-text">{t('care_log.entry_date')} *</label>
                                    <input type="date" className="input-field" required {...f('entryDate')} />
                                </div>
                                <div>
                                    <label className="label-text">Health Status *</label>
                                    <select className="select-field" required value={String(form['healthStatus'] || 'good')} onChange={(e) => setForm({ ...form, healthStatus: e.target.value })}>
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
                            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', marginBottom: 14 }}>{t('care_log.visual_evidence') || 'Visual Progress'}</h3>
                            <ImageUpload 
                                plantId={plantId} 
                                commonName={plant?.commonName} 
                                scientificName={plant?.scientificName}
                                onUploadComplete={handleUploadComplete} 
                            />
                        </div>

                        <div>
                            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', marginBottom: 14 }}>{t('care_log.observations')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label className="label-text">{t('care_log.title')}</label>
                                    <input className="input-field" placeholder="e.g. Activity Title" {...f('title')} />
                                </div>
                                <div>
                                    <label className="label-text">{t('care_log.observations')}</label>
                                    <textarea className="textarea-field" rows={3} placeholder={t('care_log.placeholder_notes')} {...f('observations')} />
                                </div>
                            </div>
                        </div>

                        {/* Growth Stages */}
                        <div>
                            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', marginBottom: 14 }}>Growth Stages</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="label-text">Flowering Stage</label>
                                    <select className="select-field" value={String(form['floweringStage'] || '')} onChange={(e) => setForm({ ...form, floweringStage: e.target.value })}>
                                        <option value="">— Select stage —</option>
                                        <option>Germination</option>
                                        <option>Seedling</option>
                                        <option>Vegetative</option>
                                        <option>Budding</option>
                                        <option>Blooming</option>
                                        <option>Dormant</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">Fruiting Stage</label>
                                    <select className="select-field" value={String(form['fruitingStage'] || '')} onChange={(e) => setForm({ ...form, fruitingStage: e.target.value })}>
                                        <option value="">— Not applicable —</option>
                                        <option>Fruit Set</option>
                                        <option>Development</option>
                                        <option>Ripening</option>
                                        <option>Mature</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Cloud size={18} className="text-jade" />
                                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', margin: 0 }}>{t('care_log.conditions')}</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="md:col-span-2">
                                    <label className="label-text">{t('add_plant.environment_condition')}</label>
                                    <select className="select-field" value={String(form['environmentCondition'] || 'Other')} onChange={(e) => setForm({ ...form, environmentCondition: e.target.value })}>
                                        {['full_sun', 'partial_sun', 'partial_shade', 'full_shade', 'indoor_bright', 'indoor_low', 'greenhouse', 'humid', 'arid', 'coastal', 'other'].map(c => (
                                            <option key={c} value={c}>{t(`env_conditions.${c}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">Temp (°C)</label>
                                    <input type="number" step="0.1" className="input-field" {...f('temperatureCelsius')} />
                                </div>
                                <div>
                                    <label className="label-text">Moisture</label>
                                    <select className="select-field" value={String(form['soilMoisture'] || '')} onChange={(e) => setForm({ ...form, soilMoisture: e.target.value })}>
                                        <option value="">— Select —</option>
                                        <option value="dry">Dry</option>
                                        <option value="moist">Moist</option>
                                        <option value="wet">Wet</option>
                                        <option value="waterlogged">Waterlogged</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Fertilizer Section */}
                        <div style={{ padding: '20px', background: 'rgba(16,185,129,0.05)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.1)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: form.fertilizerUsed ? 20 : 0 }}>
                                <input type="checkbox" checked={form.fertilizerUsed} onChange={e => setForm({ ...form, fertilizerUsed: e.target.checked })} style={{ width: 18, height: 18 }} />
                                <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', fontWeight: 600 }}>{t('care_log.using_fertilizer')}</span>
                                <FlaskConical size={18} className="text-jade" style={{ marginLeft: 'auto' }} />
                            </label>

                            {form.fertilizerUsed && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div>
                                            <label className="label-text">{t('care_log.fert_name')}</label>
                                            <input className="input-field" {...f('fertilizerName')} />
                                        </div>
                                        <div>
                                            <label className="label-text">{t('care_log.fert_type')}</label>
                                            <select className="select-field" value={String(form['fertilizerType'] || 'Other')} onChange={(e) => setForm({ ...form, fertilizerType: e.target.value })}>
                                                {['Organic', 'Chemical', 'Bio-fertilizer', 'NPK', 'Compost', 'Liquid', 'Other'].map(v => (
                                                    <option key={v} value={v}>{t(`care_log.types.${v}`)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-text">{t('care_log.dosage')}</label>
                                            <input className="input-field" placeholder="e.g. 5ml" {...f('dosage')} />
                                        </div>
                                        <div>
                                            <label className="label-text">{t('care_log.method')}</label>
                                            <select className="select-field" value={String(form['applicationMethod'] || 'Other')} onChange={(e) => setForm({ ...form, applicationMethod: e.target.value })}>
                                                {['Soil drench', 'Foliar spray', 'Side dressing', 'Other'].map(v => (
                                                    <option key={v} value={v}>{t(`care_log.methods.${v}`)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">{t('care_log.fert_notes')}</label>
                                        <textarea className="textarea-field" rows={2} {...f('fertilizerNotes')} />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div>
                            <label className="label-text">⚠️ {t('care_log.pest_issues')}</label>
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
