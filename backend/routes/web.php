<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Rota para arquivos estáticos (deve vir ANTES das rotas catch-all)
Route::get('/assets/{file}', function ($file) {
    $path = public_path("assets/{$file}");
    
    if (file_exists($path)) {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $mimeTypes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'eot' => 'application/vnd.ms-fontobject',
        ];
        
        $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
        
        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000'
        ]);
    }
    
    abort(404);
})->where('file', '.*');

// Rota raiz serve o frontend React
Route::get('/', function () {
    return view('app');
});

// Todas as outras rotas também servem o frontend React (SPA)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*'); 