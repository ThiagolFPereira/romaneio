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

// Rota para servir o frontend React
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

// Rota raiz também serve o frontend
Route::get('/', function () {
    return view('app');
}); 