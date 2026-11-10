import { useState, useEffect } from 'react';
import { Clock, LogOut, User } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const { user, handleLogout } = usePos();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleLogoutClick = async () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      await handleLogout();
      navigate('/login');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return '#667eea';
      case 'kasir':
        return '#48bb78';
      case 'keuangan':
        return '#ed8936';
      default:
        return '#718096';
    }
  };

  return (
    <header className="pos-top-navbar">
      <div className="navbar-left">
        <div className="status-chip">
          <span className="live-pulsing-dot"></span>
          <span>Outlet Buka • Kasir Aktif</span>
        </div>
        <span className="store-location-text">Cabang Utama Diponegoro</span>
      </div>

      <div className="navbar-right">
        <div className="datetime-display">
          <Clock size={16} className="clock-icon" />
          <span className="time-val">{formattedTime}</span>
          <span className="date-sep">•</span>
          <span className="date-val">{formattedDate}</span>
        </div>

        {user && (
          <>
            <div className="user-info-chip" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f7fafc',
              borderRadius: '8px',
              marginLeft: '16px',
            }}>
              <User size={16} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#2d3748' }}>
                  {user.name}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: getRoleBadgeColor(user.role),
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogoutClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: '#718096',
                marginLeft: '12px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.borderColor = '#cbd5e0';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
