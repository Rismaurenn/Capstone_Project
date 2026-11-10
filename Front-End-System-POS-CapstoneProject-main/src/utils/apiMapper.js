/**
 * Helper untuk mapping data dari API Laravel ke format Frontend
 */

export const mapProductFromAPI = (apiProduct) => {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    sku: apiProduct.sku || `MENU-${apiProduct.id}`,
    description: apiProduct.deskripsi || apiProduct.description || '',
    price: Number(apiProduct.harga || apiProduct.price || 0),
    stock: Number(apiProduct.stok || apiProduct.stock || 0),
    category: apiProduct.kategori_id || apiProduct.category_id || 'all',
    image: apiProduct.image_path || apiProduct.image || '/placeholder.png',
  };
};

export const mapCategoryFromAPI = (apiCategory) => {
  return {
    id: apiCategory.id,
    name: apiCategory.name || apiCategory.nama,
    icon: apiCategory.icon || 'Utensils',
  };
};

export const mapTransactionFromAPI = (apiTransaction) => {
  return {
    id: apiTransaction.id,
    transactionCode: apiTransaction.transaction_code,
    orderType: apiTransaction.order_type,
    tableNumber: apiTransaction.table_number,
    customerName: apiTransaction.customer_name || 'Pelanggan Umum',
    subtotal: Number(apiTransaction.subtotal || 0),
    discount: Number(apiTransaction.diskon || apiTransaction.discount || 0),
    tax: Number(apiTransaction.tax || apiTransaction.pajak || 0),
    total: Number(apiTransaction.total || 0),
    paymentMethod: apiTransaction.metode_bayar || apiTransaction.payment_method,
    amountPaid: Number(apiTransaction.amount_paid || apiTransaction.jumlah_bayar || 0),
    change: Number(apiTransaction.change || apiTransaction.kembalian || 0),
    status: apiTransaction.status,
    kasirId: apiTransaction.kasir_id,
    kasirName: apiTransaction.kasir?.name || 'Kasir',
    items: (apiTransaction.items || apiTransaction.item_transaksis || []).map(mapTransactionItemFromAPI),
    createdAt: apiTransaction.created_at,
    updatedAt: apiTransaction.updated_at,
  };
};

export const mapTransactionItemFromAPI = (apiItem) => {
  return {
    id: apiItem.id,
    produkId: apiItem.produk_id,
    name: apiItem.name || apiItem.produk?.name || 'Item',
    price: Number(apiItem.price || apiItem.harga || 0),
    quantity: Number(apiItem.quantity || apiItem.qty || 1),
    subtotal: Number(apiItem.subtotal || 0),
    note: apiItem.note || apiItem.catatan || null,
  };
};

export const mapProductToAPI = (frontendProduct) => {
  return {
    name: frontendProduct.name,
    sku: frontendProduct.sku,
    deskripsi: frontendProduct.description || '',
    harga: Number(frontendProduct.price),
    stok: Number(frontendProduct.stock),
    kategori_id: frontendProduct.category || frontendProduct.category_id,
    image_path: frontendProduct.image || null,
  };
};

export const mapTransactionToAPI = (frontendTransaction) => {
  return {
    order_type: frontendTransaction.orderType || frontendTransaction.order_type,
    table_number: frontendTransaction.tableNumber || frontendTransaction.table_number || null,
    customer_name: frontendTransaction.customerName || frontendTransaction.customer_name || 'Pelanggan Umum',
    payment_method: frontendTransaction.paymentMethod || frontendTransaction.payment_method,
    amount_paid: Number(frontendTransaction.amountPaid || frontendTransaction.amount_paid),
    items: (frontendTransaction.items || []).map(item => ({
      produk_id: item.produk_id || item.produkId,
      quantity: Number(item.quantity),
      note: item.note || null,
    })),
  };
};
