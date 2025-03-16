import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Users from '../service/Users';

// Definir la interfaz de usuario
interface User {
    id: number;
    name: string;
    email: string;
}

const Management: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Obtener lista de usuarios
    const fetchUsers = async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found.');
                return;
            }
    
            const usersResponse: User[] = await Users.getAllUsers(token);
    
            if (Array.isArray(usersResponse)) {
                setUsers(usersResponse); // Directamente asignar el array de usuarios
            } else {
                console.error('Invalid response format:', usersResponse);
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
    };
    
    // Eliminar usuario
    const deleteUser = async (userId: number): Promise<void> => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this user?');
            if (!confirmDelete) return;

            const token = localStorage.getItem('token');
            if (!token) {
                alert('No authentication token found.');
                return;
            }

            await Users.deleteUser(userId, token);
            fetchUsers();
        } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
            alert('Error deleting user. Please try again.');
        }
    };

    return (
        <div className="user-management-container">
            <h2>Users Management Page</h2>
            <button className="reg-button">
                <Link to="/register" rel="noopener noreferrer">Add User</Link>
            </button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <button className="delete-button" onClick={() => deleteUser(user.id)}>Delete</button>
                                    <button>
                                        <Link to={`/update-user/${user.id}`} rel="noopener noreferrer">Update</Link>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4}>No users found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Management;
