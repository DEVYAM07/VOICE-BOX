import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { login } from "../store/slices/authSlice";

export default function GoogleAuth() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSuccess = async (Response) => {
        try {
            // 1. Hold the response in a variable
            const response = await axios.post('http://localhost:5001/api/auth/google',
                { tokenId: Response.credential },
                { withCredentials: true }
            );

            // 2. Check if status is 200
            if (response.status === 200) {
                const { isProfileSetup } = response.data;

                if (isProfileSetup) {
                    dispatch(login(response.data.user));
                    navigate('/dashboard');
                }
                else {
                    navigate('/setup-profile');
                }
            }
        } catch (err) {
            // 3. Extract exact error message from backend
            const errorMsg = err.response?.data?.message || "Google Auth Failed";
            console.error("Authentication Error:", errorMsg);
        }
    };

    const handleError = () => {
        console.error("Google Sign-In was unsuccessful");
    };

    return (
        <div className="w-full flex justify-center py-4">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="outline"
                shape="pill"
                width="350px"

            />
        </div>
    );
}