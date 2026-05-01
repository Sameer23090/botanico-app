import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, CheckCircle, FlaskConical, Cloud, Camera } from 'lucide-react';
import api, { plantsAPI } from '../api';
import { useTranslation } from 'react-i18next';
import ImageUpload from './ImageUpload';

export default function AddUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [plant, setPlant] = useState(null);
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPlant();
    }, [id]);

    const fetchPlant = async () => {
        try {
            const res = await plantsAPI.getById(id);
            setPlant(res.data.plant);
        } catch (err) {
            console.error("Error fetching plant:", err);
        }
    };

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
        environmentCondition: 'Other',
        fertilizerUsed: false,
        fertilizerName: '',
        fertilizerType: 'Other',
        dosage: '',
        applicationMethod: 'Other',
        fertilizerNotes: '',
        manureUsed: false,
        manureType: 'Other',
        manureDosage: '',
        manureMethod: 'Other',
        manureNotes: '',
        locationText: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gpsCoords, setGpsCoords] = useState('TAP');
    const [capturedCoords, setCapturedCoords] = useState(null);

    const captureGPS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const lat = pos.coords.latitude.toFixed(6);
                    const lng = pos.coords.longitude.toFixed(6);
                    setGpsCoords(`${lat}, ${lng}`);
                    setCapturedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    
                    // Autofill temperature
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.current_weather && data.current_weather.temperature) {
                                setForm(prev => ({ ...prev, temperatureCelsius: data.current_weather.temperature }));
                            }
                        })
                        .catch(err => console.error("Temp fetch error:", err));
                },
                () => setGpsCoords('ERR')
            );
        } else {
            setGpsCoords('ERR');
        }
    };

    const handleUploadComplete = (uploadData) => {
        // Add the new photo metadata to the array
        setPhotos(prev => [...prev, {
            driveFileId: uploadData.driveFileId,
            displayUrl: uploadData.displayUrl,
            originalFilename: uploadData.originalFilename,
            takenAt: new Date(),
            imageType: uploadData.imageType
        }]);
    };

    const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = { plantId: id };
        Object.entries(form).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) payload[k] = v;
        });
        
        if (capturedCoords) {
            payload.coordinates = capturedCoords;
        }

        // Include drivePhotos metadata
        if (photos.length > 0) {
            payload.drivePhotos = photos;
        }

        try {
            await api.post('/updates', payload);
            navigate(`/plant/${id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save entry.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--night)' }}>
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 32px', height: 64, background: 'rgba(10,15,13,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12 }}>
                <Link to={`/plant/${id}`} className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}><ArrowLeft size={18} /></Link>
                <Leaf size={18} style={{ color: 'var(--jade)' }} />
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: 'var(--pearl)', fontSize: 16 }}>{t('care_log.title')}</span>
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
                            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', marginBottom: 14 }}>{t('care_log.visual_evidence') || 'Visual Progress'}</h3>
                            <ImageUpload 
                                plantId={id} 
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

                        {/* Environment Section */}
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Cloud size={18} className="text-jade" />
                                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', margin: 0 }}>{t('care_log.conditions')}</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="md:col-span-2">
                                    <label className="label-text">{t('add_plant.environment_condition')}</label>
                                    <select className="select-field" {...f('environmentCondition')}>
                                        {['full_sun', 'partial_sun', 'partial_shade', 'full_shade', 'indoor_bright', 'indoor_low', 'greenhouse', 'humid', 'arid', 'coastal', 'tropical', 'subtropical', 'temperate', 'mediterranean', 'highland', 'rainforest', 'desert', 'other'].map(c => (
                                            <option key={c} value={c}>{t(`env_conditions.${c}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                 <div>
                                     <label className="label-text">{t('care_log.temp_label')}</label>
                                     <input type="number" step="0.1" className="input-field" {...f('temperatureCelsius')} />
                                 </div>
                                 <div>
                                     <label className="label-text">{t('care_log.moisture_label')}</label>
                                     <select className="select-field" {...f('soilMoisture')}>
                                         <option value="">{t('care_log.select_option')}</option>
                                         {['dry', 'moist', 'wet', 'waterlogged'].map(v => (
                                             <option key={v} value={v}>{t(`care_log.moisture_options.${v}`)}</option>
                                         ))}
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
                                             <select className="select-field" {...f('fertilizerType')}>
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
                                             <select className="select-field" {...f('applicationMethod')}>
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

                          {/* Manure Section */}
                         <div style={{ padding: '20px', background: 'rgba(245,158,11,0.05)', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.1)' }}>
                             <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: form.manureUsed ? 20 : 0 }}>
                                 <input type="checkbox" checked={form.manureUsed} onChange={e => setForm({ ...form, manureUsed: e.target.checked })} style={{ width: 18, height: 18 }} />
                                 <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: 'var(--pearl)', fontWeight: 600 }}>{t('care_log.using_manure')}</span>
                                 <FlaskConical size={18} className="text-gold" style={{ marginLeft: 'auto' }} />
                             </label>

                             {form.manureUsed && (
                                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                         <div>
                                             <label className="label-text">{t('care_log.manure_type')}</label>
                                             <select className="select-field" {...f('manureType')}>
                                                 {['Cow dung', 'Poultry', 'Vermicompost', 'Goat/Sheep', 'Horse', 'Green manure', 'Bone meal', 'Fish meal', 'Other'].map(v => (
                                                     <option key={v} value={v}>{t(`care_log.manure_types.${v}`)}</option>
                                                 ))}
                                             </select>
                                         </div>
                                         <div>
                                             <label className="label-text">{t('care_log.manure_dosage')}</label>
                                             <input className="input-field" placeholder="e.g. 2kg" {...f('manureDosage')} />
                                         </div>
                                         <div className="md:col-span-2">
                                             <label className="label-text">{t('care_log.manure_method')}</label>
                                             <select className="select-field" {...f('manureMethod')}>
                                                 {['Soil incorporation', 'Top dressing', 'Mulching', 'Composting', 'Other'].map(v => (
                                                     <option key={v} value={v}>{t(`care_log.manure_methods.${v}`)}</option>
                                                 ))}
                                             </select>
                                         </div>
                                     </div>
                                     <div>
                                         <label className="label-text">{t('care_log.manure_notes')}</label>
                                         <textarea className="textarea-field" rows={2} {...f('manureNotes')} />
                                     </div>
                                 </motion.div>
                             )}
                         </div>

                        <div>
                            <label className="label-text">⚠️ {t('care_log.pest_issues')}</label>
                            <textarea className="textarea-field" rows={2} placeholder="Any bugs, yellowing, wilting?" {...f('pestIssues')} />
                        </div>

                         <div onClick={captureGPS} style={{
                             display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px',
                             background: capturedCoords ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.06)',
                             border: capturedCoords ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.15)',
                             borderRadius: 12, cursor: 'pointer',
                         }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: capturedCoords ? 'var(--jade)' : '#ef4444' }} />
                                 <span style={{ fontSize: 13, color: capturedCoords ? 'var(--jade)' : '#fca5a5', fontWeight: 600 }}>{capturedCoords ? `✓ ${t('register.gps_captured')}` : `📍 ${t('register.gps_detect')}`}</span>
                                 <small style={{ marginLeft: 'auto', fontFamily: "var(--font-mono)", fontSize: 10, color: capturedCoords ? 'var(--jade)' : '#ef4444' }}>{gpsCoords}</small>
                             </div>
                            <div style={{ marginTop: 10 }}>
                                <label className="label-text" style={{ fontSize: 9 }}>{t('add_plant.location_manual')}</label>
                                <input className="input-field" style={{ background: 'rgba(0,0,0,0.1)', fontSize: 12 }} placeholder={t('add_plant.placeholder_location')} {...f('locationText')} onClick={e => e.stopPropagation()} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 14 }}>
                            <Link to={`/plant/${id}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', borderRadius: 50 }}>{t('add_plant.cancel')}</Link>
                            <button type="submit" className="btn-primary" style={{ flex: 2, borderRadius: 50 }} disabled={loading}>
                                {loading ? '...' : <><CheckCircle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />{t('care_log.submit')}</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
