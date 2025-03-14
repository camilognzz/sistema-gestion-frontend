import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Users from '../service/Users';

function Update() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    if (userId) {
      fetchUserDataById(userId);
    }
  }, [userId]);

  const fetchUserDataById = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found.');
        return;
      }

      const response = await Users.getUserById(userId, token);
      console.log('✅ API Response:', response);

      const { name, email, role } = response;
      setUserData({ name, email, role: role || '' });

    } catch (error) {
      console.error('❌ Error fetching user data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const confirmUpdate = window.confirm('Are you sure you want to update this user?');
      if (confirmUpdate) {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No authentication token found.');
          return;
        }

        if (!userId) {
          console.error('❌ userId is undefined');
          return;
        }

        const res = await Users.updateUser(Number(userId), userData, token);
        console.log('✅ User updated:', res);
        navigate('/admin/user-management');
      }
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      alert('Error updating user');
    }
  };

  return (
    <div className="auth-container">
      <h2>Update User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={userData.name} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={userData.email} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <input type="text" name="role" value={userData.role} onChange={handleInputChange} />
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default Update;
