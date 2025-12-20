import React, { useState, useEffect } from "react";
import axios from "axios";

export default function FeedbackFeed() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Trending");
    const [searchQuery, setSearchQuery] = useState("");
    const [votedItems, setVotedItems] = useState(new Set());

    // Fetch Data whenever tab changes OR component reloads (triggered by parent key)
    useEffect(() => {
        const fetchFeedbacks = async () => {
            setIsLoading(true);
            try {
                const sortParam = activeTab === "Trending" ? "trending" : "recent";
                // Ensure Port 5001 matches your server.js
                const url = `http://localhost:5001/api/feedback?sort=${sortParam}&search=${searchQuery}`;

                const res = await axios.get(url);
                setFeedbacks(res.data);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchFeedbacks();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [activeTab, searchQuery]);

    // Handle Upvote
    const handleUpvote = async (id) => {
        const isVoted = votedItems.has(id);
        const action = isVoted ? "decrement" : "increment";

        // Optimistic Update
        setFeedbacks((prev) =>
            prev.map((item) =>
                item._id === id
                    ? { ...item, upvotes: item.upvotes + (action === "increment" ? 1 : -1) }
                    : item
            )
        );

        setVotedItems((prev) => {
            const newSet = new Set(prev);
            if (isVoted) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });

        try {
            await axios.put(`http://localhost:5001/api/feedback/${id}/upvote`, { action });
        } catch (error) { console.error("Upvote failed:", error); }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-10">

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <div className="flex bg-gray-900/80 p-2 rounded-2xl border border-gray-800">
                    {["Trending", "Recent"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl text-base font-bold transition-all ${activeTab === tab ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search feedback..."
                        className="w-full pl-6 pr-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-lg text-gray-200 focus:border-purple-500/50 outline-none"
                    />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(n => <div key={n} className="h-56 bg-gray-900/40 rounded-3xl border border-gray-800" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {feedbacks.length === 0 ? <p className="text-gray-500 col-span-full text-center">No feedback yet.</p> :
                        feedbacks.map((item) => (
                            <div key={item._id} className="group relative p-8 bg-gray-900 rounded-3xl border border-gray-800 hover:border-purple-500/30 transition-all shadow-xl">
                                <p className="text-gray-200 text-lg font-medium leading-relaxed mb-6 break-words">{item.message}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                                    <button
                                        onClick={() => handleUpvote(item._id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${votedItems.has(item._id) ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        ▲ {item.upvotes || 0}
                                    </button>
                                    <span className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}