<?php

use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Route web minimal — semua logika lain lewat API.
|
*/

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| Download APK — serve file dengan header yang benar
|--------------------------------------------------------------------------
*/
Route::get('/downloads/comika.apk', function () {
    $path = public_path('downloads/comika.apk');

    if (! file_exists($path)) {
        abort(404, 'File APK belum tersedia.');
    }

    return Response::download($path, 'comika.apk', [
        'Content-Type' => 'application/vnd.android.package-archive',
        'Content-Disposition' => 'attachment; filename="comika.apk"',
        'Cache-Control' => 'no-cache, must-revalidate',
    ]);
});
