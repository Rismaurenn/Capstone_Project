<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produk extends Model
{
    protected $fillable = [
        'name',
        'sku',
        'kategori_id',
        'kategori_barang_id',
        'price',
        'stock',
        'image',
        'description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }

    public function kategoriBarang(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class);
    }

    public function itemTransaksis(): HasMany
    {
        return $this->hasMany(ItemTransaksi::class);
    }
}
