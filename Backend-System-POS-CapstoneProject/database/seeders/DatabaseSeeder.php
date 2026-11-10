<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Buat users dengan role berbeda
        \App\Models\User::create([
            'name' => 'Admin Utama',
            'username' => 'admin',
            'email' => 'admin@pos.test',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'shift' => null,
        ]);

        \App\Models\User::create([
            'name' => 'Budi Santoso',
            'username' => 'kasir1',
            'email' => 'kasir1@pos.test',
            'password' => bcrypt('password'),
            'role' => 'kasir',
            'shift' => 'pagi',
        ]);

        \App\Models\User::create([
            'name' => 'Siti Nurhaliza',
            'username' => 'kasir2',
            'email' => 'kasir2@pos.test',
            'password' => bcrypt('password'),
            'role' => 'kasir',
            'shift' => 'siang',
        ]);

        \App\Models\User::create([
            'name' => 'Ahmad Keuangan',
            'username' => 'keuangan',
            'email' => 'keuangan@pos.test',
            'password' => bcrypt('password'),
            'role' => 'keuangan',
            'shift' => null,
        ]);

        $this->call([
            KategoriSeeder::class,
            ProdukSeeder::class,
        ]);
    }
}
