import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, TrendingUp, Calendar, Info, Globe, ShieldCheck } from 'lucide-react';
import { plantsAPI, updatesAPI } from '../api';

const PublicPlantDetail = () => {
    const { id } = useParams();
    const [plant, setPlant] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plantRes, updatesRes] = await Promise.all([
                    plantsAPI.getById(id),
                    updatesAPI.getByPlantId(id),
                ]);
                setPlant(plantRes.data.plant);
                setUpdates(updatesRes.data.updates || []);
            } catch (err) {
                setError('This botanical record is not public or does not exist.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    if (error || !plant) return (
        <div className="min-h-screen bg-[#0a0f0d] flex flex-col items-center justify-center p-6 text-center">
            <ShieldCheck size={64} className="text-emerald-500/20 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
            <p className="text-zinc-500 mb-8 max-w-sm">{error}</p>
            <Link to="/" className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl">Back to Base</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0f0d] text-zinc-100 font-sans selection:bg-emerald-500/30">
            {/* Header / Banner */}
            <div className="relative h-64 md:h-96 w-full overflow-hidden">
                {plant.firstPhotoUrl ? (
                    <img src={plant.firstPhotoUrl} className="w-full h-full object-cover" alt="Plant Preview" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-[#0a0f0d] flex items-center justify-center">
                        <Leaf size={80} className="text-emerald-500/10" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                                    <Globe size={12} /> Public Record
                                </span>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    EST. {new Date(plant.plantingDate).getFullYear()}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2">{plant.commonName}</h1>
                            <p className="text-xl md:text-2xl font-serif italic text-emerald-400/60">{plant.scientificName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                            <Info size={14} /> Specimen Details
                        </h3>
                        <div className="space-y-6">
                            {[
                                ['Family', plant.family],
                                ['Genus', plant.genus],
                                ['Species', plant.species],
                                ['Native Region', plant.nativeRegion],
                                ['Soil Type', plant.soilType],
                                ['Environment', plant.sunlightExposure]
                            ].filter(([,v]) => v).map(([k, v]) => (
                                <div key={k}>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/40 block mb-1">{k}</span>
                                    <span className="text-white font-medium">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                            <TrendingUp size={14} /> Vitality Index
                        </h3>
                        <div className="text-4xl font-black text-white mb-2">{plant.daysSincePlanting || 0} <span className="text-sm font-normal text-zinc-500 uppercase tracking-widest">Days Growth</span></div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                </div>

                {/* Growth Timeline */}
                <div className="md:col-span-2 space-y-12">
                    <div>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                            <Calendar className="text-emerald-500" /> Growth Chronology
                        </h2>
                        
                        <div className="space-y-8 relative">
                            <div className="absolute left-6 top-4 bottom-4 w-px bg-zinc-800" />
                            
                            {updates.map((update, idx) => (
                                <motion.div 
                                    key={update._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="relative pl-16"
                                >
                                    <div className="absolute left-[18px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#0a0f0d] ring-offset-0" />
                                    
                                    <div className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 hover:border-emerald-500/20 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">
                                                    {new Date(update.entryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <h4 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{update.title || `Development Phase ${update.dayNumber}`}</h4>
                                            </div>
                                            <span className="text-2xl font-black text-white/5 font-serif italic">#D{update.dayNumber}</span>
                                        </div>
                                        
                                        <p className="text-zinc-400 leading-relaxed mb-6">{update.observations}</p>
                                        
                                        {update.drivePhotos && update.drivePhotos.length > 0 && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {update.drivePhotos.map((p, i) => (
                                                    <img key={i} src={p.displayUrl} className="rounded-2xl w-full h-40 object-cover border border-white/5" alt="Progress" />
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-4 mt-6">
                                            {update.healthStatus && <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{update.healthStatus}</span>}
                                            {update.temperatureCelsius && <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{update.temperatureCelsius}°C</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="max-w-5xl mx-auto px-8 py-20 border-t border-white/5 text-center">
                <Leaf className="mx-auto text-emerald-500/20 mb-6" size={40} />
                <p className="text-zinc-500 text-sm">This botanical record is part of the <span className="text-white font-bold">Botanico</span> Global Intelligence Network.</p>
                <Link to="/" className="text-emerald-500 text-xs font-black uppercase tracking-[0.2em] mt-4 inline-block hover:tracking-[0.3em] transition-all">Join the Collective</Link>
            </div>
        </div>
    );
};

export default PublicPlantDetail;
