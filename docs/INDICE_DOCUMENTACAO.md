# 📚 Índice de Documentação - Fitway

**Última Atualização**: 15 de outubro de 2025

---

## 🎯 Documento Principal

### [📋 PLANO_DE_ACAO.md](./PLANO_DE_ACAO.md) ← **GUIA PRINCIPAL**
**O que é**: Roadmap completo do projeto, próximas fases, checklist de validação.  
**Use quando**: Planejar próximas features, verificar o que já foi feito.

---

## ✅ Fases Concluídas (Documentação Detalhada)

### [📄 FASE_1_CONCLUIDA.md](./FASE_1_CONCLUIDA.md)
**Feature**: Autenticação (Login/Register/Logout)  
**Backend**: AuthController, LoginRequest, RegisterRequest, Sanctum  
**Frontend**: LoginPage, RegisterPage, auth.service.ts  
**Status**: ✅ 100% Testado

---

### [📄 FASE_2_CONCLUIDA.md](./FASE_2_CONCLUIDA.md)
**Feature**: Admin - Quadras (CRUD)  
**Backend**: QuadraController, CreateQuadraRequest, UpdateQuadraRequest  
**Frontend**: Courts.tsx, courts.service.ts  
**Status**: ✅ 100% Testado

**Docs Relacionadas**:
- [FASE_2_RESUMO.md](./FASE_2_RESUMO.md) - Resumo executivo
- [FASE_2_TESTAVEL.md](./FASE_2_TESTAVEL.md) - Guia de testes

---

### [📄 FASE_3_CONCLUIDA.md](./FASE_3_CONCLUIDA.md)
**Feature**: Admin - Planos (CRUD)  
**Backend**: PlanoController, CreatePlanoRequest, UpdatePlanoRequest, PlanosSeeder  
**Frontend**: Plans.tsx, plans.service.ts  
**Status**: ✅ 100% Testado

---

### [📄 FASE_4_CONCLUIDA.md](./FASE_4_CONCLUIDA.md)
**Feature**: Admin - Usuários (CRUD)  
**Backend**: UserController, CreateUserRequest, UpdateUserRequest, UserSeeder  
**Frontend**: Users.tsx, users.service.ts  
**Status**: ✅ 100% Testado  
**Novidade**: Soft delete implementado

---

### [📄 FASE_5_CONCLUIDA.md](./FASE_5_CONCLUIDA.md)
**Feature**: Admin - Instrutores (CRUD)  
**Backend**: InstrutorController, CreateInstrutorRequest, UpdateInstrutorRequest, InstrutorSeeder  
**Frontend**: Instructors.tsx, instructors.service.ts  
**Status**: ✅ 100% Testado  
**Novidade**: Soft delete implementado

---

### [📄 FASE_6_SOFT_DELETE.md](./FASE_6_SOFT_DELETE.md)
**Feature**: Soft Delete (Exclusão Lógica)  
**Objetivo**: Preservar dados históricos (status='excluido')  
**Implementado em**: Planos, Usuários, Instrutores  
**Status**: ✅ 100% Implementado

**Docs Relacionadas**:
- [RESUMO_FASE_6.md](./RESUMO_FASE_6.md) - Resumo executivo
- [ANTES_DEPOIS_SOFT_DELETE.md](./ANTES_DEPOIS_SOFT_DELETE.md) - Comparação visual
- [INDICE_FASE_6.md](./INDICE_FASE_6.md) - Navegação

---

## 🔄 Refatorações e Mudanças Arquiteturais

### [📄 UNIFICACAO_PERSONAL_INSTRUTOR.md](./UNIFICACAO_PERSONAL_INSTRUTOR.md)
**O que mudou**: Papel 'personal' removido, unificado como 'instrutor'  
**Impacto**: Database, Backend, Frontend, Rotas  
**Status**: ✅ Completo

**Docs Relacionadas**:
- [ANALISE_PERSONAL_VS_INSTRUTOR.md](./ANALISE_PERSONAL_VS_INSTRUTOR.md) - Análise técnica

---

### [📄 DDL_CHANGELOG.md](./DDL_CHANGELOG.md)
**O que é**: Changelog do DDL (api/database/ddl.sql)  
**Mudanças**:
- Soft delete (status='excluido') em 3 tabelas
- Papel 'personal' removido (papel='instrutor')
- CHECK constraints atualizados

**Status**: ✅ DDL sincronizado com código

---

## 🧪 Guias de Teste

### [📄 TESTE_INSTRUCTORS.md](./TESTE_INSTRUCTORS.md)
**O que é**: Guia de teste para Instrutores CRUD  
**Como usar**: Passo a passo para testar no browser

---

## 📖 Documentação Técnica

### [📄 arquitetura-dados-e-fluxos.md](./arquitetura-dados-e-fluxos.md)
**O que é**: Visão geral da arquitetura, modelos de dados, fluxos  
**Use quando**: Entender relacionamentos entre tabelas, fluxos de negócio

---

### [📄 containers-e-comandos.md](./containers-e-comandos.md)
**O que é**: Guia de Docker, comandos úteis, troubleshooting  
**Use quando**: Subir ambiente, executar comandos no container, debug

---

## 📋 Histórico e Revisões

### [📄 REVISAO_PLANO_DE_ACAO.md](./REVISAO_PLANO_DE_ACAO.md)
**O que é**: Resumo da revisão do plano de ação (15/10/2025)  
**Por que existe**: Documentar correção de inconsistências no roadmap

---

### [📄 PLANO_DE_ACAO_V1_HISTORICO.md](./PLANO_DE_ACAO_V1_HISTORICO.md)
**O que é**: Versão antiga do plano de ação (mantida para referência)  
**Status**: ⚠️ OBSOLETO - Use [PLANO_DE_ACAO.md](./PLANO_DE_ACAO.md)

---

## 🗺️ Navegação Rápida

### Por Fase
- ✅ [Fase 1: Autenticação](./FASE_1_CONCLUIDA.md)
- ✅ [Fase 2: Quadras](./FASE_2_CONCLUIDA.md)
- ✅ [Fase 3: Planos](./FASE_3_CONCLUIDA.md)
- ✅ [Fase 4: Usuários](./FASE_4_CONCLUIDA.md)
- ✅ [Fase 5: Instrutores](./FASE_5_CONCLUIDA.md)
- ✅ [Fase 6: Soft Delete](./FASE_6_SOFT_DELETE.md)
- 🎯 **Fase 7: Disponibilidade Instrutor** (próxima - sem doc ainda)

### Por Categoria
**Backend**:
- [DDL Changelog](./DDL_CHANGELOG.md)
- [Arquitetura de Dados](./arquitetura-dados-e-fluxos.md)

**DevOps**:
- [Containers e Comandos](./containers-e-comandos.md)

**Refatorações**:
- [Soft Delete](./FASE_6_SOFT_DELETE.md)
- [Unificação Personal→Instrutor](./UNIFICACAO_PERSONAL_INSTRUTOR.md)

**Planejamento**:
- [Plano de Ação](./PLANO_DE_ACAO.md) ← **PRINCIPAL**
- [Revisão do Plano](./REVISAO_PLANO_DE_ACAO.md)

---

## 📊 Estatísticas

- **Fases Concluídas**: 6 fases + 2 refatorações = 8 entregas
- **Documentos Criados**: 15+ arquivos
- **CRUDs Implementados**: 5 (Quadras, Planos, Usuários, Instrutores + Auth)
- **Soft Delete**: 3 entidades (Planos, Usuários, Instrutores)
- **Última Atualização**: 15 de outubro de 2025

---

## 🎯 Próximos Passos

Consulte [PLANO_DE_ACAO.md](./PLANO_DE_ACAO.md) para:
- Fase 7: Disponibilidade Instrutor (próxima)
- Roadmap completo (Fases 7-13)
- Checklist de validação
- Comandos prontos para copiar

---

**Documentação Organizada!** 📚  
Use este índice para navegar rapidamente entre os documentos do projeto.
