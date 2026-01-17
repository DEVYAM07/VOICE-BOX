import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Globe, Lock, Hash } from 'lucide-react';
import axios from 'axios';

export default function CreateCircle() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tags: [],
        visibility: 'public'
    });

    const availableTags = ["Anxiety", "Productivity", "Mindfulness", "Sleep Quality", "Stress Management", "Focus", "Self-Care", "Social Wellness", "Emotional Balance"];

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/circles/create', formData, { withCredentials: true });
            if (res.data.success) {
                navigate('/circles'); // Go back to the list
            }
        } catch (err) {
            console.error(err);
            alert("Error creating circle");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAF9] p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/circles')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 transition-all">
                    <ArrowLeft size={20} /> Back to Circles
                </button>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h1 className="text-3xl font-serif font-bold text-[#2D3748] mb-2">Create a Circle</h1>
                    <p className="text-gray-400 mb-8">Build a community around shared experiences.</p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Circle Name *</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g., The Morning Gratitude Club"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#509678]/20"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                            <textarea
                                required
                                rows="3"
                                placeholder="What is this circle about?"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#509678]/20"
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Tags Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Tags (Select all that apply)</label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${formData.tags.includes(tag)
                                            ? 'bg-[#509678] border-[#509678] text-white'
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                            }`}
                                    >
                                        <Hash size={14} />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Visibility */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Visibility</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: 'public' })}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.visibility === 'public' ? 'border-[#509678] bg-green-50/30' : 'border-gray-50 bg-gray-50'}`}
                                >
                                    <Globe className={formData.visibility === 'public' ? 'text-[#509678]' : 'text-gray-400'} />
                                    <span className="text-sm font-bold">Public</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: 'private' })}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.visibility === 'private' ? 'border-[#509678] bg-green-50/30' : 'border-gray-50 bg-gray-50'}`}
                                >
                                    <Lock className={formData.visibility === 'private' ? 'text-[#509678]' : 'text-gray-400'} />
                                    <span className="text-sm font-bold">Private</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-[#509678] text-white rounded-[2rem] font-bold text-lg shadow-lg shadow-[#509678]/20 hover:bg-[#3d7a60] transition-all"
                        >
                            Create Circle
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}