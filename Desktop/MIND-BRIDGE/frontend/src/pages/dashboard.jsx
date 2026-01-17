import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Users, BookOpen, Smile, Plus, Bell, Meh, Frown,
    Globe, Lock, UserCircle, X, MessageSquare, Clock,
    ShieldCheck, Check, Trash2, ArrowRight, FileText
} from 'lucide-react';
import axios from 'axios';
import { socket } from '../socket';
import LogoutButton from '../components/LogoutButton';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // --- REGULAR NOTIFICATION STATES ---
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    // --- ADMIN NOTIFICATION STATES ---
    const [adminRequests, setAdminRequests] = useState([]);
    const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);
    const [hasUnreadAdmin, setHasUnreadAdmin] = useState(false);

    // --- JOURNALS STATE ---
    const [recentJournals, setRecentJournals] = useState([]);

    // --- MOOD STATES ---
    const [moodSubmitted, setMoodSubmitted] = useState(() => {
        const lastSavedDate = localStorage.getItem('lastMoodDate');
        return lastSavedDate === new Date().toDateString();
    });
    const [selectedMood, setSelectedMood] = useState(null);
    const [visibility, setVisibility] = useState('private');

    // --- DATA FETCHING & PERSISTENCE LOGIC ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Social Notifications
                const resNotif = await axios.get('http://localhost:5001/api/notifications', { withCredentials: true });
                const fetchedNotifs = resNotif.data.notifications;
                setNotifications(fetchedNotifs);

                // Check LocalStorage for Social Bell
                const lastSeenNotif = localStorage.getItem(`lastSeenNotif_${user?._id}`);
                if (fetchedNotifs.length > 0) {
                    const newestNotifTime = new Date(fetchedNotifs[0].createdAt).getTime();
                    if (!lastSeenNotif || newestNotifTime > parseInt(lastSeenNotif)) {
                        setHasUnread(true);
                    }
                }

                // 2. Fetch Admin Join Requests
                const resAdmin = await axios.get('http://localhost:5001/api/circles/admin/pending-requests', { withCredentials: true });
                const fetchedRequests = resAdmin.data.requests || [];
                setAdminRequests(fetchedRequests);

                // Check LocalStorage for Admin Shield
                const lastSeenAdmin = localStorage.getItem(`lastSeenAdmin_${user?._id}`);
                if (fetchedRequests.length > 0) {
                    if (!lastSeenAdmin || fetchedRequests.length > 0) {
                        setHasUnreadAdmin(true);
                    }
                }

                // 3. Fetch Recent Journals
                const resJournals = await axios.get('http://localhost:5001/api/journals/recent', { withCredentials: true });
                setRecentJournals(resJournals.data.journals || []);

            } catch (err) {
                console.error("Error fetching dashboard data", err);
            }
        };

        if (user?._id) {
            fetchDashboardData();
            socket.emit("join_user_room", user._id);

            // Listen for Social Notifications
            socket.on("new_notification", (data) => {
                setNotifications(prev => [data, ...prev]);
                setHasUnread(true);
            });

            // Listen for Join Requests (Admin)
            socket.on("new_join_request", (data) => {
                setAdminRequests(prev => [data, ...prev]);
                setHasUnreadAdmin(true);
            });
        }

        return () => {
            socket.off("new_notification");
            socket.off("new_join_request");
        };
    }, [user]);

    // --- TOGGLE HANDLERS ---
    const handleToggleNotif = () => {
        const nextState = !isNotifOpen;
        setIsNotifOpen(nextState);
        setIsAdminNotifOpen(false);

        if (nextState === true) {
            setHasUnread(false);
            localStorage.setItem(`lastSeenNotif_${user?._id}`, Date.now().toString());
        }
    };

    const handleToggleAdminNotif = () => {
        const nextState = !isAdminNotifOpen;
        setIsAdminNotifOpen(nextState);
        setIsNotifOpen(false);

        if (nextState === true) {
            setHasUnreadAdmin(false);
            localStorage.setItem(`lastSeenAdmin_${user?._id}`, Date.now().toString());
        }
    };

    // --- ADMIN ACTION (APPROVE/REJECT) ---
    const handleRequestAction = async (circleId, targetUserId, status) => {
        try {
            await axios.post(`http://localhost:5001/api/circles/${circleId}/request-action`, {
                targetUserId,
                status
            }, { withCredentials: true });

            setAdminRequests(prev => prev.filter(req => !(req.userId === targetUserId && req.circleId === circleId)));

            if (adminRequests.length <= 1) setIsAdminNotifOpen(false);
        } catch (err) {
            console.error("Admin action failed", err);
        }
    };

    const handleFinalSubmit = async () => {
        if (!selectedMood) return;
        try {
            await axios.post('http://localhost:5001/api/mood/sync',
                { mood: selectedMood, visibility: visibility },
                { withCredentials: true }
            );
            localStorage.setItem('lastMoodDate', new Date().toDateString());
            setMoodSubmitted(true);
        } catch (err) {
            console.error("Mood sync failed", err);
            setMoodSubmitted(true);
        }
    };

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#F8FAF9] p-4 md:p-8 relative">
            <div className="max-w-7xl mx-auto">
                {/* --- HEADER --- */}
                <header className="flex justify-between items-center mb-8 relative">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 bg-[#509678] rounded-xl flex items-center justify-center shadow-lg shadow-[#509678]/20">
                            <span className="text-white font-bold">M</span>
                        </div>
                        <span className="text-xl font-serif font-bold text-[#2D3748]">Mindful</span>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">

                        {/* --- ADMIN SHIELD NOTIFICATIONS --- */}
                        {adminRequests.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={handleToggleAdminNotif}
                                    className={`p-2.5 rounded-full transition-all relative z-10 ${isAdminNotifOpen
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-white text-gray-400 border border-gray-100 shadow-sm hover:border-blue-200'
                                        }`}
                                >
                                    <ShieldCheck size={22} />
                                    {hasUnreadAdmin && (
                                        <div className="absolute -top-1 -right-1 flex h-4 w-4 z-50">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-sm"></span>
                                        </div>
                                    )}
                                </button>

                                {isAdminNotifOpen && (
                                    <div className="absolute top-full right-0 mt-4 w-[320px] md:w-[360px] bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                                            <h3 className="font-bold text-lg">Circle Requests</h3>
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                {adminRequests.length} Pending
                                            </span>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto p-3 bg-gray-50/30">
                                            {adminRequests.map((req, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-[2rem] border border-gray-100 mb-3 shadow-sm">
                                                    <div className="flex gap-3 items-center mb-4">
                                                        <img src={req.userAvatar} className="w-10 h-10 rounded-full border-2 border-blue-50 object-cover" alt="user" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800 truncate">{req.userName}</p>
                                                            <p className="text-[11px] text-gray-500">wants to join <span className="text-blue-600 font-bold">{req.circleName}</span></p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRequestAction(req.circleId, req.userId, 'approve')}
                                                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestAction(req.circleId, req.userId, 'reject')}
                                                            className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- REGULAR NOTIFICATION BELL --- */}
                        <div className="relative">
                            <button
                                onClick={handleToggleNotif}
                                className={`p-2.5 rounded-full transition-all relative z-10 ${hasUnread
                                    ? 'bg-green-100 text-[#509678]'
                                    : 'bg-white text-gray-400 border border-gray-100 shadow-sm hover:border-gray-200'
                                    }`}
                            >
                                <Bell size={22} className={hasUnread ? "fill-[#509678]" : ""} />

                                {hasUnread && (
                                    <div className="absolute -top-0.5 -right-0.5 h-4 w-4 z-50 flex items-center justify-center">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-white shadow-sm"></span>
                                    </div>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute top-full right-0 mt-4 w-[320px] md:w-[380px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="p-6 bg-[#509678] text-white flex justify-between items-center">
                                        <h3 className="font-bold text-lg">Notifications</h3>
                                        <button onClick={() => setIsNotifOpen(false)} className="hover:rotate-90 transition-transform">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            notifications.map((n, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        setIsNotifOpen(false);
                                                        navigate(`/circles/${n.circleId}`, { state: { scrollToPost: n.postId } });
                                                    }}
                                                    className="flex gap-4 p-4 hover:bg-gray-50 rounded-[1.8rem] transition-all cursor-pointer border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="w-11 h-11 bg-green-50 rounded-full flex items-center justify-center text-[#509678] flex-shrink-0 overflow-hidden border border-green-100">
                                                        {n.sender?.avatarUrl ? (
                                                            <img src={n.sender.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                                                        ) : (
                                                            <MessageSquare size={18} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-700 leading-tight">
                                                            <span className="font-bold text-[#2D3748]">{n.sender?.displayName || 'Someone'}</span> {n.text}
                                                        </p>
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1.5 font-bold uppercase tracking-wider">
                                                            <Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center text-gray-400 italic">No new activity yet</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <LogoutButton />
                    </div>
                </header>

                {/* --- NAVIGATION CARDS --- */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <button onClick={() => navigate('/circles')} className="flex-1 min-w-[140px] bg-white p-5 rounded-[2.2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="bg-blue-50 p-4 rounded-2xl group-hover:scale-110 transition-transform"><Users className="text-blue-500" /></div>
                        <span className="font-bold text-gray-700">Circles</span>
                    </button>
                    <button onClick={() => navigate('/journals')} className="flex-1 min-w-[140px] bg-white p-5 rounded-[2.2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="bg-amber-50 p-4 rounded-2xl group-hover:scale-110 transition-transform"><BookOpen className="text-amber-500" /></div>
                        <span className="font-bold text-gray-700">Journals</span>
                    </button>
                    <button onClick={() => navigate('/mood-log')} className="flex-1 min-w-[140px] bg-white p-5 rounded-[2.2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="bg-green-50 p-4 rounded-2xl group-hover:scale-110 transition-transform"><Smile className="text-green-500" /></div>
                        <span className="font-bold text-gray-700">Mood Log</span>
                    </button>
                </div>

                {/* --- WELCOME SECTION --- */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-[#2D3748]">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</h1>
                        <p className="text-gray-400 mt-2 text-lg font-medium">{formattedDate}</p>
                    </div>
                    <div className="hidden md:block w-24 h-24 rounded-full bg-gradient-to-tr from-[#509678] to-[#88c4a9] border-4 border-white shadow-xl overflow-hidden">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-[#509678]">
                                {user?.displayName?.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MOOD LOGGING --- */}
                {!moodSubmitted && (
                    <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm mb-10 transition-all">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">How are you feeling today?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
                            <button onClick={() => setSelectedMood('good')} className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all group ${selectedMood === 'good' ? 'border-green-500 bg-green-50/50' : 'border-transparent bg-gray-50 hover:bg-green-50/30'}`}><Smile size={48} className="text-green-500" /><span className="font-bold text-gray-700">Good Day</span></button>
                            <button onClick={() => setSelectedMood('neutral')} className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all group ${selectedMood === 'neutral' ? 'border-amber-500 bg-amber-50/50' : 'border-transparent bg-gray-50 hover:bg-amber-50/30'}`}><Meh size={48} className="text-amber-500" /><span className="font-bold text-gray-700">Neutral Day</span></button>
                            <button onClick={() => setSelectedMood('bad')} className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all group ${selectedMood === 'bad' ? 'border-red-500 bg-red-50/50' : 'border-transparent bg-gray-50 hover:bg-red-50/30'}`}><Frown size={48} className="text-red-500" /><span className="font-bold text-gray-700">Bad Day</span></button>
                        </div>
                        {selectedMood && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 max-w-md mx-auto">
                                <label className="block text-sm font-bold text-gray-600 mb-2 ml-2">Visibility</label>
                                <div className="relative mb-6">
                                    <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#509678]/20 font-medium text-gray-700">
                                        <option value="private">Private (Only me)</option>
                                        <option value="circles">Share with Circles</option>
                                        <option value="public">Public</option>
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#509678]">
                                        {visibility === 'private' && <Lock size={20} />}
                                        {visibility === 'circles' && <UserCircle size={20} />}
                                        {visibility === 'public' && <Globe size={20} />}
                                    </div>
                                </div>
                                <button onClick={handleFinalSubmit} className="w-full py-5 bg-[#509678] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#509678]/20 hover:bg-[#3d7a60] transition-all">Log My Mood</button>
                            </div>
                        )}
                    </div>
                )}

                {/* --- COMMUNITY SECTION --- */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Community</h2>
                    <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-white to-[#f0fdf4]">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#509678]/10 text-[#509678] rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                <Users size={14} /> Shared Journeys
                            </div>
                            <h3 className="text-3xl font-serif font-bold text-gray-800 mb-4">
                                You don't have to walk this path alone.
                            </h3>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                Join specialized Circles to connect with others who understand your journey.
                                Share stories, find support, and grow together in a safe, moderated space.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/circles')}
                            className="group flex items-center gap-3 bg-[#509678] text-white px-8 py-5 rounded-[2rem] font-bold text-lg hover:bg-[#3d7a60] transition-all shadow-lg hover:shadow-[#509678]/20 active:scale-95 flex-shrink-0"
                        >
                            Explore All Circles
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </div>
                </div>

                {/* --- RECENT JOURNALS FOOTER --- */}
                <div className="mt-12">
                    <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm max-w-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-gray-800">Recent Journals</h2>
                            <button
                                onClick={() => navigate('/journals')}
                                className="w-10 h-10 bg-[#F8FAF9] rounded-xl flex items-center justify-center text-[#509678] hover:bg-green-50 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {recentJournals.length > 0 ? (
                            <div className="space-y-4">
                                {recentJournals.map((journal) => (
                                    <div
                                        key={journal._id}
                                        onClick={() => navigate(`/journals`)}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-amber-50/50 cursor-pointer transition-all border border-transparent hover:border-amber-100 group"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-amber-500">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 truncate">{journal.title || 'Untitled Entry'}</h4>
                                            <p className="text-xs text-gray-400 mt-1 font-medium">
                                                {new Date(journal.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <button onClick={() => navigate('/journals')} className="w-full py-6 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl font-bold hover:border-[#509678]/30 hover:text-[#509678] transition-all flex flex-col items-center gap-2">
                                <BookOpen size={24} className="opacity-20" />
                                Write Your First Entry
                            </button>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}