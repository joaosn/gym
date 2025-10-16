# 📚 Documentação do Projeto Fitway

**Última Atualização**: 16 de outubro de 2025

---

## 🗂️ Estrutura da Documentação

### 📋 **PLANO_DE_ACAO.md** ← **COMECE AQUI**
Guia principal do projeto com:
- ✅ Status de todas as fases (7 concluídas)
- 🗺️ Roadmap das próximas fases (8-13)
- ✅ Checklist de implementação
- 📊 Visão geral da stack tecnológica

**Use quando**: Planejar próximas features, verificar progresso, entender o que falta fazer.

---

## ✅ Fases Concluídas (7)

| Fase | Descrição | Arquivo |
|------|-----------|---------|
| **1** | Autenticação (Login/Register/Logout) | [FASE_1_CONCLUIDA.md](./FASE_1_CONCLUIDA.md) |
| **2** | Admin - Quadras (CRUD) | [FASE_2_CONCLUIDA.md](./FASE_2_CONCLUIDA.md) |
| **3** | Admin - Planos (CRUD + Seeder) | [FASE_3_CONCLUIDA.md](./FASE_3_CONCLUIDA.md) |
| **4** | Admin - Usuários (CRUD + Soft Delete) | [FASE_4_CONCLUIDA.md](./FASE_4_CONCLUIDA.md) |
| **5** | Admin - Instrutores (CRUD + Soft Delete) | [FASE_5_CONCLUIDA.md](./FASE_5_CONCLUIDA.md) |
| **6** | Soft Delete Unificado | [FASE_6_SOFT_DELETE.md](./FASE_6_SOFT_DELETE.md) |
| **7** | Disponibilidade Instrutor | [FASE_7_CONCLUIDA.md](./FASE_7_CONCLUIDA.md) |

### 📄 O que cada documento de fase contém:
- 🎯 Objetivo da fase
- ✅ Implementação completa (Backend + Frontend)
- 🔧 Arquivos criados/modificados
- 🧪 Como testar
- 📊 Endpoints da API
- 🎨 Componentes React
- 💡 Lições aprendidas

---

## 🗺️ Guias Técnicos

### [MAPA_VISUAL.md](./MAPA_VISUAL.md)
**Visualização da arquitetura do sistema**:
- 📊 Diagrama de fluxo (Frontend → API → Database)
- 🔐 Fluxo de autenticação (Sanctum)
- 📡 Endpoints organizados por contexto
- 🎭 Permissões por papel (admin/aluno/instrutor)
- 🗃️ Relacionamentos do banco de dados

**Use quando**: Entender como o sistema funciona, onboarding de novos devs.

---

### [UTILS_E_UX.md](./UTILS_E_UX.md)
**Guia de utilitários e padrões de UX/UI**:
- 💰 Formatação de valores (formatCurrency, parseCurrency)
- 📅 Formatação de datas (formatDate, formatTime, formatRelativeTime)
- ✅ Validações (isValidCPF, isValidEmail, isValidPhone)
- 🔤 Formatação de strings (formatCPF, formatPhone, capitalize, truncate, slugify)
- 🛠️ Helpers (debounce, copyToClipboard, downloadFile)
- 🎨 Padrões de UX (toasts, loading states, confirmações)

**Use quando**: Implementar nova feature, garantir consistência visual.

---

### [UNIFICACAO_PERSONAL_INSTRUTOR.md](./UNIFICACAO_PERSONAL_INSTRUTOR.md)
**Registro de mudança importante**:
- 🔄 Unificação do papel `'personal'` → `'instrutor'`
- 📝 Mudanças no banco de dados (CHECK constraints)
- 🔧 Alterações no backend (seeders, rotas)
- 🎨 Alterações no frontend (types, rotas)

**Use quando**: Entender por que não existe mais papel "personal".

---

## 📖 Outros Documentos Importantes

### Fora da pasta `docs/`:

| Documento | Localização | Descrição |
|-----------|-------------|-----------|
| **README.md** | `/README.md` | Guia de início rápido, quick start, comandos Docker |
| **Copilot Instructions** | `/.github/copilot-instructions.md` | Regras de negócio, nomenclaturas, padrões de código |
| **Arquitetura de Dados** | `/docs/arquitetura-dados-e-fluxos.md` | DDL completo, relacionamentos, constraints |
| **Comandos Docker** | `/docs/containers-e-comandos.md` | Referência rápida de comandos úteis |

---

## 🚀 Próximas Fases (Roadmap)

Conforme **PLANO_DE_ACAO.md**:

| Fase | Feature | Tempo Estimado |
|------|---------|----------------|
| **8** | Sessões Personal 1:1 (anti-overlap) | 3-4 dias |
| **9** | Reservas de Quadras (anti-overlap) | 3-4 dias |
| **10** | Aulas (Turmas em Grupo) | 4-5 dias |
| **11** | Assinaturas | 3-4 dias |
| **12** | Pagamentos (Básico) | 4-5 dias |
| **13** | Refinamentos | 3-4 dias |

**Total estimado**: ~6-7 semanas

---

## 📝 Como Contribuir

1. **Leia PLANO_DE_ACAO.md** para entender o status atual
2. **Consulte a fase correspondente** (FASE_X_CONCLUIDA.md)
3. **Siga os padrões** definidos em UTILS_E_UX.md
4. **Atualize a documentação** quando concluir uma fase
5. **Use o checklist** do PLANO_DE_ACAO.md

---

## 🎯 Convenções de Documentação

### Nomenclatura de Arquivos
- `FASE_X_CONCLUIDA.md` - Documentação de fase concluída (X = número)
- `NOME_EM_UPPERCASE.md` - Guias técnicos e referências

### Estrutura de Documento de Fase
```markdown
# ✅ Fase X: Nome da Feature - CONCLUÍDA

**Data**: DD de MM de AAAA
**Status**: ✅ CONCLUÍDO

## 🎯 Objetivo
[Descrição do objetivo]

## ✅ Implementado
### Backend
[Detalhes]

### Frontend
[Detalhes]

## 🧪 Como Testar
[Passo a passo]

## 📝 Observações
[Lições aprendidas, limitações, melhorias futuras]
```

---

## 📞 Dúvidas?

- Consulte **PLANO_DE_ACAO.md** (índice mestre)
- Leia a documentação da fase específica
- Verifique **MAPA_VISUAL.md** para arquitetura
- Consulte **UTILS_E_UX.md** para padrões

---

**Equipe Fitway**  
**2025**
