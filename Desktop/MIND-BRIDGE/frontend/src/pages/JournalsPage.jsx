import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Book, Clock, Lock, Globe, Users, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function JournalsPage() {
    const navigate = useNavigate();
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ title: '', content: '', visibility: 'private' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/journals', { withCredentials: true });
            setJournals(res.data.journals);
        } catch (err) {
            console.error("Failed to fetch journals");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await axios.post('http://localhost:5001/api/journals', formData, { withCredentials: true });
            if (res.data.success) {
                setJournals([res.data.journal, ...journals]);
                setFormData({ title: '', content: '', visibility: 'private' });
                setIsCreating(false);
            }
        } catch (err) {
            alert("Could not save entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteEntry = async (id) => {
        if (!window.confirm("Delete this memory?")) return;
        try {
            await axios.delete(`http://localhost:5001/api/journals/${id}`, { withCredentials: true });
            setJournals(journals.filter(j => j._id !== id));
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAF9] pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-10">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-[#509678] font-bold transition-all">
                        <ArrowLeft size={20} /> Dashboard
                    </button>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isCreating ? 'bg-gray-100 text-gray-500' : 'bg-[#509678] text-white shadow-lg shadow-[#509678]/20'}`}
                    >
                        {isCreating ? 'Cancel' : <><Plus size={20} /> New Entry</>}
                    </button>
                </div>

                {/* Create Entry Form (Matches your Screenshot 2) */}
                {isCreating && (
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12 animate-in slide-in-from-top-4 duration-300">
                        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">New Entry</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="Entry title"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none text-lg font-medium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">Content</label>
                                <textarea
                                    placeholder="Write your thoughts..."
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none h-48 resize-none text-gray-700 leading-relaxed"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">Visibility</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-gray-600 appearance-none"
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                    >
                                        <option value="private">Private</option>
                                        <option value="circles">My Circles</option>
                                        <option value="public">Public</option>
                                    </select>
                                </div>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="px-10 py-4 bg-[#509678] text-white rounded-2xl font-bold hover:bg-[#3d7a60] transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Latest Entries List */}
                <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8">Latest Entries</h2>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#509678]" size={40} /></div>
                ) : journals.length > 0 ? (
                    <div className="grid gap-6">
                        {journals.map((entry) => (
                            <div key={entry._id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#509678]">
                                        <div className="p-2 bg-green-50 rounded-lg"><Book size={14} /></div>
                                        {entry.visibility === 'private' ? <Lock size={12} /> : entry.visibility === 'public' ? <Globe size={12} /> : <Users size={12} />}
                                        {entry.visibility}
                                    </div>
                                    <button
                                        onClick={() => deleteEntry(entry._id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">{entry.title}</h3>
                                <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">{entry.content}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                                    <Clock size={14} /> {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State (Matches your Screenshot 3) */
                    <div className="bg-white rounded-[3rem] p-20 border border-gray-100 shadow-sm text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                            <Book size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-6">No journal entries yet</h3>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-[#509678] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#3d7a60] transition-all"
                        >
                            <Plus size={20} /> Write First Entry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


