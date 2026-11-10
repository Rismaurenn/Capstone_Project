import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PosProvider, usePos } from './context/PosContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProductCatalog from './components/pos/ProductCatalog';
import CartOrder from './components/pos/CartOrder';
import PaymentModal from './components/pos/PaymentModal';
import ReceiptModal from './components/pos/ReceiptModal';
import ProductManagement from './components/products/ProductManagement';
import TransactionHistory from './components/history/TransactionHistory';
import SimpleReports from './components/reports/SimpleReports';

function PosMainContent() {
  const { activeTab, loading, error } = usePos();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Memuat data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '10px',
        color: '#c33'
      }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="pos-app-layout">
      <Sidebar />
      
      <div className="pos-main-container">
        <Navbar />
        
        <main className="pos-content-area">
          {activeTab === 'pos' && (
            <div className="pos-cashier-screen">
              <ProductCatalog />
              <CartOrder />
            </div>
          )}
          
          {activeTab === 'products' && <ProductManagement />}
          
          {activeTab === 'history' && <TransactionHistory />}
          
          {activeTab === 'reports' && <SimpleReports />}
        </main>
      </div>
      
      <PaymentModal />
      <ReceiptModal />
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public route - Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes - Butuh authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PosProvider>
                <PosMainContent />
              </PosProvider>
            </ProtectedRoute>
          }
        />
        
        {/* Redirect any unknown route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return <AppContent />;
}
