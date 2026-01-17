import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import LoginForm from '../components/login';
import SignupForm from '../components/signup';
import GoogleAuth from '../components/googleAuth'; // Import the new component

export default function AuthContainer() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8F3EE] rounded-full blur-[120px] -z-10 opacity-60" />

            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 relative z-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-[#509678] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#509678]/20">
                        <Leaf className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-[#2D3748]">Mindful</h1>
                    <p className="text-gray-400 mt-1 text-sm tracking-wide text-center">
                        {isLogin ? "Welcome back to your space" : "Begin your journey to wellness"}
                    </p>
                </div>

                {/* The Toggle Switcher */}
                <div className="flex bg-[#E8F3EE] p-1.5 rounded-2xl mb-8 border border-transparent">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${isLogin
                            ? 'bg-white text-[#2D3748] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${!isLogin
                            ? 'bg-white text-[#2D3748] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Dynamic Component Rendering */}
                <div className="min-h-[300px]">
                    {isLogin ? <LoginForm /> : <SignupForm />}

                    {/* OPTIONAL: If you want it visible on both forms without editing them */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 opacity-20 mb-4">
                            <div className="h-[1px] bg-gray-500 flex-1"></div>
                            <span className="text-[10px] uppercase font-bold text-gray-500">OR</span>
                            <div className="h-[1px] bg-gray-500 flex-1"></div>
                        </div>
                        <GoogleAuth />
                    </div>
                </div>

                {/* Toggle Link */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#509678] font-bold hover:underline underline-offset-4 decoration-2"
                        >
                            {isLogin ? "Sign up now" : "Sign in here"}
                        </button>
                    </p>
                </div>
            </div>

            <p className="absolute bottom-6 text-gray-300 text-[10px] font-bold tracking-[0.2em] uppercase">
                Mindful © 2025
            </p>
        </div>
    );
}