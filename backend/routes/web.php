<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Route web minimal — hanya untuk verifikasi email (link dari email harus
| bisa dibuka di browser tanpa token API). Semua logika lain lewat API.
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Verifikasi email via signed URL (dilindungi middleware 'signed').
// Link dari email → backend memvalidasi → redirect ke halaman frontend.
Route::get('/email/verify/{id}/{hash}', function (Request $request, int $id, string $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return redirect(config('app.frontend_url').'/verify-email?verified=0');
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    return redirect(config('app.frontend_url').'/verify-email?verified=1');
})->middleware(['signed'])->name('verification.verify');
