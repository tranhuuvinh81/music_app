// frontend/src/pages/ProfilePage.js (new file)
import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import ProfileForm from '../components/ProfileForm';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (user) {
      api.get(`/api/users/${user.id}`)
        .then(res => setProfile(res.data))
        .catch(err => console.error(err));

      api.get(`/api/playlists/user/${user.id}`)
        .then(res => setPlaylists(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleFormSubmit = () => {
    setIsEditing(false);
    api.get(`/api/users/${user.id}`)
      .then(res => setProfile(res.data))
      .catch(err => console.error(err));
  };

  if (!profile) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;

  const avatarSrc = profile.avatar_url ? `${api.defaults.baseURL}${profile.avatar_url}` : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Thông tin cá nhân</h1>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                <p className="text-lg font-medium">{profile.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tuổi</p>
                <p className="text-lg font-medium">{profile.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-lg font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                <p className="text-lg font-medium">{profile.phone}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <ProfileForm 
              user={profile} 
              onFormSubmit={handleFormSubmit} 
              onCancel={() => setIsEditing(false)} 
            />
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Playlist của bạn</h3>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map(pl => (
              <div key={pl.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="font-medium">{pl.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Bạn chưa có playlist nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;