import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('user');
  
  // Cek apakah user sudah login
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Jika ada pembatasan role, cek apakah user punya akses
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h2>Akses Ditolak</h2>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <button 
            onClick={() => window.history.back()}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#667eea',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Kembali
          </button>
        </div>
      );
    }
    
    return children;
  } catch (error) {
    // Jika parsing user gagal, redirect ke login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
