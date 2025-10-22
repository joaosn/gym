<?php

/**
 * Gerar Token de Teste
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Usuario;

$usuario = Usuario::findOrFail(1);
$token = $usuario->createToken('test-token')->plainTextToken;

echo "\n========================================\n";
echo "TOKEN GERADO\n";
echo "========================================\n\n";
echo "Usuário: {$usuario->nome}\n";
echo "Papel: {$usuario->papel}\n";
echo "Token: {$token}\n\n";
echo "Copie o token e use nos headers:\n";
echo "Authorization: Bearer {$token}\n\n";
