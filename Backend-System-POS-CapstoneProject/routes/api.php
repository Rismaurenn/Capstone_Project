<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\ProdukController;
use App\Http\Controllers\Api\TransaksiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth routes (public)
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Kategori - semua role bisa akses
    Route::apiResource('kategoris', KategoriController::class);

    // Produk - admin bisa semua, kasir hanya lihat
    Route::get('/produks', [ProdukController::class, 'index']);
    Route::get('/produks/{produk}', [ProdukController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/produks', [ProdukController::class, 'store']);
        Route::put('/produks/{produk}', [ProdukController::class, 'update']);
        Route::delete('/produks/{produk}', [ProdukController::class, 'destroy']);
    });

    // Transaksi - kasir & admin bisa create, keuangan & admin bisa lihat semua
    Route::middleware('role:kasir,admin')->group(function () {
        Route::post('/transaksis', [TransaksiController::class, 'store']);
    });
    
    Route::middleware('role:keuangan,admin')->group(function () {
        Route::get('/transaksis', [TransaksiController::class, 'index']);
        Route::get('/transaksis/{transaksi}', [TransaksiController::class, 'show']);
    });
});
