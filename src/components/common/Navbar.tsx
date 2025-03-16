import { Link, useNavigate } from 'react-router-dom';
import Users from '../service/Users';

function Navbar() {
    const navigate = useNavigate();

    const isAuthenticated = Users.isAuthenticated();
    const isAdmin = Users.isAdmin();

    console.log("isAuthenticated:", isAuthenticated);
    console.log("isAdmin:", isAdmin);


    const handleLogout = () => {
        const confirmDelete = window.confirm('Are you sure you want to logout this user?');
        if (confirmDelete) {
            Users.logout();
            navigate('/login');
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
