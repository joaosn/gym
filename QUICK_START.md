# 🚀 FITWAY - Quick Start

> **Última atualização**: 25 de outubro de 2025

## ⚡ INICIAR O SISTEMA (escolha uma)

### 1️⃣ Automático (Recomendado)
```bash
bash quick-start.sh          # Linux/macOS/Git Bash
quick-start.bat              # Windows CMD/PowerShell
.\docker-start.ps1           # Windows PowerShell (menu interativo)
```

### 2️⃣ Manual
```bash
docker-compose up -d db api frontend-dev pgadmin
docker-compose logs -f api   # Ver logs em tempo real
```

---

## 🌐 ACESSAR

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API** | http://localhost:8000 |
| **pgAdmin** | http://localhost:5050 |

---

## 🔐 CREDENCIAIS

### Frontend (http://localhost:5173)
```
admin@fitway.com     / 123456  ← Administrador
personal@fitway.com  / 123456  ← Personal Trainer  
aluno@fitway.com     / 123456  ← Aluno
```

### pgAdmin (http://localhost:5050)
```
admin@fitway.com / admin123
```

### PostgreSQL
```
Host: localhost:5432
DB: fitway_db
User: fitway_user
Pass: fitway_password
```

---

## 📊 DADOS CRIADOS

✅ 5 Usuários | ✅ 5 Planos | ✅ 7 Quadras | ✅ 4 Instrutores | ✅ 4 Aulas | ✅ 12 Reservas | ✅ 12 Sessões Personal

---

## 🔧 COMANDOS ÚTEIS

```bash
docker-compose ps                    # Ver status
docker-compose logs -f api           # Logs em tempo real
docker-compose down                  # Parar tudo
docker-compose down -v               # Reset completo (apaga dados)
docker-compose exec api php artisan route:list
docker-compose exec db psql -U fitway_user -d fitway_db
```

---

## ⚠️ TROUBLESHOOTING

**API não sobe?**
```bash
docker-compose logs api --tail=50
docker-compose down -v
docker-compose up -d
```

**Banco vazio?**
```bash
docker-compose exec api php artisan db:seed --force
```

---

## 📚 DOCUMENTAÇÃO

Veja `docs/` para:
- `PLANO_DE_ACAO.md` - Roadmap do projeto
- `FASE_*.md` - 13 fases implementadas
- `arquitetura-dados-e-fluxos.md` - Arquitetura
- `containers-e-comandos.md` - Comandos Docker

---

**Sistema pronto! Acesse http://localhost:5173 e faça login 🎉**
