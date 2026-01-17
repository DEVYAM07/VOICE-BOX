import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Leaf, Plus, Loader2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';



const SUGGESTED_INTERESTS = [
    "Anxiety",
    "Productivity",
    "Mindfulness",
    "Sleep Quality",
    "Stress Management",
    "Focus",
    "Self-Care",
    "Social Wellness",
    "Emotional Balance"
];

export default function SetupProfile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [interests, setInterests] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleInterest = (interest) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else {
            setInterests([...interests, interest]);
        }
    };

    const handleFinalSubmit = async () => {
        if (!displayName) {
            alert("Please enter a display name");
            return;
        }

        setLoading(true);
        try {
            let avatarUrl = "";
            if (avatarFile) {
                const { data: config } = await axios.get('http://localhost:5001/api/upload/get-signature', { withCredentials: true });
                const formData = new FormData();
                formData.append("file", avatarFile);
                formData.append("api_key", config.apiKey);
                formData.append("timestamp", config.timestamp);
                formData.append("signature", config.signature);
                formData.append("folder", config.folder);

                const uploadResponse = await axios.post(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, formData);
                avatarUrl = uploadResponse.data.secure_url;
            }

            const response = await axios.patch('http://localhost:5001/api/upload/complete-setup', {
                displayName,
                bio,
                interests,
                avatarUrl: avatarUrl,
                isProfileSetup: true
            }, { withCredentials: true });

            if (response.data.success) {
                dispatch(login(response.data.user));
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Setup failed:", err);
            alert(err.response?.data?.message || "Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
                        <Loader2 className="animate-spin text-[#509678] w-10 h-10" />
                    </div>
                )}

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E8F3EE] rounded-xl mb-4">
                        <Leaf className="text-[#509678] w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-[#2D3748]">Welcome to Mindful</h1>
                    <p className="text-gray-400 text-sm mt-1">Personalize your journey</p>
                </div>

                <div className="space-y-5"> {/* Reduced spacing from space-y-6 */}
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} disabled={loading} />
                        </div>
                        <span className="text-[10px] font-bold text-[#509678] uppercase mt-2 tracking-widest">Add Photo</span>
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Display Name</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="w-full px-5 py-3 rounded-2xl bg-[#F8FAF9] border-transparent focus:bg-white focus:border-[#509678] transition-all outline-none text-sm" disabled={loading} />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Your goals..." className="w-full px-5 py-3 rounded-2xl bg-[#F8FAF9] border-transparent focus:bg-white focus:border-[#509678] transition-all outline-none text-sm resize-none h-20" disabled={loading} />
                    </div>

                    {/* Interests Selection */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Interests/Tags</label>

                        {/* Selected Tags Display - Reduced mb-3 to mb-1 */}
                        <div className="flex flex-wrap gap-2 mb-1 min-h-[10px]">
                            {interests.map((tag, index) => (
                                <span key={index} className="flex items-center gap-1 px-3 py-1 bg-[#E8F3EE] text-[#509678] text-xs font-semibold rounded-full border border-[#509678]/10 animate-in zoom-in-95">
                                    {tag}
                                    <button onClick={() => toggleInterest(tag)} className="hover:text-red-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Dropdown Trigger */}
                        <div
                            onClick={() => !loading && setShowDropdown(!showDropdown)}
                            className="w-full px-5 py-3 rounded-2xl bg-[#F8FAF9] border-transparent flex justify-between items-center cursor-pointer hover:bg-[#f0f4f2] transition-all border-2 border-transparent focus-within:border-[#509678]"
                        >
                            <span className="text-sm text-gray-500">
                                {interests.length === 0 ? "Select your interests" : `${interests.length} areas selected`}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                    {SUGGESTED_INTERESTS.map((item) => (
                                        <div
                                            key={item}
                                            onClick={() => toggleInterest(item)}
                                            className={`px-5 py-3 text-sm cursor-pointer transition-colors flex justify-between items-center border-b border-gray-50 last:border-none ${interests.includes(item) ? 'bg-[#E8F3EE] text-[#509678] font-bold' : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {item}
                                            {interests.includes(item) && <Plus className="w-4 h-4 rotate-45" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleFinalSubmit}
                        disabled={loading}
                        className="w-full bg-[#509678] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#509678]/20 hover:bg-[#3d7a60] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving Profile..." : "Complete Setup"}
                    </button>
                </div>
            </div>
        </div>
    );
}