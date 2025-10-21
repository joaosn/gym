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
        
        // ASSINATURAS (Admin Management)
        Route::get('/subscriptions', [App\Http\Controllers\AssinaturaController::class, 'index'])->name('subscriptions.index');
        Route::post('/subscriptions', [App\Http\Controllers\AssinaturaController::class, 'adminAssinar'])->name('subscriptions.create');
        Route::get('/subscriptions/active', [App\Http\Controllers\AssinaturaController::class, 'active'])->name('subscriptions.active');
        Route::patch('/subscriptions/{id}/cancel', [App\Http\Controllers\AssinaturaController::class, 'cancelar'])->name('subscriptions.cancel');
        Route::put('/subscriptions/{id}', [App\Http\Controllers\AssinaturaController::class, 'update'])->name('subscriptions.update');
        
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
        Route::patch('/court-bookings/{id}/cancel', [ReservaQuadraController::class, 'cancel'])->name('court-bookings.cancel');
        Route::post('/court-blockings', [App\Http\Controllers\BloqueioQuadraController::class, 'store'])->name('court-blockings.store');
        
        // Rotas CRUD normais
        Route::get('/court-bookings', [ReservaQuadraController::class, 'index'])->name('court-bookings.index');
        Route::post('/court-bookings', [ReservaQuadraController::class, 'store'])->name('court-bookings.store');
        Route::get('/court-bookings/{id}', [ReservaQuadraController::class, 'show'])->name('court-bookings.show');
        Route::put('/court-bookings/{id}', [ReservaQuadraController::class, 'update'])->name('court-bookings.update');
        Route::patch('/court-bookings/{id}', [ReservaQuadraController::class, 'update'])->name('court-bookings.patch');
        Route::delete('/court-bookings/{id}', [ReservaQuadraController::class, 'destroy'])->name('court-bookings.destroy');

        // =====================================================================
        // AULAS (TURMAS EM GRUPO) - Admin CRUD
        // =====================================================================
        
        // ⚠️ IMPORTANTE: Rotas específicas ANTES do apiResource para evitar conflitos!
        
        // Horários de Aula (configuração semanal)
        Route::prefix('class-schedules')->group(function () {
            Route::get('/', [App\Http\Controllers\HorarioAulaController::class, 'index']);
            Route::post('/', [App\Http\Controllers\HorarioAulaController::class, 'store']);
            Route::get('/{id}', [App\Http\Controllers\HorarioAulaController::class, 'show']);
            Route::put('/{id}', [App\Http\Controllers\HorarioAulaController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\HorarioAulaController::class, 'destroy']);
        });

        // Ocorrências de Aula (geração e cancelamento)
        Route::prefix('class-occurrences')->group(function () {
            Route::post('/generate', [App\Http\Controllers\OcorrenciaAulaController::class, 'gerar']);
            Route::patch('/{id}/cancel', [App\Http\Controllers\OcorrenciaAulaController::class, 'cancelar']);
            Route::delete('/{id}', [App\Http\Controllers\OcorrenciaAulaController::class, 'destroy']);
            Route::get('/', [App\Http\Controllers\OcorrenciaAulaController::class, 'index']);
            Route::get('/{id}', [App\Http\Controllers\OcorrenciaAulaController::class, 'show']);
            
            // Gerenciar inscrições de uma ocorrência específica
            Route::get('/{occurrenceId}/enrollments', [App\Http\Controllers\InscricaoAulaController::class, 'index']);
            Route::post('/{occurrenceId}/enrollments', [App\Http\Controllers\InscricaoAulaController::class, 'adminInscrever']);
        });

        // Inscrições (admin pode ver todas e gerenciar)
        Route::prefix('class-enrollments')->group(function () {
            Route::get('/', [App\Http\Controllers\InscricaoAulaController::class, 'index']);
            Route::delete('/{id}', [App\Http\Controllers\InscricaoAulaController::class, 'adminRemover']);
        });
        
        // Alunos disponíveis para inscrição
        Route::get('/available-students', [App\Http\Controllers\InscricaoAulaController::class, 'alunosDisponiveis']);
        
        // CRUD de Aulas (DEVE vir POR ÚLTIMO para não capturar rotas acima!)
        Route::apiResource('classes', App\Http\Controllers\AulaController::class)->parameters(['classes' => 'id']);

        // Pagamentos (Admin)
        Route::prefix('payments')->group(function () {
            Route::get('/', [App\Http\Controllers\PagamentoController::class, 'index']);
            Route::get('/{id}', [App\Http\Controllers\PagamentoController::class, 'show']);
            Route::post('/{id}/create-checkout', [App\Http\Controllers\PagamentoController::class, 'adminCreateCheckout']);
            Route::post('/', [App\Http\Controllers\PagamentoController::class, 'store']);
            Route::put('/{id}', [App\Http\Controllers\PagamentoController::class, 'update']);
            Route::patch('/{id}', [App\Http\Controllers\PagamentoController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\PagamentoController::class, 'destroy']);
        });

    // Notificações (Admin)
    Route::post('/notifications', [App\Http\Controllers\Admin\NotificacaoAdminController::class, 'store']);
    });

    // =====================================================================
    // SESSÕES PERSONAL 1:1 (Aluno e Instrutor)
    // =====================================================================
    Route::prefix('personal-sessions')->group(function () {
        // Rotas específicas ANTES das genéricas (evitar conflito com {id})
        Route::get('/me', [SessaoPersonalController::class, 'mySessions']); // Sessões do instrutor logado
        Route::get('/my-sessions', [SessaoPersonalController::class, 'mySessions']); // Alias para compatibilidade com testes
        Route::post('/check-availability', [SessaoPersonalController::class, 'checkAvailability']);
        Route::patch('/{id}/confirm', [SessaoPersonalController::class, 'confirm']);
        
        // Rotas genéricas (CRUD)
        Route::get('/', [SessaoPersonalController::class, 'index']);
        Route::get('/{id}', [SessaoPersonalController::class, 'show']);
        Route::post('/', [SessaoPersonalController::class, 'store']);
        Route::put('/{id}', [SessaoPersonalController::class, 'update']);
        Route::patch('/{id}', [SessaoPersonalController::class, 'update']);
        Route::delete('/{id}', [SessaoPersonalController::class, 'destroy']);
    });

    // =====================================================================
    // AULAS (TURMAS EM GRUPO) - Aluno
    // =====================================================================
    Route::prefix('classes')->group(function () {
        // Listar aulas disponíveis
        Route::get('/', [App\Http\Controllers\AulaController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\AulaController::class, 'show']);

        // Listar ocorrências futuras
        Route::get('/occurrences', [App\Http\Controllers\OcorrenciaAulaController::class, 'index']);
        Route::get('/occurrences/{id}', [App\Http\Controllers\OcorrenciaAulaController::class, 'show']);
    });

    // Inscrições em aulas
    Route::prefix('class-enrollments')->group(function () {
        Route::get('/me', [App\Http\Controllers\InscricaoAulaController::class, 'minhasInscricoes']);
        Route::post('/', [App\Http\Controllers\InscricaoAulaController::class, 'inscrever']);
        Route::delete('/{id}', [App\Http\Controllers\InscricaoAulaController::class, 'cancelar']);
    });

    // =====================================================================
    // ASSINATURAS (Aluno)
    // =====================================================================
    Route::prefix('subscriptions')->group(function () {
        Route::get('/me', [App\Http\Controllers\AssinaturaController::class, 'minhaAssinatura']);
        Route::post('/', [App\Http\Controllers\AssinaturaController::class, 'assinar']);
        Route::delete('/me', [App\Http\Controllers\AssinaturaController::class, 'cancelar']);
    });

    // =====================================================================
    // PAGAMENTOS (Aluno)
    // =====================================================================
    Route::prefix('payments')->group(function () {
        Route::get('/pending', [App\Http\Controllers\PagamentoController::class, 'minhasCobrancasPendentes']);
        Route::get('/history', [App\Http\Controllers\PagamentoController::class, 'meuHistorico']);
        Route::get('/parcelas/{id_parcela}', [App\Http\Controllers\PagamentoController::class, 'getParcela']);
        Route::post('/create-charge', [App\Http\Controllers\PagamentoController::class, 'criarCobrancaManual']);
        Route::post('/checkout/{id_parcela}', [App\Http\Controllers\PagamentoController::class, 'criarCheckout']); // simulação legado
        Route::post('/checkout/mp/{id_parcela}', [App\Http\Controllers\PagamentoController::class, 'criarCheckoutMercadoPago']);
        Route::post('/{id_pagamento}/approve', [App\Http\Controllers\PagamentoController::class, 'aprovarSimulacao']);
    });

    // Webhook Mercado Pago
    Route::post('/webhooks/mercadopago', [App\Http\Controllers\MercadoPagoWebhookController::class, 'handle']);

    // =====================================================================
    // NOTIFICAÇÕES (Aluno/Instrutor)
    // =====================================================================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\NotificacaoController::class, 'index']);
        Route::get('/unread-count', [App\Http\Controllers\NotificacaoController::class, 'unreadCount']);
        Route::patch('/{id}/read', [App\Http\Controllers\NotificacaoController::class, 'markAsRead']);
        Route::post('/mark-all-read', [App\Http\Controllers\NotificacaoController::class, 'markAllAsRead']);
        Route::delete('/{id}', [App\Http\Controllers\NotificacaoController::class, 'destroy']);
    });
    
});