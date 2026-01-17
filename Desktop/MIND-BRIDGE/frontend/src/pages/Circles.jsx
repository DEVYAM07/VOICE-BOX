import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, Lock, Globe } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';


export default function Circles() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const availableTags = ["Anxiety", "Productivity", "Mindfulness", "Sleep Quality", "Stress Management", "Focus", "Self-Care", "Social Wellness", "Emotional Balance"];


    useEffect(() => {
        const fetchCircles = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/circles/all', { withCredentials: true });
                setCircles(res.data.circles);
            } catch (err) {
                console.error("Error fetching circles:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCircles();
    }, []);

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };


    const handleJoinAction = async (circleId, visibility) => {
        try {
            const res = await axios.post(`http://localhost:5001/api/circles/join/${circleId}`, {}, { withCredentials: true });

            if (res.data.status === 'joined') {
                // Public Circle: Move to the circle page immediately
                navigate(`/circles/${circleId}`);
            } else if (res.data.status === 'requested') {
                // Private Circle: Update local state to show 'Pending' on this card
                setCircles(prev => prev.map(c =>
                    c._id === circleId ? { ...c, requests: [...(c.requests || []), user._id] } : c
                ));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error processing join request");
        }
    };

    // --- FILTERING LOGIC ---
    const filteredCircles = circles.filter(circle => {
        const matchesTab = activeTab === 'all' ? true : circle.members.includes(user?._id);
        const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 || selectedTags.every(t => circle.tags.includes(t));
        return matchesTab && matchesSearch && matchesTags;
    });

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading communities...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAF9] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-[#2D3748]">Circles</h1>
                        <p className="text-gray-500 mt-2">Find support and connect with others</p>
                    </div>
                    <button
                        onClick={() => navigate('/circles/create')}
                        className="flex items-center gap-2 bg-[#509678] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#3d7a60] transition-all shadow-lg shadow-green-900/10"
                    >
                        <Plus size={20} /> Create Circle
                    </button>
                </div>

                {/* Search and Tabs */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#509678]/20 shadow-sm"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'all' ? 'bg-[#509678] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            All Circles
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'my' ? 'bg-[#509678] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            My Circles
                        </button>
                    </div>
                </div>

                {/* Tag Selection Filter */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedTags.includes(tag)
                                ? 'bg-[#509678] border-[#509678] text-white shadow-sm'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Circles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCircles.map((circle) => {
                        const isMember = circle.members.includes(user?._id);
                        const isPublic = circle.visibility === 'public';
                        const isPending = circle.requests?.includes(user?._id);

                        return (
                            <div key={circle._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 group-hover:text-[#509678] transition-colors">
                                            {circle.name}
                                            {isPublic ? <Globe size={16} className="text-gray-300" /> : <Lock size={16} className="text-amber-400" />}
                                        </h3>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                        {circle.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {circle.tags.map(t => (
                                            <span key={t} className="text-[10px] font-bold text-[#509678] bg-green-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>


                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                        <Users size={16} />
                                        <span>{circle.members.length} members</span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (isMember) navigate(`/circles/${circle._id}`);
                                            else handleJoinAction(circle._id, circle.visibility);
                                        }}
                                        disabled={isPending}
                                        className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${isMember
                                            ? 'bg-green-50 text-[#509678] border border-green-100'
                                            : isPending
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#509678] text-white hover:bg-[#3d7a60] shadow-md shadow-green-900/10'
                                            }`}
                                    >
                                        {isMember ? 'Enter' : (isPending ? 'Pending' : (isPublic ? 'Join' : 'Request'))}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredCircles.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No circles found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}