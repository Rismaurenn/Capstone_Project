<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Diskon extends Model
{
    protected $fillable = [
        'kode',
        'nama',
        'tipe',
        'nilai',
        'mulai_berlaku',
        'akhir_berlaku',
        'kuota',
        'used_quota',
        'aktif',
    ];

    protected $casts = [
        'nilai' => 'decimal:2',
        'mulai_berlaku' => 'datetime',
        'akhir_berlaku' => 'datetime',
        'aktif' => 'boolean',
    ];

    public function itemTransaksis(): HasMany
    {
        return $this->hasMany(ItemTransaksi::class);
    }
}
