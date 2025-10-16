# Configuração do pgAdmin

Este diretório contém arquivos de configuração para o pgAdmin que permitem conexão automática com o PostgreSQL.

## Arquivo: servers.json

Define o servidor PostgreSQL pré-configurado que aparece automaticamente no pgAdmin.

**Campos importantes:**

- `Name`: Nome do servidor que aparece no pgAdmin
- `Host`: `db` (nome do container do PostgreSQL)
- `Port`: `5432`
- `MaintenanceDB`: `fitway_db`
- `Username`: `fitway_user`
- `Password`: `fitway_password` (salvo para ambiente de desenvolvimento)
- `SavePassword`: `true` (para não pedir senha toda vez)

## Segurança

⚠️ **ATENÇÃO**: Este arquivo contém a senha do banco em texto plano!

- ✅ **OK para desenvolvimento local**
- ❌ **NÃO usar em produção**
- 🔒 **Não commitar senhas reais no Git**

## Como funciona

Quando o container do pgAdmin sobe:

1. O arquivo `servers.json` é montado em `/pgadmin4/servers.json`
2. O pgAdmin lê este arquivo na inicialização
3. O servidor "Fitway PostgreSQL" aparece automaticamente conectado
4. Você não precisa configurar nada manualmente!

## Personalização

Para adicionar mais servidores, edite o `servers.json` seguindo a estrutura:

```json
{
  "Servers": {
    "1": { ... },
    "2": {
      "Name": "Outro Servidor",
      "Host": "outro-host",
      ...
    }
  }
}
```
