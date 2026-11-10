<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemTransaksi extends Model
{
    protected $fillable = [
        'transaksi_id',
        'produk_id',
        'diskon_id',
        'name',
        'price',
        'quantity',
        'note',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class);
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class);
    }

    public function diskon(): BelongsTo
    {
        return $this->belongsTo(Diskon::class);
    }
}
