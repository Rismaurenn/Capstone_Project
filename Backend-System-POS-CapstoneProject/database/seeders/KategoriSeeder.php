<?php

namespace Database\Seeders;

use App\Models\Kategori;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Coffee', 'icon' => 'Coffee'],
            ['name' => 'Food', 'icon' => 'UtensilsCrossed'],
            ['name' => 'Snacks', 'icon' => 'Cookie'],
            ['name' => 'Beverages', 'icon' => 'GlassWater'],
        ];

        foreach ($categories as $category) {
            Kategori::create($category);
        }
    }
}
