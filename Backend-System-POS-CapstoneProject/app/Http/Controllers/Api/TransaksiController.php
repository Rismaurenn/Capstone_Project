<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\ItemTransaksi;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransaksiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Transaksi::with(['pelanggan', 'diskon', 'items.produk']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('dari') && $request->has('sampai')) {
            $query->whereBetween('created_at', [$request->dari, $request->sampai]);
        }

        $transaksis = $query->orderBy('created_at', 'desc')->get();
        return response()->json($transaksis);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pelanggan_id' => 'nullable|exists:pelanggans,id',
            'diskon_id' => 'nullable|exists:diskons,id',
            'subtotal' => 'required|numeric|min:0',
            'diskon' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'metode_bayar' => 'required|in:cash,debit,credit,qris',
            'status' => 'required|in:completed,pending,cancelled',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:produks,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.subtotal' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            // Generate transaction code
            $lastTransaction = Transaksi::latest('id')->first();
            $nextNumber = $lastTransaction ? ((int)substr($lastTransaction->transaction_code, 3)) + 1 : 1;
            $transactionCode = 'TRX' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

            // Create transaction
            $transaksi = Transaksi::create([
                'transaction_code' => $transactionCode,
                'pelanggan_id' => $validated['pelanggan_id'] ?? null,
                'diskon_id' => $validated['diskon_id'] ?? null,
                'subtotal' => $validated['subtotal'],
                'diskon' => $validated['diskon'],
                'total' => $validated['total'],
                'metode_bayar' => $validated['metode_bayar'],
                'status' => $validated['status'],
            ]);

            // Create transaction items and update stock
            foreach ($validated['items'] as $item) {
                ItemTransaksi::create([
                    'transaksi_id' => $transaksi->id,
                    'produk_id' => $item['produk_id'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Update product stock
                $produk = Produk::find($item['produk_id']);
                $produk->decrement('stock', $item['quantity']);
            }

            return response()->json($transaksi->load(['pelanggan', 'diskon', 'items.produk']), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $transaksi = Transaksi::with(['pelanggan', 'diskon', 'items.produk'])->findOrFail($id);
        return response()->json($transaksi);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $transaksi = Transaksi::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|required|in:completed,pending,cancelled',
        ]);

        $transaksi->update($validated);
        return response()->json($transaksi->load(['pelanggan', 'diskon', 'items.produk']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $transaksi = Transaksi::findOrFail($id);
        
        // Return stock before deleting
        foreach ($transaksi->items as $item) {
            $produk = Produk::find($item->produk_id);
            $produk->increment('stock', $item->quantity);
        }
        
        $transaksi->delete();
        return response()->json(null, 204);
    }
}
