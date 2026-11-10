# Backend System POS - Capstone Project

Backend API untuk aplikasi Point of Sale (POS) menggunakan Laravel 11 dengan Laravel Boost.

## Fitur

- **Manajemen Produk**: CRUD produk dengan kategori dan stok
- **Manajemen Kategori**: Pengelompokan produk berdasarkan kategori
- **Transaksi**: Proses checkout dengan multiple items, diskon, dan berbagai metode pembayaran
- **Manajemen Pelanggan**: Data pelanggan untuk transaksi
- **Loyalty Program**: Program loyalitas pelanggan
- **Diskon**: Sistem diskon dengan kode unik

## Tech Stack

- **Framework**: Laravel 11
- **Database**: SQLite (default) / MySQL / PostgreSQL
- **API**: RESTful API dengan Laravel Sanctum
- **Tools**: Laravel Boost untuk development workflow

## Instalasi

1. Clone repository dan masuk ke direktori backend
```bash
cd Backend-System-POS-CapstoneProject
```

2. Install dependencies
```bash
composer install
```

3. Setup environment
```bash
cp .env.example .env
php artisan key:generate
```

4. Setup database
```bash
# Edit .env untuk konfigurasi database jika perlu
php artisan migrate:fresh --seed
```

5. Start development server
```bash
php artisan serve
```

API akan berjalan di `http://localhost:8000`

## API Endpoints

### Kategori
- `GET /api/kategoris` - List semua kategori
- `GET /api/kategoris/{id}` - Detail kategori dengan produk
- `POST /api/kategoris` - Create kategori baru
- `PUT /api/kategoris/{id}` - Update kategori
- `DELETE /api/kategoris/{id}` - Delete kategori

### Produk
- `GET /api/produks` - List semua produk (support filter: `?kategori_id=1&search=kopi`)
- `GET /api/produks/{id}` - Detail produk
- `POST /api/produks` - Create produk baru
- `PUT /api/produks/{id}` - Update produk
- `DELETE /api/produks/{id}` - Delete produk

### Transaksi
- `GET /api/transaksis` - List semua transaksi (support filter: `?status=completed&dari=2024-01-01&sampai=2024-12-31`)
- `GET /api/transaksis/{id}` - Detail transaksi dengan items
- `POST /api/transaksis` - Create transaksi baru (checkout)
- `PUT /api/transaksis/{id}` - Update status transaksi
- `DELETE /api/transaksis/{id}` - Delete transaksi (return stock)

## API Examples

### Get All Products
```bash
curl http://localhost:8000/api/produks
```

### Get Products by Category
```bash
curl http://localhost:8000/api/produks?kategori_id=1
```

### Create Transaction (Checkout)
```bash
curl -X POST http://localhost:8000/api/transaksis \
  -H "Content-Type: application/json" \
  -d '{
    "pelanggan_id": null,
    "diskon_id": null,
    "subtotal": 100000,
    "diskon": 0,
    "total": 100000,
    "metode_bayar": "cash",
    "status": "completed",
    "items": [
      {
        "produk_id": 1,
        "quantity": 2,
        "subtotal": 50000
      },
      {
        "produk_id": 2,
        "quantity": 1,
        "subtotal": 50000
      }
    ]
  }'
```

Response:
```json
{
  "id": 1,
  "transaction_code": "TRX000001",
  "pelanggan_id": null,
  "diskon_id": null,
  "subtotal": 100000,
  "diskon": 0,
  "total": 100000,
  "metode_bayar": "cash",
  "status": "completed",
  "created_at": "2026-11-03T02:30:00.000000Z",
  "updated_at": "2026-11-03T02:30:00.000000Z",
  "items": [
    {
      "id": 1,
      "transaksi_id": 1,
      "produk_id": 1,
      "quantity": 2,
      "subtotal": 50000,
      "produk": {
        "id": 1,
        "name": "Espresso",
        "price": 25000,
        "stock": 98
      }
    }
  ]
}
```

### Get Transaction History
```bash
curl "http://localhost:8000/api/transaksis?status=completed&dari=2026-11-01&sampai=2026-11-03"
```

## Database Schema

### Models & Relationships

1. **Kategori** (categories untuk UI)
   - `id`, `name`, `icon`, `timestamps`
   - Relasi: `hasMany Produk`

2. **KategoriBarang** (categories untuk inventory)
   - `id`, `nama`, `deskripsi`, `timestamps`
   - Relasi: `hasMany Produk`

3. **Pelanggan** (customers)
   - `id`, `nama`, `email`, `telepon`, `alamat`, `loyalty_program_id`, `timestamps`
   - Relasi: `belongsTo LoyaltyProgram`, `hasMany Transaksi`

4. **LoyaltyProgram**
   - `id`, `nama`, `poin_per_rp`, `batas_minimum_rp`, `diskon_persen`, `aktif`, `timestamps`
   - Relasi: `hasMany Pelanggan`

5. **Diskon** (discount codes)
   - `id`, `kode`, `nama`, `tipe`, `nilai`, `berlaku_mulai`, `berlaku_hingga`, `maksimal_diskon`, `timestamps`
   - Relasi: `hasMany Transaksi`

6. **Produk** (products)
   - `id`, `name`, `sku`, `kategori_id`, `kategori_barang_id`, `price`, `stock`, `image`, `description`, `timestamps`
   - Relasi: `belongsTo Kategori`, `belongsTo KategoriBarang`, `hasMany ItemTransaksi`

7. **Transaksi** (transactions/orders)
   - `id`, `transaction_code`, `pelanggan_id`, `diskon_id`, `subtotal`, `diskon`, `total`, `metode_bayar`, `status`, `timestamps`
   - Relasi: `belongsTo Pelanggan`, `belongsTo Diskon`, `hasMany ItemTransaksi`

8. **ItemTransaksi** (transaction items)
   - `id`, `transaksi_id`, `produk_id`, `quantity`, `subtotal`, `timestamps`
   - Relasi: `belongsTo Transaksi`, `belongsTo Produk`

## Sample Data

Setelah menjalankan `php artisan migrate:fresh --seed`, database akan terisi dengan:

- 4 kategori: Coffee, Food, Snacks, Beverages
- 18 produk dengan berbagai kategori
- 1 admin user (email: admin@pos.com)

## Development

### List All Routes
```bash
php artisan route:list
```

### Database Management
```bash
# Reset database dengan fresh data
php artisan migrate:fresh --seed

# Rollback migrations
php artisan migrate:rollback

# Check migration status
php artisan migrate:status
```

### Testing API
```bash
# Start server
php artisan serve

# Test endpoints with curl or Postman
curl http://localhost:8000/api/kategoris
curl http://localhost:8000/api/produks
```

## CORS Configuration

Untuk menghubungkan dengan frontend React di port 5173, edit `config/cors.php` atau tambahkan di `.env`:

```env
FRONTEND_URL=http://localhost:5173
```

Atau install dan configure `fruitcake/laravel-cors` jika belum ada:
```bash
composer require fruitcake/laravel-cors
```

## Integration dengan Frontend

Frontend React di `Front-End-System-POS-CapstoneProject-main` dapat menggunakan API ini dengan:

1. Update base URL di frontend ke `http://localhost:8000/api`
2. Mapping struktur data:
   - Frontend `products` → Backend `produks`
   - Frontend `categories` → Backend `kategoris`
   - Frontend `orders` → Backend `transaksis`

3. Contoh fetch di React:
```javascript
// Get products
const response = await fetch('http://localhost:8000/api/produks');
const products = await response.json();

// Create transaction
const response = await fetch('http://localhost:8000/api/transaksis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pelanggan_id: null,
    diskon_id: null,
    subtotal: total,
    diskon: 0,
    total: total,
    metode_bayar: 'cash',
    status: 'completed',
    items: cartItems.map(item => ({
      produk_id: item.id,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))
  })
});
```

## Production Deployment

1. Set production environment di `.env`:
```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

2. Optimize Laravel:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. Setup web server (Nginx/Apache) untuk point ke `public/` directory

## License

Capstone Project - Educational Purpose
