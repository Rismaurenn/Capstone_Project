<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaksi extends Model
{
    protected $fillable = [
        'transaction_code',
        'date',
        'user_id',
        'order_type',
        'table_number',
        'pelanggan_id',
        'customer_name',
        'subtotal',
        'tax',
        'discount',
        'total',
        'payment_method',
        'amount_paid',
        'change',
        'status',
    ];

    protected $casts = [
        'date' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class);
    }

    public function itemTransaksis(): HasMany
    {
        return $this->hasMany(ItemTransaksi::class);
    }
}
