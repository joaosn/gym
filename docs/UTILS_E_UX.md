# 📚 Utilitários e Padrões de UX - Fitway

> **Criado em**: 15/10/2025  
> **Status**: ✅ Implementado e documentado

---

## 🎯 Objetivo

Centralizar **utilitários de formatação** e estabelecer **padrões de UX/UI** para garantir **consistência visual** e **melhor experiência do usuário** em todo o projeto.

---

## 📦 Arquivo de Utilitários

**Localização**: `web/src/lib/utils.ts`

### ✨ Funcionalidades Implementadas

#### 💰 Formatação de Valores Monetários
```typescript
formatCurrency(150) // "R$ 150,00"
formatCurrency(150.5, false) // "150,50"
parseCurrency("R$ 1.500,00") // 1500
```

#### 📅 Formatação de Data e Hora
```typescript
formatDate("2024-01-15T10:30:00") // "15/01/2024"
formatDate("2024-01-15T10:30:00", true) // "15/01/2024 às 10:30"
formatTime("14:30:00") // "14:30"
formatRelativeTime("2024-01-15T10:00:00") // "há 2 horas"
```

#### ✅ Validações
```typescript
isValidCPF("123.456.789-09") // true/false
isValidEmail("user@example.com") // true/false
isValidPhone("11988887777") // true/false
```

#### 🔤 Formatação de Strings
```typescript
formatCPF("12345678900") // "123.456.789-00"
formatPhone("11988887777") // "(11) 98888-7777"
capitalize("joão silva") // "João Silva"
truncate("Lorem ipsum dolor sit amet", 10) // "Lorem ipsu..."
slugify("Quadra Beach Tennis 1") // "quadra-beach-tennis-1"
```

#### 🛠️ Helpers Gerais
```typescript
debounce((term) => search(term), 500) // Debounce para busca
copyToClipboard("texto") // Copiar para área de transferência
downloadFile(blob, "relatorio.csv") // Download de arquivo
```

---

## 🎨 Padrões de UX/UI Estabelecidos

### 1. **Formatação Visual**
- ✅ **SEMPRE** usar `formatCurrency()` para valores em reais
- ✅ **SEMPRE** usar `formatDate()` para datas
- ✅ **SEMPRE** usar `formatPhone()` para telefones
- ✅ **SEMPRE** usar `formatCPF()` para CPF
- ⚠️ **NUNCA** exibir valores brutos (`150`, `2024-01-15`, `11988887777`)

### 2. **Feedback Visual**
- ✅ Mostrar **loading states** (spinners/skeletons)
- ✅ Exibir **toast notifications** após ações
- ✅ Usar **badges** para status (ativa/inativa, pendente/confirmada)
- ✅ Desabilitar botões durante submissão (`disabled={submitting}`)

### 3. **Validações**
- ✅ Validar inputs **em tempo real** quando possível
- ✅ Usar funções `isValid*()` antes de submit
- ✅ Mensagens de erro **claras e em português**
- ✅ Destacar campos com erro visualmente

### 4. **Navegação e Confirmações**
- ✅ **AlertDialog** para ações destrutivas (deletar)
- ✅ Permitir **cancelar** operações
- ✅ Manter usuário informado do progresso

### 5. **Performance**
- ✅ `debounce()` em campos de busca (500ms)
- ✅ Paginação em listas longas
- ✅ Cache com React Query

---

## 📝 Exemplo de Aplicação: Gestão de Quadras

### Antes (valores brutos)
```tsx
<div className="text-2xl">
  R$ {totalRevenue.toFixed(2)}
</div>
<span className="text-sm">
  R$ {court.preco_hora.toFixed(2)}/hora
</span>
```

### Depois (com utilitários)
```tsx
import { formatCurrency, formatDate } from '@/lib/utils';

<div className="text-2xl">
  {formatCurrency(totalRevenue)}
</div>
<span className="text-sm">
  {formatCurrency(court.preco_hora)}/hora
</span>
```

**Resultado Visual**: "R$ 1.500,00" ao invés de "R$ 1500.00"

---

## 🔄 Normalização de Dados da API

### Problema
PostgreSQL retorna **DECIMAL como string** no JSON:
```json
{
  "preco_hora": "150.00"  // ❌ string, não number
}
```

### Solução
Helper `normalizeCourt()` em `courts.service.ts`:
```typescript
const normalizeCourt = (court: any): Court => ({
  ...court,
  preco_hora: typeof court.preco_hora === 'string' 
    ? parseFloat(court.preco_hora) 
    : court.preco_hora,
});
```

Aplicado em **todos** os métodos do service:
- ✅ `getAdminCourts()`
- ✅ `getAdminCourt()`
- ✅ `createCourt()`
- ✅ `updateCourt()`
- ✅ `updateCourtStatus()`

---

## 📋 Checklist de UX para Novas Telas

Ao criar qualquer nova tela/componente, **SEMPRE** verificar:

- [ ] Valores monetários formatados com `formatCurrency()`
- [ ] Datas formatadas com `formatDate()`
- [ ] Telefones formatados com `formatPhone()`
- [ ] CPF formatado com `formatCPF()`
- [ ] Loading states implementados
- [ ] Toast notifications após ações
- [ ] Validações em tempo real
- [ ] Confirmação antes de deletar
- [ ] Mensagens de erro em português
- [ ] Botões desabilitados durante submissão
- [ ] Badges para status
- [ ] Debounce em campos de busca
- [ ] Responsividade mobile

---

## 🚀 Próximos Passos

1. **Aplicar em todas as telas existentes**
   - Login/Register (formatPhone, formatCPF)
   - Dashboard (formatCurrency, formatDate)
   - Outras áreas admin

2. **Expandir utilitários**
   - Adicionar formatação de endereço
   - Adicionar validação de CEP
   - Criar helpers para CNPJ

3. **Criar componentes reutilizáveis**
   - `<CurrencyInput />` - Input formatado para moeda
   - `<DatePicker />` - Seletor de data formatado
   - `<PhoneInput />` - Input com máscara de telefone

---

## 📚 Referências

- **Arquivo Principal**: `web/src/lib/utils.ts`
- **Exemplo de Uso**: `web/src/pages/admin/Courts.tsx`
- **Copilot Instructions**: `.github/copilot-instructions.md` (seção UX)
- **Service Pattern**: `web/src/services/courts.service.ts` (normalizeCourt)

---

## ✅ Status da Implementação

| Funcionalidade | Status | Onde Está |
|---------------|--------|-----------|
| Utilitários Base | ✅ Implementado | `web/src/lib/utils.ts` |
| Formatação Moeda | ✅ Aplicado | Courts.tsx (2 locais) |
| Normalização API | ✅ Aplicado | courts.service.ts (5 métodos) |
| Documentação UX | ✅ Atualizado | copilot-instructions.md |
| Checklist Completo | ✅ Criado | copilot-instructions.md |

---

**🎉 Resultado**: Experiência do usuário **consistente** e **profissional** em toda a aplicação!
