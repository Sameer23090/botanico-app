import { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAPI } from '../api';
import { useTranslation } from 'react-i18next';

export default function ImageUpload({ onUploadComplete, plantId, imageType = 'timeline', commonName = '', scientificName = '' }) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setError(t('upload.error_type'));
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
            setError(t('upload.error_size'));
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        setError('');
        setSuccess(false);

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('plantId', plantId);
        formData.append('imageType', imageType);
        formData.append('commonName', commonName);
        formData.append('scientificName', scientificName);

        try {
            const res = await uploadAPI.uploadImage(formData);
            setSuccess(true);
            if (onUploadComplete) {
                onUploadComplete(res.data);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.error || t('upload.error_generic'));
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        setSuccess(false);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div style={{ width: '100%' }}>
            <label className="label-text">{t('upload.label') || 'Capture Growth'}</label>
            
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
            />

            <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="upload-zone"
                style={{ 
                    height: 200, 
                    position: 'relative', 
                    overflow: 'hidden',
                    borderColor: error ? 'rgba(239,68,68,0.4)' : success ? 'rgba(34,197,94,0.6)' : undefined,
                    background: preview ? 'transparent' : undefined
                }}
            >
                <AnimatePresence mode="wait">
                    {!preview ? (
                        <motion.div 
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
                        >
                            <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--jade)' }}>
                                <Camera size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pearl)', marginBottom: 4 }}>
                                    {t('upload.prompt') || 'Upload Photo'}
                                </p>
                                <p style={{ fontSize: 11, color: 'rgba(240,253,244,0.4)' }}>
                                    {t('upload.hint') || 'Tap to capture or drag image'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ position: 'absolute', inset: 0 }}
                        >
                            <img 
                                src={preview} 
                                alt="Preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploading ? 0.5 : 1 }} 
                            />
                            
                            {/* Overlay UI */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: 12 }}>
                                {uploading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>{t('upload.processing') || 'Processing...'}</span>
                                    </div>
                                ) : success ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--jade)' }}>
                                        <Check size={16} />
                                        <span style={{ fontSize: 12, fontWeight: 700 }}>{t('upload.success') || 'Synced to Drive'}</span>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: 12, color: '#fff', opacity: 0.8 }}>{t('upload.ready') || 'Image Ready'}</span>
                                )}

                                <button 
                                    onClick={clearImage}
                                    style={{ 
                                        background: 'rgba(0,0,0,0.5)', 
                                        border: 'none', 
                                        borderRadius: '50%', 
                                        width: 28, 
                                        height: 28, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        color: '#fff',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(239,68,68,0.9)', color: '#fff', fontSize: 11, padding: '4px 12px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
