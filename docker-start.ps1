# 🚀 Script de Inicialização Rápida - Fitway Docker
# Uso: .\docker-start.ps1

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🏋️  FITWAY - INICIALIZAÇÃO DOCKER 🏋️              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host "   Por favor, inicie o Docker Desktop e tente novamente." -ForegroundColor Yellow
    exit 1
}

# Menu de opções
Write-Host "Escolha uma opção:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. 🚀 Iniciar (primeira vez ou normal)" -ForegroundColor Green
Write-Host "  2. 🔄 Reiniciar containers" -ForegroundColor Cyan
Write-Host "  3. 🗑️  Reset COMPLETO (apaga dados!)" -ForegroundColor Red
Write-Host "  4. 📊 Ver logs da API" -ForegroundColor Magenta
Write-Host "  5. 📊 Ver status dos containers" -ForegroundColor Blue
Write-Host "  6. 🛑 Parar tudo" -ForegroundColor Yellow
Write-Host "  7. ❌ Sair" -ForegroundColor Gray
Write-Host ""

$opcao = Read-Host "Digite o número da opção"

switch ($opcao) {
    "1" {
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "🚀 Iniciando containers..." -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        
        docker-compose up -d db api frontend-dev pgadmin
        
        Write-Host ""
        Write-Host "⏳ Aguardando API inicializar (isso pode levar 30-60s)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📋 Logs da API (CTRL+C para sair):" -ForegroundColor Magenta
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        docker-compose logs -f api
    }
    
    "2" {
        Write-Host ""
        Write-Host "🔄 Reiniciando containers..." -ForegroundColor Cyan
        docker-compose restart api frontend-dev
        Write-Host "✅ Containers reiniciados!" -ForegroundColor Green
    }
    
    "3" {
        Write-Host ""
        Write-Host "⚠️  ATENÇÃO: Isso vai APAGAR TODOS OS DADOS DO BANCO!" -ForegroundColor Red
        $confirmacao = Read-Host "Digite 'SIM' (em maiúsculas) para confirmar"
        
        if ($confirmacao -eq "SIM") {
            Write-Host ""
            Write-Host "🗑️  Parando containers..." -ForegroundColor Yellow
            docker-compose down
            
            Write-Host "🗑️  Removendo volumes (dados)..." -ForegroundColor Yellow
            docker-compose down -v
            
            Write-Host ""
            Write-Host "✅ Reset completo realizado!" -ForegroundColor Green
            Write-Host ""
            Write-Host "💡 Agora execute a opção 1 para recriar tudo." -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ Reset cancelado." -ForegroundColor Yellow
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📋 Logs da API (CTRL+C para sair):" -ForegroundColor Magenta
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        docker-compose logs -f api
    }
    
    "5" {
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📊 Status dos Containers:" -ForegroundColor Blue
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        docker-compose ps
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "🌐 URLs de Acesso:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "  • API:          http://localhost:8000" -ForegroundColor Green
        Write-Host "  • Frontend Dev: http://localhost:5173" -ForegroundColor Green
        Write-Host "  • Frontend:     http://localhost:3000" -ForegroundColor Green
        Write-Host "  • pgAdmin:      http://localhost:5050" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "👤 USUÁRIOS DE TESTE (login no sistema):" -ForegroundColor Yellow
        Write-Host "  • admin@fitway.com     / 123456  (Administrador)" -ForegroundColor White
        Write-Host "  • personal@fitway.com  / 123456  (Personal Trainer)" -ForegroundColor White
        Write-Host "  • aluno@fitway.com     / 123456  (Aluno)" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 IMPORTANTE: Todos os usuários têm a senha: 123456" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    }
    
    "6" {
        Write-Host ""
        Write-Host "🛑 Parando containers..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Containers parados!" -ForegroundColor Green
    }
    
    "7" {
        Write-Host ""
        Write-Host "👋 Até logo!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Opção inválida!" -ForegroundColor Red
    }
}

Write-Host ""
