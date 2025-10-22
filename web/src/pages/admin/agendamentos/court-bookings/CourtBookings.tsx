import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, MapPin, DollarSign, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client'; // ← NOVO!
import { courtBookingsService } from '@/services/court-bookings.service';
import { courtsService } from '@/services/courts.service';
import { usersService } from '@/services/users.service';
import type { CourtBooking, CourtBookingFormData, Court, AdminUser } from '@/types'; // ← AdminUser ao invés de User
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

export default function CourtBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]); // ← AdminUser ao invés de User
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CourtBooking | null>(null);
  
  // Form data - campos separados
  const [formData, setFormData] = useState({
    id_quadra: '',
    id_usuario: '', // ← NOVO para admin
    data: new Date().toISOString().split('T')[0], // Data padrão: hoje
    horaInicio: '08:00',
    horaFim: '09:00',
    observacoes: '',
  });

  // 🎯 Helper para formatar erros de validação (NOVO!)
  const formatValidationErrors = (error: any): string => {
    if (error.errors && typeof error.errors === 'object') {
      const errorMessages = Object.entries(error.errors)
        .map(([field, messages]) => {
          const fieldLabel: Record<string, string> = {
            id_quadra: 'Quadra',
            id_usuario: 'Usuário',
            inicio: 'Data/Hora de início',
            fim: 'Data/Hora de término',
            observacoes: 'Observações',
          };
          const label = fieldLabel[field] || field;
          const msgArray = Array.isArray(messages) ? messages : [messages];
          return `• ${label}: ${msgArray.join(', ')}`;
        })
        .join('\n');
      return errorMessages;
    }
    return error.message || 'Erro desconhecido';
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMyBookings();
  }, [statusFilter]);

  const loadInitialData = async () => {
    try {
      const [courtsData, usersData] = await Promise.all([
        courtsService.getAdminCourts({ status: 'ativa' }),
        usersService.listUsers(), // ← CORRIGIDO: listUsers ao invés de getAll
      ]);
      
      setCourts(courtsData.data || []);
      setUsers(usersData.data || []);
      await loadMyBookings();
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      
      // Admin vê TODAS as reservas (sem filtro de usuário)
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await courtBookingsService.list(filters);
      setBookings(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar reservas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.id_quadra || !formData.data || !formData.horaInicio || !formData.horaFim) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    // Admin precisa selecionar usuário no form (não pega current user)
    if (!formData.id_usuario) {
      toast({
        title: 'Usuário obrigatório',
        description: 'Selecione o usuário para a reserva',
        variant: 'destructive',
      });
      return;
    }

    // Validar que horaFim > horaInicio
    if (formData.horaFim <= formData.horaInicio) {
      toast({
        title: 'Horário inválido',
        description: 'O horário de término deve ser após o horário de início',
        variant: 'destructive',
      });
      return;
    }

    // Montar datetime ISO
    const inicio = `${formData.data}T${formData.horaInicio}:00`;
    const fim = `${formData.data}T${formData.horaFim}:00`;
    try {
      setSubmitting(true);
      
      // Verificar disponibilidade
      const availabilityResponse = await courtBookingsService.checkAvailability({
        id_quadra: parseInt(formData.id_quadra), // ← Converter para número
        inicio,
        fim,
      });

      if (!availabilityResponse.data.disponivel) {
        toast({
          title: 'Quadra indisponível',
          description: availabilityResponse.data.motivo || 'A quadra não está disponível neste horário',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Criar reserva
      await courtBookingsService.create({
        id_quadra: parseInt(formData.id_quadra), // ← Converter para número
        id_usuario: parseInt(formData.id_usuario), // ← Pegar do formData (admin escolhe)
        inicio,
        fim,
        observacoes: formData.observacoes,
      });

      toast({
        title: 'Reserva criada!',
        description: `Preço: ${formatCurrency(availabilityResponse.data.preco_total || 0)}`,
      });
      
      setCreateModalOpen(false);
      resetForm();
      loadMyBookings();
    } catch (error: any) {
      // 🎯 Usar formatValidationErrors (NOVO!)
      const errorMessage = formatValidationErrors(error);
      toast({
        title: 'Erro ao criar reserva',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally{
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;

    try {
      const response = await courtBookingsService.cancel(selectedBooking.id_reserva_quadra);
      
      // Se cobrança foi cancelada junto, mostrar mensagem diferente
      const description = response.data?.cobranca_cancelada 
        ? 'Reserva e cobrança pendente canceladas com sucesso.'
        : 'Reserva cancelada com sucesso.';
      
      toast({ title: 'Sucesso!', description });
      
      setCancelModalOpen(false);
      setSelectedBooking(null);
      loadMyBookings();
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar reserva',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openViewModal = (booking: CourtBooking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
  };

  const openCancelModal = (booking: CourtBooking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id_quadra: '',
      id_usuario: '', // ← Adicionar
      data: new Date().toISOString().split('T')[0],
      horaInicio: '08:00',
      horaFim: '09:00',
      observacoes: '',
    });
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pendente: 'secondary',
      confirmada: 'default',
      cancelada: 'destructive',
      no_show: 'outline',
      concluida: 'outline',
    };

    const labels: Record<string, string> = {
      pendente: 'Pendente',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      no_show: 'Não Compareceu',
      concluida: 'Concluída',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const futureBookings = bookings.filter(b => new Date(b.inicio) >= new Date());
  const pastBookings = bookings.filter(b => new Date(b.inicio) < new Date());

  if (loading && bookings.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitway-green"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Minhas Reservas</h1>
          <p className="text-muted-foreground">Gerencie suas reservas de quadras</p>
        </div>
        <Button onClick={() => { resetForm(); setCreateModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Próximas Reservas */}
      {futureBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Próximas Reservas</h2>
          <div className="grid gap-4">
            {futureBookings.map((booking) => (
              <Card key={booking.id_reserva_quadra} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-fitway-green" />
                        <span className="font-semibold">{booking.quadra?.nome || 'N/A'}</span>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(booking.inicio)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatTime(booking.inicio)} - {formatTime(booking.fim)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-fitway-green">
                            {formatCurrency(booking.preco_total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openViewModal(booking)}>
                        Ver Detalhes
                      </Button>
                      {['pendente', 'confirmada'].includes(booking.status) && (
                        <Button variant="destructive" size="sm" onClick={() => openCancelModal(booking)}>
                          <X className="mr-1 h-4 w-4" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Histórico</h2>
          <div className="grid gap-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id_reserva_quadra} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{booking.quadra?.nome || 'N/A'}</span>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(booking.inicio)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(booking.inicio)} - {formatTime(booking.fim)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => openViewModal(booking)}>
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</p>
            <p className="text-muted-foreground mb-4">Comece reservando uma quadra!</p>
            <Button onClick={() => { resetForm(); setCreateModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Fazer Primeira Reserva
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criar */}
      <Dialog open={createModalOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Reserva</DialogTitle>
            <DialogDescription>
              Preencha os dados para reservar uma quadra
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Quadra */}
            <div>
              <Label htmlFor="quadra">Quadra *</Label>
              <Select
                value={formData.id_quadra}
                onValueChange={(value) => setFormData({ ...formData, id_quadra: value })}
              >
                <SelectTrigger id="quadra">
                  <SelectValue placeholder="Selecione a quadra" />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((court) => (
                    <SelectItem key={court.id_quadra} value={court.id_quadra}>
                      {court.nome} - {formatCurrency(court.preco_hora)}/hora
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 🎯 NOVO: Usuário (ADMIN ESCOLHE PARA QUEM) */}
            <div>
              <Label htmlFor="usuario">Usuário *</Label>
              <Select
                value={formData.id_usuario}
                onValueChange={(value) => setFormData({ ...formData, id_usuario: value })}
              >
                <SelectTrigger id="usuario">
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id_usuario} value={user.id_usuario}>
                      {user.nome} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horaInicio">Hora Início *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="horaFim">Hora Fim *</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={formData.horaFim}
                  onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Criando...' : 'Reservar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Quadra</Label>
                <p className="font-semibold">{selectedBooking.quadra?.nome || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p className="font-semibold">{formatDate(selectedBooking.inicio)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Horário</Label>
                  <p className="font-semibold">
                    {formatTime(selectedBooking.inicio)} - {formatTime(selectedBooking.fim)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Preço</Label>
                  <p className="font-semibold text-fitway-green">
                    {formatCurrency(selectedBooking.preco_total)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>
              {selectedBooking.observacoes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="text-sm">{selectedBooking.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <AlertDialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva?
              {selectedBooking && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{selectedBooking.quadra?.nome}</p>
                  <p className="text-sm">
                    {formatDate(selectedBooking.inicio)} • {formatTime(selectedBooking.inicio)} - {formatTime(selectedBooking.fim)}
                  </p>
                  <p className="text-sm font-semibold text-fitway-green">
                    {formatCurrency(selectedBooking.preco_total)}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive">
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
