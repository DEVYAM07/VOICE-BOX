import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import {
    Globe, Lock, Users, LogOut, Plus, X, MessageSquare,
    Share2, ArrowLeft, Loader2, Pencil, Trash2, Send,
    ShieldCheck, UserMinus
} from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function CirclePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const [circle, setCircle] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [newPostData, setNewPostData] = useState({ title: '', body: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);

    // COMMENT STATES
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);

    // --- 1. DATA FETCHING (Stabilized with useCallback) ---
    const fetchCircleData = useCallback(async () => {
        try {
            const circleRes = await axios.get(`http://localhost:5001/api/circles/${id}`, { withCredentials: true });
            setCircle(circleRes.data.circle);

            const postsRes = await axios.get(`http://localhost:5001/api/posts/circle/${id}`, { withCredentials: true });
            setPosts(postsRes.data.posts);
        } catch (err) {
            console.error("Error loading circle data:", err);
            navigate('/circles');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    // --- 2. SOCKET & INITIAL LOAD ---
    useEffect(() => {
        if (id) {
            fetchCircleData();
            connectSocket();
            socket.emit("join_circle", id);
        }

        socket.on("post_received", (newPost) => {
            setPosts(prev => {
                if (prev.find(p => p._id === newPost._id)) return prev;
                return [newPost, ...prev];
            });
        });

        return () => {
            socket.emit("leave_circle", id);
            socket.off("post_received");
        };
    }, [id, fetchCircleData]);

    // --- 3. NOTIFICATION HANDLING ---
    useEffect(() => {
        const targetPostId = location.state?.scrollToPost;
        if (targetPostId && posts.length > 0) {
            const postExists = posts.find(p => p._id === targetPostId);
            if (postExists) {
                setActiveCommentPostId(targetPostId);
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, posts]);

    // --- 4. MEMBER MANAGEMENT HANDLERS ---
    const handlePromote = async (targetUserId) => {
        try {
            const res = await axios.post(`http://localhost:5001/api/circles/${id}/promote`,
                { targetUserId },
                { withCredentials: true }
            );
            if (res.data.success) {
                fetchCircleData();
            }
        } catch (err) {
            alert(err.response?.data.message || "Failed to promote user");
        }
    };

    const handleRemoveMember = async (targetUserId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            const res = await axios.post(`http://localhost:5001/api/circles/${id}/remove-member`,
                { targetUserId },
                { withCredentials: true }
            );
            if (res.data.success) {
                fetchCircleData();
            }
        } catch (err) {
            alert(err.response?.data.message || "Failed to remove member");
        }
    };

    // --- 5. POST & COMMENT HANDLERS ---
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostData.title.trim() || !newPostData.body.trim()) return;
        setIsSubmitting(true);
        try {
            if (editingPostId) {
                const res = await axios.put(`http://localhost:5001/api/posts/${editingPostId}`, newPostData, { withCredentials: true });
                if (res.data.success) setPosts(prev => prev.map(p => p._id === editingPostId ? res.data.post : p));
            } else {
                const res = await axios.post(`http://localhost:5001/api/posts`, { ...newPostData, circleId: id }, { withCredentials: true });
                if (res.data.success) {
                    setPosts(prev => [res.data.post, ...prev]);
                    socket.emit("new_post", { circleId: id, post: res.data.post });
                }
            }
            closePostModal();
        } catch (err) {
            alert("Could not process post.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setIsCommenting(true);
        try {
            const res = await axios.post(`http://localhost:5001/api/posts/${activeCommentPostId}/comment`, { text: commentText }, { withCredentials: true });
            if (res.data.success) {
                setPosts(prev => prev.map(p => p._id === activeCommentPostId ? { ...p, comments: res.data.comments } : p));
                setCommentText("");
            }
        } catch (err) {
            alert("Could not add comment.");
        } finally {
            setIsCommenting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Delete post permanently?")) return;
        try {
            const res = await axios.delete(`http://localhost:5001/api/posts/${postId}`, { withCredentials: true });
            if (res.data.success) setPosts(prev => prev.filter(p => p._id !== postId));
        } catch (err) {
            alert("Failed to delete post.");
        }
    };

    const openEditModal = (post) => {
        setNewPostData({ title: post.title, body: post.body });
        setEditingPostId(post._id);
        setIsModalOpen(true);
    };

    const closePostModal = () => {
        setIsModalOpen(false);
        setEditingPostId(null);
        setNewPostData({ title: '', body: '' });
    };

    const handleLeave = async () => {
        if (!window.confirm("Are you sure you want to leave this circle?")) return;
        try {
            const res = await axios.post(`http://localhost:5001/api/circles/${id}/leave`, {}, { withCredentials: true });
            if (res.data.success) {
                socket.emit("leave_circle", id);
                navigate('/circles');
            }
        } catch (err) {
            alert(err.response?.data.message || "Failed to leave circle");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-[#509678] gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-medium">Loading your circle...</p>
        </div>
    );

    const isCurrentUserAdmin = circle?.admins?.some(admin => (typeof admin === 'object' ? admin._id : admin) === user?._id);

    return (
        <div className="min-h-screen bg-[#F8FAF9] pb-20 relative">

            {/* Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{editingPostId ? 'Edit Post' : 'Create a Post'}</h2>
                            <button onClick={closePostModal} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handlePostSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Give your post a title..."
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-lg"
                                value={newPostData.title}
                                onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="What's happening in your journey?"
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none h-40 resize-none"
                                value={newPostData.body}
                                onChange={(e) => setNewPostData({ ...newPostData, body: e.target.value })}
                                required
                            />
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#509678] text-white py-4 rounded-2xl font-bold hover:bg-[#3d7a60] transition-all flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingPostId ? 'Save Changes' : 'Publish Post')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Comment Modal */}
            {activeCommentPostId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <MessageSquare size={32} className="text-[#509678]" /> Comments
                            </h2>
                            <button onClick={() => { setActiveCommentPostId(null); setCommentText(""); }} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                <X size={28} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 custom-scrollbar">
                            {posts.find(p => p._id === activeCommentPostId)?.comments?.length > 0 ? (
                                posts.find(p => p._id === activeCommentPostId).comments.map((c, i) => (
                                    <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <img
                                            src={c.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.displayName || 'User')}&background=f0fdf4&color=509678&bold=true`}
                                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex-shrink-0 object-cover"
                                            alt="avatar"
                                        />
                                        <div className="flex-1">
                                            <div className="bg-gray-50 px-5 py-3 rounded-2xl rounded-tl-none">
                                                <p className="text-sm font-black text-[#509678] tracking-wide mb-1">{c.user?.displayName || "Member"}</p>
                                                <p className="text-gray-700 leading-relaxed text-base">{c.text}</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 ml-1 uppercase font-bold tracking-tighter">{new Date(c.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 text-gray-400 italic text-lg">No comments yet.</div>
                            )}
                        </div>
                        <form onSubmit={handleAddComment} className="relative mt-auto">
                            <textarea
                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white rounded-[2rem] outline-none h-32 resize-none transition-all text-gray-700 text-lg shadow-inner"
                                placeholder="Write a supportive comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                required
                            />
                            <button disabled={isCommenting || !commentText.trim()} className="absolute bottom-4 right-4 bg-[#509678] text-white p-4 rounded-2xl font-bold hover:bg-[#3d7a60] transition-all disabled:opacity-50 flex items-center justify-center shadow-lg">
                                {isCommenting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Members List Modal */}
            {isMembersModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Users size={24} className="text-[#509678]" /> Members
                            </h2>
                            <button onClick={() => setIsMembersModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {circle?.members?.map((member) => {
                                const isTargetAdmin = circle.admins.some(admin => (typeof admin === 'object' ? admin._id : admin) === member._id);
                                return (
                                    <div key={member._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all group">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}&background=f0fdf4&color=509678&bold=true`} className="w-11 h-11 rounded-full border-2 border-white shadow-sm object-cover" alt="" />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-800">{member.displayName}</p>
                                                    {isTargetAdmin && <span className="bg-[#509678] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md leading-none">Admin</span>}
                                                </div>
                                                <p className="text-xs text-gray-400">{isTargetAdmin ? "Moderator" : "Member"}</p>
                                            </div>
                                        </div>

                                        {isCurrentUserAdmin && member._id !== user._id && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isTargetAdmin && (
                                                    <button
                                                        onClick={() => handlePromote(member._id)}
                                                        className="p-2 text-[#509678] hover:bg-[#509678]/10 rounded-xl transition-all"
                                                        title="Promote to Admin"
                                                    >
                                                        <ShieldCheck size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                                                    title="Remove Member"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 pt-10">
                <button onClick={() => navigate('/circles')} className="flex items-center gap-2 text-gray-400 hover:text-[#509678] mb-6 font-bold transition-all">
                    <ArrowLeft size={18} /> Circles
                </button>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#509678] font-bold text-xs uppercase">
                                {circle?.visibility === 'public' ? <Globe size={14} /> : <Lock size={14} />} {circle?.visibility}
                            </div>
                            <h1 className="text-4xl font-serif font-bold text-gray-800">{circle?.name}</h1>
                            <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">{circle?.description}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={handleLeave} className="flex items-center justify-center gap-2 border border-gray-100 px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
                                <LogOut size={16} /> Leave
                            </button>
                            <button onClick={() => setIsMembersModalOpen(true)} className="flex items-center justify-center gap-2 border border-gray-100 px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                                <Users size={16} /> Members
                            </button>
                        </div>
                    </div>
                </div>

                <div onClick={() => setIsModalOpen(true)} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 flex items-center gap-4 cursor-pointer hover:border-[#509678] transition-all group">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#509678] group-hover:bg-[#509678] group-hover:text-white transition-all">
                        <Plus size={24} />
                    </div>
                    <span className="text-gray-400 font-medium text-lg">What's on your mind, {user?.displayName?.split(' ')[0] || 'friend'}?</span>
                </div>

                <div className="space-y-6">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <img src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.displayName || 'User')}&background=f0fdf4&color=509678&bold=true`} className="w-10 h-10 rounded-full object-cover" alt="" />
                                        <div>
                                            <div className="font-bold text-gray-800">{post.author?.displayName || "Anonymous Member"}</div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                                {post.updatedAt !== post.createdAt && <span className="ml-2 italic text-[#509678]">(edited)</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {(post.author?._id === user?._id || isCurrentUserAdmin) && (
                                        <div className="flex gap-2">
                                            {post.author?._id === user?._id && <button onClick={() => openEditModal(post)} className="p-2 text-gray-400 hover:text-[#509678] hover:bg-gray-50 rounded-full transition-all"><Pencil size={18} /></button>}
                                            <button onClick={() => handleDeletePost(post._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">{post.title}</h2>
                                <p className="text-gray-600 leading-relaxed mb-6">{post.body}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <button onClick={() => setActiveCommentPostId(post._id)} className="flex items-center gap-2 text-gray-400 hover:text-[#509678] font-bold transition-all">
                                        <MessageSquare size={20} /> {post.comments?.length || 0}
                                    </button>
                                    <Share2 size={20} className="text-gray-400 cursor-pointer hover:text-[#509678]" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-400 font-medium">No posts yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}