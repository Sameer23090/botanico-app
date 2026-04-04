import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { plantsAPI } from '../api';
import { useTranslation } from 'react-i18next';

export default function AddPlant() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form, setForm] = useState({
        commonName: '', scientificName: '', family: '', genus: '', species: '',
        variety: '', plantType: '', growthHabit: '', nativeRegion: '',
        description: '', plantingDate: new Date().toISOString().split('T')[0],
        plantingSeason: 'Unknown',
        environmentCondition: 'Other',
        location: '', soilType: '', sunlightExposure: '', plantingMethod: '',
        status: 'active'
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
                },
                () => setGpsCoords('ERR')
            );
        } else {
            setGpsCoords('ERR');
        }
    };

    const plantPresets = {
        '': { scientific: '', family: '', type: '', habit: '', season: 'Unknown', environment: 'other' },
        'Amla (Indian Gooseberry)': { scientific: 'Phyllanthus emblica', family: 'Phyllanthaceae', type: 'Fruit', habit: 'Tree', season: 'Winter', environment: 'full_sun' },
        'Ashoka Tree': { scientific: 'Saraca asoca', family: 'Fabaceae', type: 'Tree', habit: 'Tree', season: 'Year-round', environment: 'partial_sun' },
        'Banyan Tree (Vat)': { scientific: 'Ficus benghalensis', family: 'Moraceae', type: 'Tree', habit: 'Tree', season: 'Year-round', environment: 'full_sun' },
        'Curry Leaf': { scientific: 'Murraya koenigii', family: 'Rutaceae', type: 'Herb', habit: 'Shrub', season: 'Year-round', environment: 'full_sun' },
        'Guava': { scientific: 'Psidium guajava', family: 'Myrtaceae', type: 'Fruit', habit: 'Tree', season: 'Autumn', environment: 'full_sun' },
        'Hibiscus (Gudhal)': { scientific: 'Hibiscus rosa-sinensis', family: 'Malvaceae', type: 'Flower', habit: 'Shrub', season: 'Summer', environment: 'full_sun' },
        'Jack fruit': { scientific: 'Artocarpus heterophyllus', family: 'Moraceae', type: 'Fruit', habit: 'Tree', season: 'Summer', environment: 'full_sun' },
        'Jamun': { scientific: 'Syzygium cumini', family: 'Myrtaceae', type: 'Fruit', habit: 'Tree', season: 'Monsoon', environment: 'full_sun' },
        'Jasmine (Mogra)': { scientific: 'Jasminum sambac', family: 'Oleaceae', type: 'Flower', habit: 'Shrub', season: 'Summer', environment: 'partial_sun' },
        'Lemon': { scientific: 'Citrus limon', family: 'Rutaceae', type: 'Fruit', habit: 'Tree', season: 'Year-round', environment: 'full_sun' },
        'Mango': { scientific: 'Mangifera indica', family: 'Anacardiaceae', type: 'Fruit', habit: 'Tree', season: 'Summer', environment: 'full_sun' },
        'Marigold (Genda)': { scientific: 'Tagetes erecta', family: 'Asteraceae', type: 'Flower', habit: 'Annual', season: 'Winter', environment: 'full_sun' },
        'Moringa (Drumstick)': { scientific: 'Moringa oleifera', family: 'Moringaceae', type: 'Vegetable', habit: 'Tree', season: 'Summer', environment: 'full_sun' },
        'Neem': { scientific: 'Azadirachta indica', family: 'Meliaceae', type: 'Tree', habit: 'Tree', season: 'Year-round', environment: 'full_sun' },
        'Pappaya': { scientific: 'Carica papaya', family: 'Caricaceae', type: 'Fruit', habit: 'Tree', season: 'Year-round', environment: 'full_sun' },
        'Peepal Tree': { scientific: 'Ficus religiosa', family: 'Moraceae', type: 'Tree', habit: 'Tree', season: 'Year-round', environment: 'full_sun' },
        'Pine apple': { scientific: 'Ananas comosus', family: 'Bromeliaceae', type: 'Fruit', habit: 'Perennial', season: 'Year-round', environment: 'humid' },
        'Pomegranate': { scientific: 'Punica granatum', family: 'Lythraceae', type: 'Fruit', habit: 'Shrub', season: 'Winter', environment: 'full_sun' },
        'Tulsi (Holy Basil)': { scientific: 'Ocimum tenuiflorum', family: 'Lamiaceae', type: 'Herb', habit: 'Shrub', season: 'Year-round', environment: 'partial_sun' }
    };

    const handlePresetChange = (e) => {
        const val = e.target.value;
        const preset = plantPresets[val];
        setForm({
            ...form,
            commonName: val,
            scientificName: preset?.scientific || '',
            family: preset?.family || '',
            plantType: preset?.type || '',
            growthHabit: preset?.habit || '',
            plantingSeason: preset?.season || 'Unknown',
            environmentCondition: preset?.environment || 'Other'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const payload = { ...form };
            if (capturedCoords) {
                payload['coordinates[lat]'] = capturedCoords.lat;
                payload['coordinates[lng]'] = capturedCoords.lng;
            }
            const res = await plantsAPI.create(payload);
            const plantId = res.data.plant?.id || res.data.plant?._id;
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
                backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12
            }}>
                <Link to="/dashboard" className="btn-ghost" style={{ display: 'flex', padding: '6px 10px' }}><ArrowLeft size={18} /></Link>
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: 'var(--pearl)', fontSize: 17 }}>{t('add_plant.title')}</span>
            </nav>

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '36px 40px' }}>
                    {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>{error}</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div>
                            <h2 className="section-title" style={{ color: 'var(--pearl)', marginBottom: 16 }}>{t('add_plant.title')}</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-text">{t('add_plant.common_name')} *</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <select className="select-field" style={{ marginBottom: 0 }} value={Object.keys(plantPresets).includes(form.commonName) ? form.commonName : "CUSTOM"} onChange={handlePresetChange}>
                                            <option value="">{t('add_plant.select_plant')}</option>
                                            {Object.keys(plantPresets).filter(k=>k).map(k => {
                                                // Extract base name to match translation key
                                                const baseKey = k.split(' (')[0];
                                                return <option key={k} value={k}>{t(`plants.${baseKey}`, k)}</option>
                                            })}
                                            <option value="CUSTOM">-- {t('add_plant.other')} --</option>
                                        </select>
                                        {(!Object.keys(plantPresets).includes(form.commonName) || form.commonName === "CUSTOM") && (
                                            <input className="input-field" placeholder={t('add_plant.placeholder_common')} required value={form.commonName === "CUSTOM" ? "" : form.commonName} onChange={e => setForm({...form, commonName: e.target.value})} />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="label-text">{t('add_plant.scientific_name')}</label>
                                    <input className="input-field" placeholder={t('add_plant.placeholder_scientific')} {...f('scientificName')} />
                                </div>
                                <div>
                                    <label className="label-text">{t('add_plant.planting_date')} *</label>
                                    <input type="date" className="input-field" required {...f('plantingDate')} />
                                </div>
                                <div>
                                    <label className="label-text">{t('add_plant.planting_season')}</label>
                                    <select className="select-field" {...f('plantingSeason')}>
                                        {['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter', 'Year-round', 'Unknown'].map(s => (
                                            <option key={s} value={s}>{t(`add_plant.seasons.${s}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                 <div>
                                    <label className="label-text">{t('add_plant.environment_condition')}</label>
                                    <select className="select-field" {...f('environmentCondition')}>
                                        {['full_sun', 'partial_sun', 'partial_shade', 'full_shade', 'indoor_bright', 'indoor_low', 'greenhouse', 'humid', 'arid', 'coastal', 'other'].map(c => (
                                            <option key={c} value={c}>{t(`env_conditions.${c}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">{t('add_plant.description')}</label>
                                    <textarea className="textarea-field" rows={2} {...f('description')} />
                                </div>
                            </div>
                        </div>

                        <div onClick={captureGPS} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                            background: capturedCoords ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.06)',
                            border: capturedCoords ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 12, cursor: 'pointer',
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: capturedCoords ? 'var(--jade)' : '#ef4444' }} />
                            <span style={{ fontSize: 13, color: capturedCoords ? 'var(--jade)' : '#fca5a5', fontWeight: 600 }}>{capturedCoords ? `✓ ${t('register.gps_captured')}` : `📍 ${t('register.gps_detect')}`}</span>
                            <small style={{ marginLeft: 'auto', fontFamily: "var(--font-mono)", fontSize: 10, color: capturedCoords ? 'var(--jade)' : '#ef4444' }}>{gpsCoords}</small>
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <Link to="/dashboard" className="btn-secondary" style={{ flex: 1, textAlign: 'center', borderRadius: 50 }}>{t('add_plant.cancel')}</Link>
                            <button type="submit" className="btn-primary" style={{ flex: 1, borderRadius: 50 }} disabled={loading}>
                                {loading ? '...' : t('add_plant.submit')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
