import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { login } from "../store/slices/authSlice";
import { useDispatch } from "react-redux";

export default function LoginForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5001/api/auth/login',
                { email, password },
                { withCredentials: true }
            );

            // Navigate to dashboard upon successful login
            dispatch(login(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in duration-300">
            {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 tracking-widest uppercase">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@gmail.com"
                        className="w-full pl-12 pr-4 py-4 bg-[#F9FBFB] border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#509678]/10 focus:border-[#509678] transition-all"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 tracking-widest uppercase">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-4 bg-[#F9FBFB] border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#509678]/10 focus:border-[#509678] transition-all"
                        required
                    />

                </div>
            </div>

            <button type="submit" className="w-full bg-[#509678] text-white font-medium py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-[#438166] transition-all shadow-lg shadow-[#509678]/20">
                Welcome Back <ArrowRight className="w-5 h-5" />
            </button>
        </form>
    );
}