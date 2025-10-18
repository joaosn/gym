import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { courtBookingsService } from '@/services/court-bookings.service';
import { courtsService } from '@/services/courts.service';
import type { CourtBooking, Court } from '@/types';
import { formatCurrency, formatDate, formatTime, debounce, getErrorMessage } from '@/lib/utils';

export default function InstructorCourtBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CourtBooking | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [statusFilter, courtFilter, dataInicio, dataFim]);

  const loadInitialData = async () => {
    try {
      const courtsData = await courtsService.getAdminCourts({ status: 'ativa' });
      setCourts(courtsData.data || []);
      await loadBookings();
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (courtFilter !== 'all') filters.id_quadra = courtFilter;
      if (dataInicio) filters.data_inicio = dataInicio;
      if (dataFim) filters.data_fim = dataFim;
      if (searchTerm) filters.search = searchTerm;

      const response = await courtBookingsService.list(filters);
      setBookings(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar reservas',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((term: string) => {
    setSearchTerm(term);
    loadBookings();
  }, 500);

  const openViewModal = (booking: CourtBooking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
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

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.usuario?.nome.toLowerCase().includes(searchLower) ||
      booking.quadra?.nome.toLowerCase().includes(searchLower)
    );
  });

  const todayBookings = filteredBookings.filter(b => {
    const bookingDate = new Date(b.inicio).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today && ['pendente', 'confirmada'].includes(b.status);
  });

  const upcomingBookings = filteredBookings.filter(b => {
    const bookingDate = new Date(b.inicio);
    const today = new Date();
    return bookingDate > today && ['pendente', 'confirmada'].includes(b.status);
  });

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reservas de Quadras</h1>
        <p className="text-muted-foreground">Visualize as reservas das quadras</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por usuário ou quadra..."
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
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

          <Select value={courtFilter} onValueChange={setCourtFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as quadras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as quadras</SelectItem>
              {courts.map((court) => (
                <SelectItem key={court.id_quadra} value={court.id_quadra}>
                  {court.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            placeholder="Data início"
          />

          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            placeholder="Data fim"
          />
        </div>
      </div>

      {/* Reservas de Hoje */}
      {todayBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Hoje</h2>
          <div className="grid gap-4">
            {todayBookings.map((booking) => (
              <Card key={booking.id_reserva_quadra} className="border-l-4 border-l-fitway-green">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-fitway-green" />
                        <span className="font-semibold">{booking.quadra?.nome || 'N/A'}</span>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{booking.usuario?.nome || 'N/A'}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
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

      {/* Próximas Reservas */}
      {upcomingBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Próximas Reservas</h2>
          <div className="grid gap-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id_reserva_quadra}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-fitway-green" />
                        <span className="font-semibold">{booking.quadra?.nome || 'N/A'}</span>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{booking.usuario?.nome || 'N/A'}</span>
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

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Nenhuma reserva encontrada</p>
          </CardContent>
        </Card>
      )}

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
              <div>
                <Label className="text-muted-foreground">Usuário</Label>
                <p className="font-semibold">{selectedBooking.usuario?.nome || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.usuario?.email}</p>
                {selectedBooking.usuario?.telefone && (
                  <p className="text-sm text-muted-foreground">{selectedBooking.usuario.telefone}</p>
                )}
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
    </div>
  );
}
