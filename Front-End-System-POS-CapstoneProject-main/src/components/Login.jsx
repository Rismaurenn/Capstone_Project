import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error saat user mulai ketik
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi input
    if (!formData.username || !formData.password) {
      setError('Username dan password harus diisi');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(formData);
      
      // Simpan token dan user data ke localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect ke halaman utama
      navigate('/');
      
      // Reload untuk update context
      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        if (err.response.status === 422) {
          setError('Username atau password salah');
        } else if (err.response.status === 401) {
          setError('Username atau password salah');
        } else {
          setError('Terjadi kesalahan. Silakan coba lagi.');
        }
      } else if (err.request) {
        setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>POS System</h1>
          <p>Capstone Project</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-credentials">Demo Credentials:</p>
          <div className="credentials-list">
            <p><strong>Admin:</strong> admin / password</p>
            <p><strong>Kasir 1:</strong> kasir1 / password</p>
            <p><strong>Kasir 2:</strong> kasir2 / password</p>
            <p><strong>Keuangan:</strong> keuangan / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
