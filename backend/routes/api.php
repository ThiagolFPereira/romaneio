<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotaFiscalController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/**
 * Rotas de Autenticação (públicas)
 * 
 * POST /api/auth/register - Registra um novo usuário
 * POST /api/auth/login - Faz login do usuário
 */
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

/**
 * Rotas Protegidas (requerem autenticação)
 */
Route::middleware('auth:sanctum')->group(function () {
    // Rota para consultar dados de uma nota fiscal (com monitoramento)
    Route::post('/notas/consultar', [NotaFiscalController::class, 'consultar'])
        ->middleware('log.consultas');
    
    // Rota para salvar dados da nota no histórico
    Route::post('/historico/salvar', [NotaFiscalController::class, 'salvar']);
    
    // Rota para salvar notas diretamente (sem consulta SEFAZ)
    Route::post('/notas/salvar', [NotaFiscalController::class, 'salvarDireto']);
    
    // Rotas para visualizar histórico
    Route::get('/historico', [NotaFiscalController::class, 'historico']);
    Route::get('/historico/estatisticas', [NotaFiscalController::class, 'estatisticas']);
    Route::delete('/historico/{id}', [NotaFiscalController::class, 'excluir']);
    
    // Rotas de autenticação (protegidas)
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
}); 