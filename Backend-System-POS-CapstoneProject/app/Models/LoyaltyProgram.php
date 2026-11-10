<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyProgram extends Model
{
    protected $fillable = [
        'nama',
        'poin_per_rupiah',
        'rata_poin_ke_rupiah',
        'aktif',
    ];

    protected $casts = [
        'poin_per_rupiah' => 'decimal:4',
        'rata_poin_ke_rupiah' => 'decimal:4',
        'aktif' => 'boolean',
    ];

    public function pelanggans(): HasMany
    {
        return $this->hasMany(Pelanggan::class);
    }
}
