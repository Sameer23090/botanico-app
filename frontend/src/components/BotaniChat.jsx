import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X, Send, Minimize2, Leaf } from 'lucide-react';
import { aiAPI } from '../api';

const BOT_INTRO = { role: 'assistant', content: "Hello! I'm BotaniBot, your AI botanical consultant powered by LLaMA 3. Ask me anything about plant care, diseases, growing conditions, or your garden. 🌱" };

export default function BotaniChat({ isAuthenticated }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([BOT_INTRO]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    if (!isAuthenticated) return null;

    const sendMessage = async (e) => {
        e.preventDefault();
        const msg = input.trim();
        if (!msg || loading) return;

        const userMsg = { role: 'user', content: msg };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const history = messages.filter(m => m.role !== 'system');
            const res = await aiAPI.chat(msg, history);
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = err.response?.data?.error || 'Connection failed. Please check your internet or configuration.';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ ${errorMsg}`
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating trigger button */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setOpen(true)}
                        style={{
                            position: 'fixed', bottom: 28, right: 28, zIndex: 200,
                            width: 58, height: 58, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--jade), var(--emerald))',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 0 0 rgba(34,197,94,0.4)',
                            animation: 'pulse-ring 2s infinite',
                        }}
                        title="Ask BotaniBot"
                    >
                        <BrainCircuit size={26} color="#fff" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        style={{
                            position: 'fixed', bottom: 24, right: 24, zIndex: 200,
                            width: 380, maxWidth: 'calc(100vw - 48px)',
                            borderRadius: 24,
                            background: 'rgba(10,15,13,0.97)',
                            border: '1px solid rgba(34,197,94,0.2)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.08)',
                            overflow: 'hidden',
                            display: 'flex', flexDirection: 'column',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '18px 20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            background: 'rgba(34,197,94,0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 12,
                                    background: 'rgba(34,197,94,0.15)',
                                    border: '1px solid rgba(34,197,94,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--jade)',
                                }}>
                                    <BrainCircuit size={20} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--pearl)', fontSize: 15 }}>
                                        BotaniBot
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--jade)', opacity: 0.7, letterSpacing: '0.12em' }}>
                                        LLAMA 3.1 · ONLINE
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'rgba(240,253,244,0.3)', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1, overflowY: 'auto', padding: '16px',
                            display: 'flex', flexDirection: 'column', gap: 10,
                            maxHeight: 360, minHeight: 240,
                        }}>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                                >
                                    {msg.role === 'assistant' && (
                                        <div style={{
                                            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--jade)', marginRight: 8, marginTop: 2,
                                        }}>
                                            <Leaf size={13} />
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '82%',
                                        padding: '10px 14px',
                                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, var(--jade), var(--emerald))'
                                            : 'rgba(255,255,255,0.05)',
                                        border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)',
                                        color: msg.role === 'user' ? '#fff' : 'rgba(240,253,244,0.82)',
                                        fontSize: 13.5,
                                        lineHeight: 1.6,
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: msg.role === 'user' ? 500 : 400,
                                    }}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--jade)',
                                    }}>
                                        <Leaf size={13} />
                                    </div>
                                    <div style={{
                                        padding: '10px 16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: '16px 16px 16px 4px',
                                        display: 'flex', gap: 5, alignItems: 'center',
                                    }}>
                                        {[0, 0.15, 0.3].map((d, i) => (
                                            <motion.div key={i}
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.7, repeat: Infinity, delay: d }}
                                                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jade)' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your plants..."
                                    disabled={loading}
                                    style={{
                                        flex: 1, padding: '10px 14px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        borderRadius: 12,
                                        color: 'var(--pearl)', fontSize: 13,
                                        outline: 'none',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    style={{
                                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                        background: input.trim() ? 'var(--jade)' : 'rgba(255,255,255,0.06)',
                                        border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: input.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                            <p style={{ fontSize: 10, color: 'rgba(240,253,244,0.2)', textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                                Powered by Groq · LLaMA 3.1
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
