# Script para padronizar tratamento de erros em todas as páginas
# Adiciona getErrorMessage e substitui padrões antigos

$files = @(
    "src/pages/admin/cadastros/plans/Plans.tsx",
    "src/pages/admin/cadastros/plans/AddPlan.tsx",
    "src/pages/admin/cadastros/plans/EditPlan.tsx",
    "src/pages/admin/cadastros/courts/Courts.tsx",
    "src/pages/admin/cadastros/instructors/Instructors.tsx",
    "src/pages/admin/agendamentos/personal-sessions/PersonalSessions.tsx",
    "src/pages/student/CourtBookings.tsx",
    "src/pages/personal/CourtBookings.tsx",
    "src/pages/LoginPage.tsx",
    "src/pages/RegisterPage.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "Atualizando $file..." -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        
        # 1. Adicionar getErrorMessage ao import de utils se não existir
        if ($content -match "from '@/lib/utils'") {
            # Já tem import de utils, adicionar getErrorMessage
            if (-not ($content -match "getErrorMessage")) {
                $content = $content -replace "(import \{[^}]+)(} from '@/lib/utils')", "`$1, getErrorMessage`$2"
                Write-Host "  ✓ Adicionado getErrorMessage ao import" -ForegroundColor Green
            }
        } else {
            # Não tem import de utils, adicionar import completo após outros imports
            $importLine = "import { getErrorMessage } from '@/lib/utils';`n"
            $content = $content -replace "(import.*\n)+", "`$0$importLine"
            Write-Host "  ✓ Criado import getErrorMessage" -ForegroundColor Green
        }
        
        # 2. Substituir padrões antigos de erro
        $oldPattern1 = "error instanceof Error \? error\.message : 'Erro desconhecido'"
        $oldPattern2 = "error instanceof Error \? error\.message : 'Erro inesperado'"
        $oldPattern3 = "\(error as any\)\.message \|\| 'Erro'"
        $oldPattern4 = "error\.message"
        
        $beforeCount = ($content | Select-String -Pattern $oldPattern1 -AllMatches).Matches.Count
        $content = $content -replace $oldPattern1, "getErrorMessage(error)"
        $content = $content -replace $oldPattern2, "getErrorMessage(error)"
        
        if ($beforeCount -gt 0) {
            Write-Host "  ✓ Substituídos $beforeCount padrões de erro antigos" -ForegroundColor Green
        }
        
        # 3. Garantir que catch blocks usem error: any
        $content = $content -replace "} catch \(error\)", "} catch (error: any)"
        Write-Host "  ✓ Garantidos tipos corretos nos catch blocks" -ForegroundColor Green
        
        # Salvar arquivo
        Set-Content $fullPath -Value $content -NoNewline
        Write-Host "  ✅ $file atualizado!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Arquivo não encontrado: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ Atualização concluída!" -ForegroundColor Green
Write-Host "Total de arquivos processados: $($files.Count)" -ForegroundColor Cyan
