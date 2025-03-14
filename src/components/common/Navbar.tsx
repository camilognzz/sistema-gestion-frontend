import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Users from '../service/Users';

function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(Users.isAuthenticated());
    const [isAdmin, setIsAdmin] = useState(Users.isAdmin());
    const navigate = useNavigate();

    useEffect(() => {
        setIsAuthenticated(Users.isAuthenticated());
        setIsAdmin(Users.isAdmin());
    }, []);

    const handleLogout = () => {
        const confirmDelete = window.confirm('Are you sure you want to logout this user?');
        if (confirmDelete) {
            Users.logout();
            setIsAuthenticated(false);  // Actualiza el estado
            setIsAdmin(false);
            navigate('/login'); // Redirige a login
        }
    };

    return (
        <nav>
            <ul>
                {!isAuthenticated && <li><Link to="/">Phegon Dev</Link></li>}
                {isAuthenticated && <li><Link to="/profile">Profile</Link></li>}
                {isAdmin && <li><Link to="/admin/user-management">User Management</Link></li>}
                {isAuthenticated && <li><Link to="/" onClick={handleLogout}>Logout</Link></li>}
            </ul>
        </nav>
    );
}

export default Navbar;
