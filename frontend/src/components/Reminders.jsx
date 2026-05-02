import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, Plus, AlertCircle, Droplets, Leaf, Thermometer, Trash2 } from 'lucide-react';
import { remindersAPI, plantsAPI } from '../api';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [plants, setPlants] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newReminder, setNewReminder] = useState({
    plantId: '',
    taskName: 'Watering',
    dueDate: '',
    priority: 'Medium',
    frequency: 'Once'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [remRes, plantRes] = await Promise.all([
        remindersAPI.getAll(),
        plantsAPI.getAll()
      ]);
      setReminders(remRes.data.reminders);
      setPlants(plantRes.data.plants);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      await remindersAPI.create(newReminder);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  const handleComplete = async (id) => {
    try {
      await remindersAPI.complete(id);
      setReminders(reminders.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to complete reminder:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
      case 'Medium': return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
      default: return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5';
    }
  };

  const getTaskIcon = (name) => {
    const task = name.toLowerCase();
    if (task.includes('water')) return <Droplets className="w-5 h-5" />;
    if (task.includes('fertilize')) return <Leaf className="w-5 h-5" />;
    if (task.includes('temp')) return <Thermometer className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen pt-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Mission <span className="text-emerald-400">Control</span>
          </h1>
          <p className="text-zinc-400">Operational tasks and growth protocols.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all duration-300 font-medium group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Set New Protocol
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-bold">Active Tasks</span>
          </div>
          <div className="text-3xl font-bold text-white">{reminders.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-rose-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-bold text-rose-400/70">High Priority</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {reminders.filter(r => r.priority === 'High').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-400/70">Efficiency</span>
          </div>
          <div className="text-3xl font-bold text-white">94%</div>
        </div>
      </div>

      {/* Main Task List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {reminders.length > 0 ? (
            reminders.map((reminder, idx) => (
              <motion.div
                key={reminder._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 backdrop-blur-md overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500/50 transition-colors" />
                
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400 border border-white/5 shadow-inner">
                      {getTaskIcon(reminder.taskName)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {reminder.taskName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-zinc-500 flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          {reminder.plantId?.commonName || 'Unknown Specimen'}
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-sm text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(reminder.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority}
                    </span>
                    <button
                      onClick={() => handleComplete(reminder._id)}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all duration-300"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : !loading && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
              <div className="inline-flex p-6 rounded-full bg-zinc-900 border border-white/5 text-zinc-600 mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Protocols</h3>
              <p className="text-zinc-500 max-w-sm mx-auto">All plant systems are operational. Check back later for maintenance tasks.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            onClick={() => setShowAddModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Initialize <span className="text-emerald-400">Task</span></h2>
            <form onSubmit={handleAddReminder} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-black text-zinc-500 mb-2">Select Subject</label>
                <select
                  required
                  className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={newReminder.plantId}
                  onChange={(e) => setNewReminder({...newReminder, plantId: e.target.value})}
                >
                  <option value="">Choose a plant...</option>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.commonName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-black text-zinc-500 mb-2">Task Protocol</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Watering, Repotting"
                  className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={newReminder.taskName}
                  onChange={(e) => setNewReminder({...newReminder, taskName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-black text-zinc-500 mb-2">Deployment Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    value={newReminder.dueDate}
                    onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-black text-zinc-500 mb-2">Threat Level</label>
                  <select
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    value={newReminder.priority}
                    onChange={(e) => setNewReminder({...newReminder, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Activate Protocol
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
