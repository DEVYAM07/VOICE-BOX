import React from 'react';
import { LogOut } from 'lucide-react';
import { useLogout } from '../hooks/useLogout'; // Adjust path if your hook is elsewhere

const LogoutButton = () => {
    const handleLogout = useLogout(); // Calling your custom hook

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 px-4 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
            title="Logout"
        >
            <LogOut size={18} />
            <span className="hidden md:block">Logout</span>
        </button>
    );
};

export default LogoutButton;