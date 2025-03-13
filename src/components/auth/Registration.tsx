import { useState } from 'react';
import Users from '../service/Users';
import { useNavigate } from 'react-router-dom';

function Registration() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token') || ''; // Garantiza que token sea una cadena
            
            if (!token) {
                alert('No authentication token found.');
                return;
            }

            await Users.register(formData, token);

            setFormData({
                name: '',
                email: '',
                password: '',
                role: ''
            });

            alert('User registered successfully');
            navigate('/admin/user-management');

        } catch (error) {
            console.error('Error registering user:', error);
            alert('An error occurred while registering user');
        }
    };

    return (
        <div className="auth-container">
            <h2>Registration</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <input 
                        type="text" 
                        name="role" 
                        value={formData.role} 
                        onChange={handleInputChange} 
                        placeholder="Enter your role" 
                        required 
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Registration;
