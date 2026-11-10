<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriBarang extends Model
{
    protected $fillable = [
        'nama',
        'deskripsi',
    ];

    public function produks(): HasMany
    {
        return $this->hasMany(Produk::class);
    }
}
