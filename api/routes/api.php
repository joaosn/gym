<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\QuadraController;
use App\Http\Controllers\Admin\PlanoController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\InstrutorController;
use App\Http\Controllers\Admin\ReservaQuadraController;
use App\Http\Controllers\SessaoPersonalController;

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

// =====================================================================
// HEALTH CHECK
// =====================================================================
Route::get('/healthz', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'env' => config('app.env'),
        'time' => now()->toIso8601String(),
        'database' => 'connected', // TODO: adicionar DB check
    ]);
});

// =====================================================================
// AUTENTICAÇÃO (PÚBLICO)
// =====================================================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// =====================================================================
// ROTAS AUTENTICADAS (SANCTUM)
// =====================================================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticação (usuário logado)
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // =====================================================================
    // ADMIN: QUADRAS (CRUD)
    // =====================================================================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('courts', QuadraController::class)->parameters([
            'courts' => 'id'
        ]);
        Route::patch('/courts/{id}/status', [QuadraController::class, 'updateStatus']);
        
        // PLANOS (CRUD)
        Route::apiResource('plans', PlanoController::class)->parameters([
            'plans' => 'id'
        ]);
        Route::patch('/plans/{id}/status', [PlanoController::class, 'updateStatus']);
        
        // USUÁRIOS (CRUD) - Registrando rotas manualmente para debug
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{id}', [UserController::class, 'update'])->name('users.patch');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::patch('/users/{id}/status', [UserController::class, 'updateStatus'])->name('users.status');
        
        // INSTRUTORES/PERSONAL TRAINERS (CRUD)
        Route::get('/instructors', [InstrutorController::class, 'index'])->name('instructors.index');
        Route::post('/instructors', [InstrutorController::class, 'store'])->name('instructors.store');
        Route::get('/instructors/{id}', [InstrutorController::class, 'show'])->name('instructors.show');
        Route::put('/instructors/{id}', [InstrutorController::class, 'update'])->name('instructors.update');
        Route::patch('/instructors/{id}', [InstrutorController::class, 'update'])->name('instructors.patch');
        Route::delete('/instructors/{id}', [InstrutorController::class, 'destroy'])->name('instructors.destroy');
        Route::patch('/instructors/{id}/status', [InstrutorController::class, 'updateStatus'])->name('instructors.status');
        Route::put('/instructors/{id}/availability', [InstrutorController::class, 'updateAvailability'])->name('instructors.availability');
        
        // RESERVAS DE QUADRAS (CRUD)
        // ⚠️ IMPORTANTE: Rotas específicas ANTES das genéricas!
        Route::post('/court-bookings/check-availability', [ReservaQuadraController::class, 'checkAvailability'])->name('court-bookings.check');
        Route::patch('/court-bookings/{id}/confirm', [ReservaQuadraController::class, 'confirm'])->name('court-bookings.confirm');
        
        // Rotas CRUD normais
        Route::get('/court-bookings', [ReservaQuadraController::class, 'index'])->name('court-bookings.index');
        Route::post('/court-bookings', [ReservaQuadraController::class, 'store'])->name('court-bookings.store');
        Route::get('/court-bookings/{id}', [ReservaQuadraController::class, 'show'])->name('court-bookings.show');
        Route::put('/court-bookings/{id}', [ReservaQuadraController::class, 'update'])->name('court-bookings.update');
        Route::patch('/court-bookings/{id}', [ReservaQuadraController::class, 'update'])->name('court-bookings.patch');
        Route::delete('/court-bookings/{id}', [ReservaQuadraController::class, 'destroy'])->name('court-bookings.destroy');
    });

    // =====================================================================
    // SESSÕES PERSONAL 1:1 (Aluno e Instrutor)
    // =====================================================================
    Route::prefix('personal-sessions')->group(function () {
        Route::get('/', [SessaoPersonalController::class, 'index']);
        Route::get('/{id}', [SessaoPersonalController::class, 'show']);
        Route::post('/', [SessaoPersonalController::class, 'store']);
        Route::put('/{id}', [SessaoPersonalController::class, 'update']);
        Route::patch('/{id}', [SessaoPersonalController::class, 'update']);
        Route::delete('/{id}', [SessaoPersonalController::class, 'destroy']);
        Route::patch('/{id}/confirm', [SessaoPersonalController::class, 'confirm']);
        Route::post('/check-availability', [SessaoPersonalController::class, 'checkAvailability']);
    });
    
});