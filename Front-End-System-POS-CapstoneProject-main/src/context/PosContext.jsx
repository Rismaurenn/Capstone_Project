import { createContext, useContext, useState, useEffect } from 'react';
import { produkAPI, kategoriAPI, transaksiAPI, authAPI } from '../services/api';
import { mapProductFromAPI, mapCategoryFromAPI, mapTransactionFromAPI } from '../utils/apiMapper';

const PosContext = createContext();

export const PosProvider = ({ children }) => {
  // User & Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Products & Categories state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation
  const [activeTab, setActiveTab] = useState('pos');

  // POS State
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('01');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Fetch data dari API saat mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchInitialData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch products, categories, dan transactions secara parallel
      const [productsRes, categoriesRes] = await Promise.all([
        produkAPI.getAll(),
        kategoriAPI.getAll(),
      ]);

      const mappedProducts = (productsRes.data.data || []).map(mapProductFromAPI);
      const mappedCategories = (categoriesRes.data.data || []).map(mapCategoryFromAPI);

      setProducts(mappedProducts);
      setCategories([{ id: 'all', name: 'Semua Menu', icon: 'Grid' }, ...mappedCategories]);

      // Fetch transactions hanya untuk admin dan keuangan
      if (user && (user.role === 'admin' || user.role === 'keuangan')) {
        try {
          const transactionsRes = await transaksiAPI.getAll();
          const mappedTransactions = (transactionsRes.data.data || []).map(mapTransactionFromAPI);
          setTransactions(mappedTransactions);
        } catch (err) {
          console.log('User tidak punya akses ke history transaksi');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data. Pastikan backend berjalan.');
      
      // Jika error 401, token expired
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshProducts = async () => {
    try {
      const response = await produkAPI.getAll();
      const mappedProducts = (response.data.data || []).map(mapProductFromAPI);
      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error refreshing products:', err);
    }
  };

  const refreshTransactions = async () => {
    try {
      const response = await transaksiAPI.getAll();
      const mappedTransactions = (response.data.data || []).map(mapTransactionFromAPI);
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('Error refreshing transactions:', err);
    }
  };

  // Auth operations
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      setProducts([]);
      setCategories([]);
      setTransactions([]);
      setCart([]);
    }
  };

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Stok produk habis');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.produk_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Stok ${product.name} tidak mencukupi (sisa ${product.stock})`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.produk_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          produk_id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
          stock: product.stock,
          quantity: 1,
          note: '',
        },
      ];
    });
  };

  const updateCartQty = (produkId, delta) => {
    setCart((prevCart) => {
      const target = prevCart.find((item) => item.produk_id === produkId);
      if (!target) return prevCart;

      const product = products.find((p) => p.id === produkId);
      const newQty = target.quantity + delta;

      if (newQty <= 0) {
        return prevCart.filter((item) => item.produk_id !== produkId);
      }

      if (product && newQty > product.stock) {
        alert(`Maksimal stok tersedia adalah ${product.stock}`);
        return prevCart;
      }

      return prevCart.map((item) =>
        item.produk_id === produkId ? { ...item, quantity: newQty } : item
      );
    });
  };

  const removeFromCart = (produkId) => {
    setCart((prevCart) => prevCart.filter((item) => item.produk_id !== produkId));
  };

  const updateCartNote = (produkId, note) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.produk_id === produkId ? { ...item, note } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setDiscount(0);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const grandTotal = Math.max(0, subtotal + tax - discount);

  // Complete transaction via API
  const completeTransaction = async ({ paymentMethod, amountPaid, change }) => {
    try {
      const transactionData = {
        order_type: orderType,
        table_number: orderType === 'dine-in' ? tableNumber : null,
        customer_name: customerName || 'Pelanggan Umum',
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        items: cart.map(item => ({
          produk_id: item.produk_id,
          quantity: item.quantity,
          note: item.note || null,
        })),
      };

      const response = await transaksiAPI.create(transactionData);
      const newTrx = mapTransactionFromAPI(response.data.data);

      // Update local state
      setTransactions((prev) => [newTrx, ...prev]);
      
      // Refresh products untuk update stok
      await refreshProducts();

      // Show receipt
      setActiveReceipt(newTrx);
      setIsPaymentModalOpen(false);

      // Reset cart
      clearCart();

      return newTrx;
    } catch (err) {
      console.error('Error completing transaction:', err);
      alert('Gagal menyelesaikan transaksi. Silakan coba lagi.');
      throw err;
    }
  };

  // Product CRUD (admin only)
  const addProduct = async (newProductData) => {
    try {
      const response = await produkAPI.create(newProductData);
      await refreshProducts();
      return response.data.data;
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Gagal menambah produk');
      throw err;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const response = await produkAPI.update(id, updatedData);
      await refreshProducts();
      return response.data.data;
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Gagal mengupdate produk');
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await produkAPI.delete(id);
      await refreshProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Gagal menghapus produk');
      throw err;
    }
  };

  // Format currency helper
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <PosContext.Provider
      value={{
        user,
        products,
        categories,
        transactions,
        loading,
        error,
        activeTab,
        setActiveTab,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        updateCartNote,
        clearCart,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        discount,
        setDiscount,
        subtotal,
        tax,
        grandTotal,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        activeReceipt,
        setActiveReceipt,
        completeTransaction,
        addProduct,
        updateProduct,
        deleteProduct,
        formatIDR,
        handleLogout,
        refreshProducts,
        refreshTransactions,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
