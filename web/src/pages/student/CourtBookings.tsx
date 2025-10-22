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
import { courtBookingsService } from '@/services/court-bookings.service';
import { courtsService } from '@/services/courts.service';
import { authService } from '@/services/auth.service';
import type { CourtBooking, CourtBookingFormData, Court } from '@/types';
import { formatCurrency, formatDate, formatTime, getErrorMessage } from '@/lib/utils';

export default function StudentCourtBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmCreateModal, setConfirmCreateModal] = useState<{
    open: boolean;
    court: Court | null;
    inicio: string;
    fim: string;
    price: number;
    observacoes?: string;
    userId?: string;
  }>({
    open: false,
    court: null,
    inicio: '',
    fim: '',
    price: 0,
    observacoes: '',
    userId: undefined,
  });
  const [confirmingCreate, setConfirmingCreate] = useState(false);
  
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
    data: new Date().toISOString().split('T')[0], // Data padrÃ£o: hoje
    horaInicio: '08:00',
    horaFim: '09:00',
    observacoes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMyBookings();
  }, [statusFilter]);

  const loadInitialData = async () => {
    try {
      const courtsData = await courtsService.getPublicCourts();
      setCourts(courtsData || []);
      await loadMyBookings();
    } catch (error: any) { toast({ title: 'Erro ao processar', description: getErrorMessage(error), variant: 'destructive' }); 
    } finally {
      setLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await courtBookingsService.list(filters);
      setBookings(response.data || []);
    } catch (error: any) { toast({ title: 'Erro ao processar', description: getErrorMessage(error), variant: 'destructive' }); 
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.id_quadra || !formData.data || !formData.horaInicio || !formData.horaFim) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Preencha todos os campos obrigatorios',
        variant: 'destructive',
      });
      return;
    }

    const currentUser = await authService.getCurrentUser();
    if (!currentUser) return;

    if (formData.horaFim <= formData.horaInicio) {
      toast({
        title: 'Horario invalido',
        description: 'O horario de termino deve ser apos o horario de inicio',
        variant: 'destructive',
      });
      return;
    }

    const inicio = `${formData.data}T${formData.horaInicio}:00`;
    const fim = `${formData.data}T${formData.horaFim}:00`;
    const durationHours = Math.max(1, (new Date(fim).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60));

    try {
      setSubmitting(true);

      const availabilityResponse = await courtBookingsService.checkAvailability({
        id_quadra: parseInt(formData.id_quadra, 10),
        inicio,
        fim,
      });

      if (!availabilityResponse.data.disponivel) {
        toast({
          title: 'Quadra indisponivel',
          description: availabilityResponse.data.motivo || 'A quadra nao esta disponivel neste horario',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      const selectedCourt = courts.find(c => String(c.id_quadra) === formData.id_quadra) || null;
      const precoCalculado = availabilityResponse.data.preco_total
        ?? ((selectedCourt?.preco_hora || 0) * durationHours);

      setConfirmCreateModal({
        open: true,
        court: selectedCourt,
        inicio,
        fim,
        price: precoCalculado,
        observacoes: formData.observacoes,
        userId: currentUser.id,
      });
    } catch (error: any) {
      toast({ title: 'Erro ao processar', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCreate = async () => {
    if (!confirmCreateModal.open || !confirmCreateModal.court) return;

    try {
      setConfirmingCreate(true);

      await courtBookingsService.create({
        id_quadra: parseInt(String(confirmCreateModal.court.id_quadra), 10),
        id_usuario: parseInt(confirmCreateModal.userId || '0', 10),
        inicio: confirmCreateModal.inicio,
        fim: confirmCreateModal.fim,
        observacoes: confirmCreateModal.observacoes,
      });

      toast({
        title: 'Reserva criada!',
        description: `Valor: ${formatCurrency(confirmCreateModal.price)}`,
      });

      setConfirmCreateModal({
        open: false,
        court: null,
        inicio: '',
        fim: '',
        price: 0,
        observacoes: '',
        userId: undefined,
      });
      setCreateModalOpen(false);
      resetForm();
      loadMyBookings();
    } catch (error: any) {
      toast({ title: 'Erro ao processar', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setConfirmingCreate(false);
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
        title: 'Erro ao cancelar', 
        description: getErrorMessage(error), 
        variant: 'destructive' 
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
      no_show: 'Nao Compareceu',
      concluida: 'ConcluÃ­da',
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
            <SelectItem value="concluida">ConcluÃ­da</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PrÃ³ximas Reservas */}
      {futureBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">PrÃ³ximas Reservas</h2>
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

      {/* HistÃ³rico */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">HistÃ³rico</h2>
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

            {/* HorÃ¡rios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horaInicio">Hora InÃ­cio *</Label>
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

            {/* Observacoes */}
            <div>
              <Label htmlFor="observacoes">Observacoes</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observacoes adicionais..."
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

      {/* Modal de VisualizaÃ§Ã£o */}
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
                  <Label className="text-muted-foreground">HorÃ¡rio</Label>
                  <p className="font-semibold">
                    {formatTime(selectedBooking.inicio)} - {formatTime(selectedBooking.fim)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Preco</Label>
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
                  <Label className="text-muted-foreground">Observacoes</Label>
                  <p className="text-sm">{selectedBooking.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmCreateModal.open}
        onOpenChange={(open) => {
          if (!open && !confirmingCreate) {
            setConfirmCreateModal({
              open: false,
              court: null,
              inicio: '',
              fim: '',
              price: 0,
              observacoes: '',
              userId: undefined,
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Revise os detalhes antes de confirmar. Uma cobranca sera gerada automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirmCreateModal.court && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Quadra</p>
                <p className="font-semibold">{confirmCreateModal.court.nome}</p>
                <p className="text-sm text-muted-foreground">{confirmCreateModal.court.localizacao}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Inicio</p>
                  <p className="font-semibold">{formatDate(confirmCreateModal.inicio)} as {formatTime(confirmCreateModal.inicio)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fim</p>
                  <p className="font-semibold">{formatDate(confirmCreateModal.fim)} as {formatTime(confirmCreateModal.fim)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm border-t pt-2">
                <span className="text-muted-foreground">Valor</span>
                <span className="text-fitway-green font-bold">{formatCurrency(confirmCreateModal.price)}</span>
              </div>
              {confirmCreateModal.observacoes && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-white">Observacoes</p>
                  <p>{confirmCreateModal.observacoes}</p>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmingCreate}>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCreate} disabled={confirmingCreate}>
              {confirmingCreate ? 'Processando...' : 'Confirmar e gerar cobranca'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
                    {formatDate(selectedBooking.inicio)} as {formatTime(selectedBooking.inicio)} - {formatTime(selectedBooking.fim)}
                  </p>
                  <p className="text-sm font-semibold text-fitway-green">
                    {formatCurrency(selectedBooking.preco_total)}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nao, manter</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive">
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

