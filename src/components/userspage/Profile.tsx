import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Users from '../service/Users';
import Navbar from '../common/Navbar';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

function Profile() {
  const [profileInfo, setProfileInfo] = useState<User | null>(null);

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  const fetchProfileInfo = async () => {
    try {
      const token = localStorage.getItem('token') ?? '';

      if (!token) {
        console.error('No authentication token found.');
        return;
      }

      const response: User = await Users.getYourProfile(token);
      console.log('Perfil obtenido:', response); // 👀 Verifica que el role está llegando

      setProfileInfo(response);
    } catch (error) {
      console.error('Error fetching profile information:', error);
    }
  };


  return (
    <>
      <Navbar />
      <div className="profile-page-container">
        <h2>Profile Information</h2>
        {profileInfo ? (
          <>
            <p>Name: {profileInfo.name}</p>
            <p>Email: {profileInfo.email}</p>
            {profileInfo.role === 'ADMIN' && (
              <button>
                <Link to={`/update-user/${profileInfo.id}`}>Update This Profile</Link>
              </button>
            )}
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </>
  );
}

export default Profile;
