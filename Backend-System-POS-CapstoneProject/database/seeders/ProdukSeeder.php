<?php

namespace Database\Seeders;

use App\Models\Produk;
use App\Models\Kategori;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProdukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coffeeId = Kategori::where('name', 'Coffee')->first()->id;
        $foodId = Kategori::where('name', 'Food')->first()->id;
        $snacksId = Kategori::where('name', 'Snacks')->first()->id;
        $beveragesId = Kategori::where('name', 'Beverages')->first()->id;

        $products = [
            // Coffee
            ['name' => 'Espresso', 'sku' => 'ESP001', 'kategori_id' => $coffeeId, 'price' => 25000, 'stock' => 100, 'image' => '/images/espresso.jpg', 'description' => 'Strong and bold espresso shot'],
            ['name' => 'Cappuccino', 'sku' => 'CAP001', 'kategori_id' => $coffeeId, 'price' => 35000, 'stock' => 100, 'image' => '/images/cappuccino.jpg', 'description' => 'Creamy cappuccino with milk foam'],
            ['name' => 'Latte', 'sku' => 'LAT001', 'kategori_id' => $coffeeId, 'price' => 38000, 'stock' => 100, 'image' => '/images/latte.jpg', 'description' => 'Smooth latte with steamed milk'],
            ['name' => 'Americano', 'sku' => 'AME001', 'kategori_id' => $coffeeId, 'price' => 28000, 'stock' => 100, 'image' => '/images/americano.jpg', 'description' => 'Classic americano coffee'],
            ['name' => 'Mocha', 'sku' => 'MOC001', 'kategori_id' => $coffeeId, 'price' => 42000, 'stock' => 100, 'image' => '/images/mocha.jpg', 'description' => 'Chocolate flavored coffee'],
            ['name' => 'Macchiato', 'sku' => 'MAC001', 'kategori_id' => $coffeeId, 'price' => 32000, 'stock' => 100, 'image' => '/images/macchiato.jpg', 'description' => 'Espresso with milk foam'],

            // Food
            ['name' => 'Croissant', 'sku' => 'CRO001', 'kategori_id' => $foodId, 'price' => 22000, 'stock' => 50, 'image' => '/images/croissant.jpg', 'description' => 'Buttery French croissant'],
            ['name' => 'Sandwich', 'sku' => 'SAN001', 'kategori_id' => $foodId, 'price' => 45000, 'stock' => 50, 'image' => '/images/sandwich.jpg', 'description' => 'Fresh club sandwich'],
            ['name' => 'Bagel', 'sku' => 'BAG001', 'kategori_id' => $foodId, 'price' => 28000, 'stock' => 50, 'image' => '/images/bagel.jpg', 'description' => 'Toasted bagel with cream cheese'],
            ['name' => 'Pasta', 'sku' => 'PAS001', 'kategori_id' => $foodId, 'price' => 58000, 'stock' => 30, 'image' => '/images/pasta.jpg', 'description' => 'Italian style pasta'],

            // Snacks
            ['name' => 'Cookies', 'sku' => 'COO001', 'kategori_id' => $snacksId, 'price' => 18000, 'stock' => 80, 'image' => '/images/cookies.jpg', 'description' => 'Chocolate chip cookies'],
            ['name' => 'Muffin', 'sku' => 'MUF001', 'kategori_id' => $snacksId, 'price' => 25000, 'stock' => 80, 'image' => '/images/muffin.jpg', 'description' => 'Blueberry muffin'],
            ['name' => 'Brownie', 'sku' => 'BRO001', 'kategori_id' => $snacksId, 'price' => 28000, 'stock' => 80, 'image' => '/images/brownie.jpg', 'description' => 'Rich chocolate brownie'],
            ['name' => 'Donut', 'sku' => 'DON001', 'kategori_id' => $snacksId, 'price' => 20000, 'stock' => 80, 'image' => '/images/donut.jpg', 'description' => 'Glazed donut'],

            // Beverages
            ['name' => 'Orange Juice', 'sku' => 'ORA001', 'kategori_id' => $beveragesId, 'price' => 22000, 'stock' => 60, 'image' => '/images/orange-juice.jpg', 'description' => 'Fresh squeezed orange juice'],
            ['name' => 'Iced Tea', 'sku' => 'ICE001', 'kategori_id' => $beveragesId, 'price' => 18000, 'stock' => 60, 'image' => '/images/iced-tea.jpg', 'description' => 'Refreshing iced tea'],
            ['name' => 'Smoothie', 'sku' => 'SMO001', 'kategori_id' => $beveragesId, 'price' => 35000, 'stock' => 60, 'image' => '/images/smoothie.jpg', 'description' => 'Mixed fruit smoothie'],
            ['name' => 'Mineral Water', 'sku' => 'MIN001', 'kategori_id' => $beveragesId, 'price' => 8000, 'stock' => 100, 'image' => '/images/water.jpg', 'description' => 'Pure mineral water'],
        ];

        foreach ($products as $product) {
            Produk::create($product);
        }
    }
}
