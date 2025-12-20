import React, { useState } from 'react';
import axios from 'axios';

// Receive the onSuccess function from Dashboard
const FeedbackForm = ({ onSuccess }) => {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const MAX_CHARS = 500;

    const handleChange = (e) => {
        if (e.target.value.length <= MAX_CHARS) {
            setFeedback(e.target.value);
        }
    };

    const handleSubmit = async () => {
        if (!feedback.trim()) return;
        setIsSubmitting(true);

        try {
            const res = await axios.post("http://localhost:5001/api/feedback", { message: feedback });

            if (res.data.success) {
                setFeedback(""); // Clear input
                alert("Feedback submitted!");

                // ✅ CRITICAL: Tell Dashboard to refresh the feed
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error) {
            console.error("Error submitting:", error);
            alert("Server error. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center bg-black">
            <div className="relative group w-full max-w-lg">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                <div className="relative bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl">
                    {/* Header */}
                    <div className="flex gap-3 mb-4">
                        <div className="mt-1 p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-white text-lg font-semibold">Share Feedback</h2>
                            <p className="text-gray-400 text-sm">Your voice matters. Stay anonymous.</p>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="relative mb-6">
                        <textarea
                            value={feedback}
                            onChange={handleChange}
                            className="w-full h-32 bg-gray-950 text-gray-200 border border-purple-500/30 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-600"
                            placeholder="Share ideas or suggestions..."
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                            {feedback.length}/{MAX_CHARS}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !feedback}
                        className={`w-full py-3 rounded-xl font-medium text-white shadow-lg transition-all ${!feedback ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 active:scale-95'
                            }`}
                    >
                        {isSubmitting ? 'Sending...' : 'Submit Anonymously'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;