# ✅ Fase 7: Disponibilidade Instrutor - CONCLUÍDA

**Data**: 16 de outubro de 2025  
**Status**: ✅ JÁ ESTAVA IMPLEMENTADA (descoberta durante revisão)

---

## 🎯 Objetivo

Permitir que **instrutores definam seus horários disponíveis** na semana para agendamento de sessões 1:1 com alunos.

---

## ✅ Implementado

### Backend (Laravel)

#### 1. **Controller** ✅

**Arquivo**: `api/app/Http/Controllers/Admin/InstrutorController.php`

**Endpoint**: `PUT /api/admin/instructors/{id}/availability`

**Método**: `updateAvailability(Request $request, string $id)`

**Funcionalidades**:

- ✅ Validação completa:

  ```php
  'disponibilidades' => 'required|array',
  'disponibilidades.*.dia_semana' => 'required|integer|between:1,7',
  'disponibilidades.*.hora_inicio' => 'required|date_format:H:i',
  'disponibilidades.*.hora_fim' => 'required|date_format:H:i|after:disponibilidades.*.hora_inicio',
  'disponibilidades.*.disponivel' => 'nullable|boolean',
  ```

- ✅ Transaction com rollback em caso de erro
- ✅ Delete de horários antigos + Insert dos novos
- ✅ Retorno JSON padronizado (200 com mensagem de sucesso)

#### 2. **Model** ✅

**Arquivo**: `api/app/Models/DisponibilidadeInstrutor.php`

**Relacionamento**:

```php
// Model Instrutor
public function disponibilidades() {
    return $this->hasMany(DisponibilidadeInstrutor::class, 'id_instrutor');
}

// Model DisponibilidadeInstrutor
public function instrutor() {
    return $this->belongsTo(Instrutor::class, 'id_instrutor');
}
```

#### 3. **Rota** ✅

**Arquivo**: `api/routes/api.php`

```php
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::put('/instructors/{id}/availability', [InstrutorController::class, 'updateAvailability'])
        ->name('instructors.availability');
});
```

**Proteções**:

- ✅ `auth:sanctum` - Requer autenticação
- ✅ `role:admin` - Apenas administradores

---

### Frontend (React)

#### 1. **Interface Modal** ✅

**Arquivo**: `web/src/pages/admin/Instructors.tsx` (linhas 704-774)

**Componentes**:

- ✅ Modal "Disponibilidade - {instrutor.nome}"
- ✅ Lista de horários editáveis
- ✅ Select de dia da semana (Segunda-Domingo)
- ✅ Input type="time" para hora_inicio
- ✅ Input type="time" para hora_fim
- ✅ Botão "Remover" em cada slot
- ✅ Botão "Adicionar Horário"
- ✅ Botão "Salvar" com loading state

**Código do Modal**:

```tsx
<Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Disponibilidade - {selectedInstructor?.nome}</DialogTitle>
      <DialogDescription>Gerencie os horários disponíveis para agendamento</DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {availabilityData.map((slot, index) => (
        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
          <Select value={slot.dia_semana.toString()} onChange={...}>
            {/* Segunda-Domingo */}
          </Select>
          
          <Input type="time" value={slot.hora_inicio} onChange={...} />
          <span>até</span>
          <Input type="time" value={slot.hora_fim} onChange={...} />
          
          <Button onClick={() => removeAvailabilitySlot(index)}>Remover</Button>
        </div>
      ))}

      <Button onClick={addAvailabilitySlot}>
        <Plus /> Adicionar Horário
      </Button>
    </div>

    <DialogFooter>
      <Button onClick={handleUpdateAvailability} disabled={submitting}>
        {submitting ? "Salvando..." : "Salvar"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 2. **Handlers** ✅

**Arquivo**: `web/src/pages/admin/Instructors.tsx` (linhas 100-195)

```tsx
// Abrir modal e carregar disponibilidades existentes
const openAvailabilityModal = (instructor: Instructor) => {
  setSelectedInstructor(instructor);
  setAvailabilityData(
    instructor.disponibilidades.map((d) => ({
      dia_semana: d.dia_semana,
      hora_inicio: d.hora_inicio,
      hora_fim: d.hora_fim,
      disponivel: d.disponivel,
    }))
  );
  setIsAvailabilityOpen(true);
};

// Adicionar novo slot (padrão: Segunda 08:00-12:00)
const addAvailabilitySlot = () => {
  setAvailabilityData((prev) => [
    ...prev,
    { dia_semana: 1, hora_inicio: "08:00", hora_fim: "12:00", disponivel: true },
  ]);
};

// Remover slot por índice
const removeAvailabilitySlot = (index: number) => {
  setAvailabilityData((prev) => prev.filter((_, i) => i !== index));
};

// Salvar no backend
const handleUpdateAvailability = async () => {
  if (!selectedInstructor) return;

  setSubmitting(true);
  try {
    await instructorsService.updateAvailability(
      selectedInstructor.id_instrutor, 
      availabilityData
    );
    toast({ title: "Disponibilidade atualizada!" });
    setIsAvailabilityOpen(false);
    loadInstructors(); // Recarrega lista
  } catch (error: any) {
    toast({
      title: "Erro ao atualizar disponibilidade",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setSubmitting(false);
  }
};
```

#### 3. **Botão de Acesso** ✅

**Arquivo**: `web/src/pages/admin/Instructors.tsx` (linhas 471-477)

No card de cada instrutor:

```tsx
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => openAvailabilityModal(instructor)}
  className="hover:bg-fitway-green/10 hover:border-fitway-green"
>
  <Clock className="mr-1.5 h-4 w-4" />
  Horários
</Button>
```

#### 4. **Resumo Visual** ✅

**Arquivo**: `web/src/pages/admin/Instructors.tsx` (linhas 462-468)

Exibe quantidade de horários configurados:

```tsx
<div className="flex items-center gap-2.5 bg-muted/40 rounded-lg p-3.5 border">
  <Clock className="h-4 w-4 text-fitway-green shrink-0" />
  <div className="flex-1 min-w-0">
    <span className="font-semibold text-sm">{instructor.disponibilidades.length}</span>
    <span className="text-sm text-muted-foreground ml-1">
      {instructor.disponibilidades.length === 1 ? "horário configurado" : "horários configurados"}
    </span>
  </div>
</div>
```

#### 5. **Service** ✅

**Arquivo**: `web/src/services/instructors.service.ts`

```typescript
async updateAvailability(id: string, disponibilidades: Availability[]): Promise<void> {
  await this.apiClient.put(`/admin/instructors/${id}/availability`, {
    disponibilidades,
  });
}
```

#### 6. **Types** ✅

**Arquivo**: `web/src/types/index.ts`

```typescript
export interface Availability {
  id_disponibilidade?: string;
  dia_semana: number; // 1-7 (Segunda-Domingo)
  dia_semana_texto?: string; // "Segunda", "Terça", etc
  hora_inicio: string; // "HH:MM"
  hora_fim: string; // "HH:MM"
  disponivel?: boolean;
}

export interface Instructor {
  id_instrutor: string;
  nome: string;
  email: string;
  telefone: string;
  cref: string;
  valor_hora: number;
  especialidades: string[];
  bio?: string;
  status: 'ativo' | 'inativo';
  id_usuario?: string;
  disponibilidades: Availability[]; // ← Inclui disponibilidades
  criado_em: string;
  atualizado_em: string;
}
```

---

## 🎨 UX/UI

### Feedback Visual

- ✅ **Toast de sucesso**: "Disponibilidade atualizada!"
- ✅ **Toast de erro**: Mensagem do backend em caso de falha
- ✅ **Loading state**: Botão "Salvando..." durante submit
- ✅ **Contador**: Mostra quantos horários estão configurados
- ✅ **Validação visual**: Inputs type="time" com validação nativa do browser

### Usabilidade

- ✅ **Botão fácil de encontrar**: "Horários" visível em cada card
- ✅ **Adicionar múltiplos horários**: Sem limite
- ✅ **Edição inline**: Alterar dia/hora sem trocar de tela
- ✅ **Remover horário**: Um clique no botão "Remover"
- ✅ **Horário padrão**: Segunda 08:00-12:00 ao adicionar

---

## 🧪 Como Testar

### 1. **Acessar Admin**

```
http://localhost:5173/admin/instrutores
```

Login: `admin@fitway.com` / `admin123`

### 2. **Editar Disponibilidade**

1. Clique no botão "Horários" de um instrutor
2. Modal abre com horários existentes (se houver)
3. Clique "Adicionar Horário" para criar novo
4. Edite dia da semana, hora início e hora fim
5. Clique "Salvar"
6. Toast de sucesso deve aparecer
7. Modal fecha e contador atualiza

### 3. **Remover Horário**

1. Abra modal de disponibilidade
2. Clique "Remover" em um horário
3. Clique "Salvar"
4. Horário deletado com sucesso

### 4. **Verificar Backend**

```powershell
# Ver logs da API
docker-compose logs -f api

# Consultar banco
docker-compose exec db psql -U fitway_user -d fitway_db

# Ver horários de um instrutor (exemplo: id=1)
SELECT * FROM disponibilidade_instrutor WHERE id_instrutor = '1';
```

---

## 📊 Estado da Tabela no Banco

### Estrutura da Tabela

```sql
CREATE TABLE disponibilidade_instrutor (
    id_disponibilidade_instrutor UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_instrutor UUID NOT NULL REFERENCES instrutores(id_instrutor) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL CHECK (hora_fim > hora_inicio),
    disponivel BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX idx_disponibilidade_instrutor ON disponibilidade_instrutor(id_instrutor, dia_semana);
```

### Constraints

- ✅ `dia_semana BETWEEN 1 AND 7` (1=Segunda, 7=Domingo)
- ✅ `hora_fim > hora_inicio` (validação básica)
- ✅ `ON DELETE CASCADE` (deleta horários quando instrutor é deletado)
- ⚠️ **Falta validação de overlap no mesmo dia** (não implementada)

---

## 🔄 Integração com Outras Fases

### ✅ **Dependências Atendidas**

- Fase 5 ✅ - CRUD de Instrutores (pré-requisito)

### 📋 **Próximas Fases que Dependem Desta**

- **Fase 8**: Sessões Personal 1:1
  - Aluno só pode agendar dentro dos horários disponíveis
  - Validação: horário da sessão INTERSECT disponibilidade
  - Anti-overlap: não sobrepor com outras sessões do instrutor

---

## 📝 Observações Técnicas

### ✅ Pontos Fortes

1. **UI Intuitiva**: Modal simples e direto ao ponto
2. **Integração Completa**: Backend + Frontend + Types
3. **Transaction**: Garante consistência (delete old + insert new)
4. **Validação**: hora_fim > hora_inicio validado no backend

### ⚠️ Limitações Atuais

1. **Sem validação de overlap**: Instrutor pode criar dois horários conflitantes no mesmo dia
   - Exemplo: Segunda 08:00-12:00 E Segunda 10:00-14:00 (overlap!)
   - **Sugestão**: Adicionar validação no backend ou constraint no DB

2. **Soft Delete não implementado**: Horários são deletados permanentemente
   - **Impacto**: Histórico de disponibilidade não é preservado
   - **Sugestão**: Adicionar coluna `status` ('ativo', 'inativo')

3. **Sem recorrência**: Não permite copiar horário de uma semana para outra
   - **Impacto**: Instrutor precisa criar manualmente cada horário
   - **Sugestão futura**: Botão "Copiar para todas as semanas"

### 🚀 Melhorias Futuras (Opcional)

1. **Validação de Overlap**:

   ```sql
   -- Constraint GIST para evitar overlap no mesmo dia
   CREATE EXTENSION IF NOT EXISTS btree_gist;
   
   ALTER TABLE disponibilidade_instrutor
   ADD CONSTRAINT no_overlap_disponibilidade
   EXCLUDE USING GIST (
       id_instrutor WITH =,
       dia_semana WITH =,
       tstzrange(hora_inicio::time, hora_fim::time) WITH &&
   );
   ```

2. **Template de Horários**:
   - Admin define template padrão (ex: "Manhã: 08:00-12:00")
   - Instrutor aplica template com um clique

3. **Visualização Mensal**:
   - Calendário mostrando disponibilidade dos próximos 30 dias
   - Considerando feriados e bloqueios

---

## ✅ Conclusão

A **Fase 7 estava completamente implementada** e funcional, apenas não estava documentada formalmente no plano de ação.

**Descoberta**: Durante revisão do código em 16/10/2025, identificamos que:

- Backend tinha o endpoint `updateAvailability` pronto
- Frontend tinha modal completo com CRUD de horários
- Rota estava registrada e protegida
- Integração estava funcionando

**Próxima Fase**: Fase 8 - Sessões Personal 1:1 (agendamento com anti-overlap)

---

**Responsável**: Sistema (auto-documentação)  
**Aprovado**: ✅ Validado funcionalmente em 16/10/2025
