import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { plansService } from '@/services/plans.service';
import { Plan, PlanFormData } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Sparkles
} from 'lucide-react';

const CICLO_OPTIONS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'anual', label: 'Anual' },
];

const AdminPlans = () => {
  const { toast } = useToast();
  
  // State
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCiclo, setFilterCiclo] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PlanFormData>({
    nome: '',
    preco: 0,
    ciclo_cobranca: 'mensal',
    max_reservas_futuras: 2,
    beneficios_json: [],
    status: 'ativo',
  });
  
  // Benefícios como string para textarea
  const [beneficiosText, setBeneficiosText] = useState('');

  // Load plans
  useEffect(() => {
    loadPlans();
  }, [filterCiclo, filterStatus]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await plansService.listPlans({
        ciclo: filterCiclo as any,
        status: (filterStatus as 'ativo' | 'inativo') || undefined,
        search: searchTerm || undefined,
      });
      setPlans(response.data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar planos',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSearch = () => {
    loadPlans();
  };

  const openCreateModal = () => {
    setFormData({
      nome: '',
      preco: 0,
      ciclo_cobranca: 'mensal',
      max_reservas_futuras: 2,
      beneficios_json: [],
      status: 'ativo',
    });
    setBeneficiosText('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      nome: plan.nome,
      preco: plan.preco,
      ciclo_cobranca: plan.ciclo_cobranca,
      max_reservas_futuras: plan.max_reservas_futuras,
      beneficios_json: plan.beneficios_json,
      status: plan.status,
    });
    setBeneficiosText(plan.beneficios_json.join('\n'));
    setIsEditModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      
      // Converter textarea para array
      const beneficios = beneficiosText
        .split('\n')
        .map(b => b.trim())
        .filter(b => b.length > 0);
      
      await plansService.createPlano({
        ...formData,
        beneficios_json: beneficios,
      });
      
      toast({
        title: 'Plano criado com sucesso!',
        description: `${formData.nome} foi adicionado.`,
      });
      
      setIsCreateModalOpen(false);
      loadPlans();
    } catch (error) {
      toast({
        title: 'Erro ao criar plano',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPlan) return;
    
    try {
      setSubmitting(true);
      
      // Converter textarea para array
      const beneficios = beneficiosText
        .split('\n')
        .map(b => b.trim())
        .filter(b => b.length > 0);
      
      await plansService.updatePlano(selectedPlan.id_plano, {
        ...formData,
        beneficios_json: beneficios,
      });
      
      toast({
        title: 'Plano atualizado com sucesso!',
        description: `${formData.nome} foi modificado.`,
      });
      
      setIsEditModalOpen(false);
      loadPlans();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar plano',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    
    try {
      setSubmitting(true);
      await plansService.deletePlano(planToDelete.id_plano);
      
      toast({
        title: 'Plano excluído com sucesso!',
        description: `${planToDelete.nome} foi removido.`,
      });
      
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
      loadPlans();
    } catch (error) {
      toast({
        title: 'Erro ao excluir plano',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      await plansService.toggleStatus(plan.id_plano);
      
      toast({
        title: 'Status alterado com sucesso!',
        description: `${plan.nome} agora está ${plan.status === 'ativo' ? 'inativo' : 'ativo'}.`,
      });
      
      loadPlans();
    } catch (error) {
      toast({
        title: 'Erro ao alterar status',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  // Filtered plans (local search)
  const filteredPlans = plans.filter(plan => 
    plan.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Planos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os planos de assinatura disponíveis
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Nome do plano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="ciclo">Ciclo de Cobrança</Label>
              <Select value={filterCiclo || 'all'} onValueChange={(val) => setFilterCiclo(val === 'all' ? undefined : val)}>
                <SelectTrigger id="ciclo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {CICLO_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus || 'all'} onValueChange={(val) => setFilterStatus(val === 'all' ? undefined : val)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-fitway-green" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">Nenhum plano encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <Card key={plan.id_plano} className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-fitway-green" />
                      {plan.nome}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={plan.status === 'ativo' ? 'default' : 'secondary'}>
                        {plan.status === 'ativo' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Ativo</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Inativo</>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {CICLO_OPTIONS.find(c => c.value === plan.ciclo_cobranca)?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Preço */}
                <div className="flex items-center gap-2 text-2xl font-bold text-fitway-green">
                  <DollarSign className="h-6 w-6" />
                  {formatCurrency(plan.preco)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.ciclo_cobranca === 'mensal' ? 'mês' : plan.ciclo_cobranca === 'trimestral' ? 'trimestre' : 'ano'}
                  </span>
                </div>

                {/* Max Reservas */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Até {plan.max_reservas_futuras} reservas futuras
                </div>

                {/* Benefícios */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Benefícios:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {plan.beneficios_json.map((beneficio, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-fitway-green mt-0.5 flex-shrink-0" />
                        <span>{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Criado em {formatDate(plan.criado_em)}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(plan)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={plan.status === 'ativo' ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleToggleStatus(plan)}
                  >
                    {plan.status === 'ativo' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDelete(plan)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Plano</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo plano de assinatura
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-nome">Nome do Plano *</Label>
              <Input
                id="create-nome"
                placeholder="Ex: Plano Premium"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-preco">Preço *</Label>
                <Input
                  id="create-preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-ciclo">Ciclo de Cobrança *</Label>
                <Select 
                  value={formData.ciclo_cobranca} 
                  onValueChange={(val) => setFormData({ ...formData, ciclo_cobranca: val as any })}
                >
                  <SelectTrigger id="create-ciclo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CICLO_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-max-reservas">Máximo de Reservas Futuras</Label>
              <Input
                id="create-max-reservas"
                type="number"
                min="0"
                placeholder="2"
                value={formData.max_reservas_futuras}
                onChange={(e) => setFormData({ ...formData, max_reservas_futuras: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-beneficios">Benefícios (um por linha)</Label>
              <Textarea
                id="create-beneficios"
                placeholder="Acesso a todas as quadras&#10;Até 5 reservas futuras&#10;Desconto de 20% em aulas"
                rows={6}
                value={beneficiosText}
                onChange={(e) => setBeneficiosText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Digite cada benefício em uma linha separada
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({ ...formData, status: val as any })}
              >
                <SelectTrigger id="create-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !formData.nome || formData.preco <= 0}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</>
              ) : (
                'Criar Plano'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Modifique os dados do plano {selectedPlan?.nome}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nome">Nome do Plano *</Label>
              <Input
                id="edit-nome"
                placeholder="Ex: Plano Premium"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-preco">Preço *</Label>
                <Input
                  id="edit-preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-ciclo">Ciclo de Cobrança *</Label>
                <Select 
                  value={formData.ciclo_cobranca} 
                  onValueChange={(val) => setFormData({ ...formData, ciclo_cobranca: val as any })}
                >
                  <SelectTrigger id="edit-ciclo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CICLO_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-max-reservas">Máximo de Reservas Futuras</Label>
              <Input
                id="edit-max-reservas"
                type="number"
                min="0"
                placeholder="2"
                value={formData.max_reservas_futuras}
                onChange={(e) => setFormData({ ...formData, max_reservas_futuras: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-beneficios">Benefícios (um por linha)</Label>
              <Textarea
                id="edit-beneficios"
                placeholder="Acesso a todas as quadras&#10;Até 5 reservas futuras&#10;Desconto de 20% em aulas"
                rows={6}
                value={beneficiosText}
                onChange={(e) => setBeneficiosText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Digite cada benefício em uma linha separada
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({ ...formData, status: val as any })}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={submitting || !formData.nome || formData.preco <= 0}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano <strong>{planToDelete?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...</>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPlans;
