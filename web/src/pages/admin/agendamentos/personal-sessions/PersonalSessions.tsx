import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, DollarSign, Clock, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { personalSessionsService } from '@/services/personal-sessions.service';
import { instructorsService } from '@/services/instructors.service';
import { usersService } from '@/services/users.service';
import { courtsService } from '@/services/courts.service';
import type { PersonalSession, PersonalSessionFormData, Instructor, AdminUser, Court } from '@/types';
import { formatCurrency, formatDate, formatTime, debounce, getErrorMessage } from '@/lib/utils';

export default function PersonalSessionsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<PersonalSession[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodoFilter, setPeriodoFilter] = useState<string>('all');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PersonalSession | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<PersonalSessionFormData>({
    id_instrutor: '',
    id_usuario: '',
    id_quadra: '',
    inicio: '',
    fim: '',
    observacoes: '',
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar sessões quando filtros mudarem
  useEffect(() => {
    loadSessions();
  }, [statusFilter, periodoFilter, instructorFilter]);

  const loadInitialData = async () => {
    console.log('🔑 Token:', localStorage.getItem('access_token') ? 'Presente ✅' : 'Ausente ❌');
    
    try {
      const [sessionsData, instructorsData, studentsData, courtsData] = await Promise.all([
        personalSessionsService.list({ per_page: 100 }),
        instructorsService.listInstructors({ status: 'ativo' }),
        usersService.listUsers({ papel: 'aluno', status: 'ativo' }),
        courtsService.getAdminCourts({ status: 'ativa' }),
      ]);

      console.log('📊 Sessions Data:', sessionsData);
      console.log('👨‍🏫 Instructors Data:', instructorsData);
      console.log('🎓 Students Data:', studentsData);
      console.log('🏟️ Courts Data:', courtsData);

      setSessions(sessionsData.data || []);
      setInstructors(instructorsData.data || []);
      setStudents(studentsData.data || []);
      setCourts(courtsData.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setSessions([]);
      setInstructors([]);
      setStudents([]);
      setCourts([]);
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const filters: any = { per_page: 100 };
      
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (periodoFilter !== 'all') filters.periodo = periodoFilter;
      if (instructorFilter !== 'all') filters.id_instrutor = instructorFilter;

      const data = await personalSessionsService.list(filters);
      setSessions(data.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error);
      setSessions([]);
      toast({
        title: 'Erro ao carregar sessões',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.id_instrutor || !formData.id_usuario || !formData.inicio || !formData.fim) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    // Validar que fim > inicio
    if (new Date(formData.fim) <= new Date(formData.inicio)) {
      toast({
        title: 'Horário inválido',
        description: 'O horário de término deve ser após o horário de início',
        variant: 'destructive',
      });
      return;
    }

    // Verificar disponibilidade primeiro (instrutor + quadra se informada)
    try {
      setSubmitting(true);
      const availability = await personalSessionsService.checkAvailability({
        id_instrutor: formData.id_instrutor,
        inicio: formData.inicio,
        fim: formData.fim,
        id_quadra: formData.id_quadra || undefined, // Enviar quadra se selecionada
      });

      if (!availability.disponivel) {
        toast({
          title: 'Horário indisponível',
          description: availability.motivo || 'O instrutor não está disponível neste horário',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Criar sessão
      await personalSessionsService.create(formData);
      toast({
        title: 'Sessão criada!',
        description: `Preço calculado: ${formatCurrency(availability.preco_total || 0)}`,
      });
      
      setCreateModalOpen(false);
      resetForm();
      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar sessão',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSession) return;

    try {
      setSubmitting(true);
      await personalSessionsService.update(selectedSession.id_sessao_personal, {
        id_quadra: formData.id_quadra || undefined,
        observacoes: formData.observacoes,
      } as any);

      toast({ title: 'Sessão atualizada com sucesso!' });
      setEditModalOpen(false);
      resetForm();
      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar sessão',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSession) return;

    try {
      setSubmitting(true);
      await personalSessionsService.cancel(selectedSession.id_sessao_personal);
      toast({ title: 'Sessão cancelada com sucesso!' });
      setDeleteModalOpen(false);
      setSelectedSession(null);
      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar sessão',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (session: PersonalSession) => {
    try {
      await personalSessionsService.confirm(session.id_sessao_personal);
      toast({ title: 'Sessão confirmada!' });
      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Erro ao confirmar sessão',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id_instrutor: '',
      id_usuario: '',
      id_quadra: '',
      inicio: '',
      fim: '',
      observacoes: '',
    });
    setSelectedSession(null);
  };

  const openEditModal = (session: PersonalSession) => {
    setSelectedSession(session);
    setFormData({
      id_instrutor: session.id_instrutor,
      id_usuario: session.id_usuario,
      id_quadra: session.id_quadra || '',
      inicio: session.inicio,
      fim: session.fim,
      observacoes: session.observacoes || '',
      status: session.status,
    } as any);
    setEditModalOpen(true);
  };

  const openViewModal = (session: PersonalSession) => {
    setSelectedSession(session);
    setViewModalOpen(true);
  };

  const openDeleteModal = (session: PersonalSession) => {
    setSelectedSession(session);
    setDeleteModalOpen(true);
  };

  // Filtrar sessões por busca
  const filteredSessions = (sessions || []).filter((session) => {
    const searchLower = searchTerm.toLowerCase();
    const instructorName = session.instrutor?.nome || '';
    const studentName = session.usuario?.nome || '';
    
    return (
      instructorName.toLowerCase().includes(searchLower) ||
      studentName.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: PersonalSession['status']) => {
    const variants: Record<PersonalSession['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pendente: { label: 'Pendente', variant: 'secondary' },
      confirmada: { label: 'Confirmada', variant: 'default' },
      cancelada: { label: 'Cancelada', variant: 'destructive' },
      concluida: { label: 'Concluída', variant: 'outline' },
      no_show: { label: 'Faltou', variant: 'destructive' },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitway-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessões Personal</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as sessões 1:1 entre instrutores e alunos
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Sessão
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="no_show">Faltou</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Período */}
            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Períodos</SelectItem>
                <SelectItem value="futuras">Futuras</SelectItem>
                <SelectItem value="passadas">Passadas</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Instrutor */}
            <Select value={instructorFilter} onValueChange={setInstructorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Instrutor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Instrutores</SelectItem>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id_instrutor} value={instructor.id_instrutor}>
                    {instructor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sessões */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma sessão encontrada
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id_sessao_personal} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Linha 1: Instrutor e Aluno */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-fitway-green" />
                        <span className="font-medium">
                          {session.instrutor?.nome || 'Instrutor desconhecido'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span>{session.usuario?.nome || 'Aluno desconhecido'}</span>
                      </div>
                    </div>

                    {/* Linha 2: Data e Horário */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{formatDate(session.inicio, true)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {formatTime(session.inicio)} - {formatTime(session.fim)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {formatCurrency(session.preco_total)}
                        </span>
                      </div>
                    </div>

                    {/* Linha 3: Observações */}
                    {session.observacoes && (
                      <div className="text-sm text-muted-foreground">
                        {session.observacoes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(session.status)}
                    
                    {session.status === 'pendente' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfirm(session)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirmar
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewModal(session)}
                    >
                      Ver Detalhes
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(session)}
                    >
                      Editar
                    </Button>

                    {session.status !== 'cancelada' && session.status !== 'concluida' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteModal(session)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Criar Sessão */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Sessão Personal</DialogTitle>
            <DialogDescription>
              Agende uma sessão 1:1 entre instrutor e aluno
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Instrutor */}
            <div className="space-y-2">
              <Label htmlFor="instructor">Instrutor *</Label>
              <Select
                value={formData.id_instrutor}
                onValueChange={(value) => setFormData({ ...formData, id_instrutor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o instrutor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id_instrutor} value={instructor.id_instrutor}>
                      {instructor.nome} - {formatCurrency(instructor.valor_hora)}/h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aluno */}
            <div className="space-y-2">
              <Label htmlFor="student">Aluno *</Label>
              <Select
                value={formData.id_usuario}
                onValueChange={(value) => setFormData({ ...formData, id_usuario: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id_usuario} value={student.id_usuario}>
                      {student.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data/Hora Início */}
            <div className="space-y-2">
              <Label htmlFor="inicio">Data/Hora Início *</Label>
              <Input
                id="inicio"
                type="datetime-local"
                value={formData.inicio}
                onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
              />
            </div>

            {/* Data/Hora Fim */}
            <div className="space-y-2">
              <Label htmlFor="fim">Data/Hora Fim *</Label>
              <Input
                id="fim"
                type="datetime-local"
                value={formData.fim}
                onChange={(e) => setFormData({ ...formData, fim: e.target.value })}
              />
            </div>

            {/* Quadra (Opcional) */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="quadra">Quadra (Opcional)</Label>
              <Select
                value={formData.id_quadra || 'none'}
                onValueChange={(value) => setFormData({ ...formData, id_quadra: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a quadra (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {courts.map((court) => (
                    <SelectItem key={court.id_quadra} value={court.id_quadra}>
                      {court.nome} - {court.esporte}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                placeholder="Ex: Treino focado em forehand"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar Sessão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Sessão */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Sessão</DialogTitle>
            <DialogDescription>
              Altere a quadra, observações ou status da sessão
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quadra */}
            <div className="space-y-2">
              <Label htmlFor="edit-quadra">Quadra (Opcional)</Label>
              <Select
                value={formData.id_quadra || 'none'}
                onValueChange={(value) => setFormData({ ...formData, id_quadra: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a quadra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {courts.map((court) => (
                    <SelectItem key={court.id_quadra} value={court.id_quadra}>
                      {court.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={(formData as any).status}
                onValueChange={(value) => setFormData({ ...formData, status: value } as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="no_show">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="edit-observacoes">Observações</Label>
              <Input
                id="edit-observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver Detalhes */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Sessão</DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Instrutor</Label>
                  <p className="font-medium">{selectedSession.instrutor?.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Aluno</Label>
                  <p className="font-medium">{selectedSession.usuario?.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p>{formatDate(selectedSession.inicio)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Horário</Label>
                  <p>
                    {formatTime(selectedSession.inicio)} - {formatTime(selectedSession.fim)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quadra</Label>
                  <p>{selectedSession.quadra?.nome || 'Não especificada'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Preço</Label>
                  <p className="font-medium">{formatCurrency(selectedSession.preco_total)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSession.status)}</div>
                </div>
                {selectedSession.observacoes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Observações</Label>
                    <p>{selectedSession.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Cancelamento */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Sessão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta sessão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter sessão</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Cancelando...' : 'Sim, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
