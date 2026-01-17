import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smile, Meh, Frown, Calendar, Lock, Globe, UserCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

export default function MoodLog() {
    const navigate = useNavigate();
    const [data, setData] = useState({ history: [], stats: { good: 0, neutral: 0, bad: 0 } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMoodData = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/mood/history', { withCredentials: true });
                if (res.data.success) {
                    setData({
                        history: res.data.history,
                        stats: res.data.stats
                    });
                }
            } catch (err) {
                console.error("Error fetching mood history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMoodData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#509678]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAF9] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* --- HEADER --- */}
                <div className="flex items-center gap-6 mb-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#2D3748]">Mood Journey</h1>
                        <p className="text-gray-400 font-medium">Tracking your emotional well-being</p>
                    </div>
                </div>

                {/* --- STATS CARD --- */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-green-50 p-2 rounded-lg">
                            <TrendingUp size={20} className="text-[#509678]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Monthly Overview</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Good Days */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Good Days</span>
                                <span className="text-2xl font-bold text-green-500">{data.stats?.good || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${data.stats?.good || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Neutral Days */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Neutral Days</span>
                                <span className="text-2xl font-bold text-amber-500">{data.stats?.neutral || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${data.stats?.neutral || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Bad Days */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Bad Days</span>
                                <span className="text-2xl font-bold text-red-500">{data.stats?.bad || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${data.stats?.bad || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RECENT ENTRIES LIST --- */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6 px-4">Recent History</h3>
                <div className="space-y-4">
                    {data.history.length > 0 ? (
                        data.history.map((entry) => (
                            <div
                                key={entry._id}
                                className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#509678]/20 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
                                        {entry.mood === 'good' && <Smile size={28} className="text-green-500" />}
                                        {entry.mood === 'neutral' && <Meh size={28} className="text-amber-500" />}
                                        {entry.mood === 'bad' && <Frown size={28} className="text-red-500" />}
                                        {entry.mood === 'Not Added' && <div className="w-7 h-7 bg-gray-200 rounded-full" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg capitalize">
                                            {entry.mood === 'Not Added' ? 'Missing Entry' : `${entry.mood} Day`}
                                        </h4>
                                        <div className="flex items-center gap-2 text-gray-400 mt-1">
                                            <Calendar size={14} />
                                            <span className="text-sm font-medium">{entry.date}</span>
                                        </div>
                                    </div>
                                </div>

                                {entry.mood !== 'Not Added' && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                                        {entry.visibility === 'private' && <Lock size={14} className="text-gray-400" />}
                                        {entry.visibility === 'public' && <Globe size={14} className="text-gray-400" />}
                                        {entry.visibility === 'circles' && <UserCircle size={14} className="text-gray-400" />}
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            {entry.visibility}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium text-lg">No entries found yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}