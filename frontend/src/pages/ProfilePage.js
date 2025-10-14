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

  if (!profile) return <div>Đang tải...</div>;

  const avatarSrc = profile.avatar_url ? `${api.defaults.baseURL}${profile.avatar_url}` : null;

  return (
    <div className="profile-page">
      <h1>Thông tin cá nhân</h1>
      {avatarSrc && <img src={avatarSrc} alt="Avatar" style={{ borderRadius: '50%', width: '100px', height: '100px' }} />}
      <p><strong>Họ và tên:</strong> {profile.full_name}</p>
      <p><strong>Tuổi:</strong> {profile.age}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Số điện thoại:</strong> {profile.phone}</p>
      <button onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
      {isEditing && (
        <ProfileForm user={profile} onFormSubmit={handleFormSubmit} onCancel={() => setIsEditing(false)} />
      )}
      <h2>Danh sách playlist</h2>
      <ul>
        {playlists.map(pl => (
          <li key={pl.id}>{pl.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ProfilePage;