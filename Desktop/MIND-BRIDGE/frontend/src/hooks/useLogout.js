import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // 1. Backend: Clear the HTTP-only cookie
            await axios.post('http://localhost:5001/api/auth/logout', {}, { withCredentials: true });
        } catch (err) {
            console.error("Backend logout failed, clearing local state anyway:", err);
        } finally {
            // 2. Frontend: Always clear Redux regardless of backend success
            dispatch(logout());

            // 3. Navigation: Redirect to login
            navigate('/');
        }
    };

    return handleLogout;

}