import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { CardSkeleton } from '@/components/LoadingSkeletons';

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'court' | 'class';
  item: any; // Court ou Aula
}

export function AvailabilityModal({ isOpen, onClose, type, item }: AvailabilityModalProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      loadAvailability();
    }
  }, [isOpen, item, selectedDate]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      if (type === 'court') {
        // TODO: Chamar API /api/public/courts/{id}/availability?date=YYYY-MM-DD
        // Por enquanto, mock de horários disponíveis
        const slots: string[] = [];
        for (let hour = 6; hour <= 22; hour++) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          if (hour < 22) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
          }
        }
        setAvailableSlots(slots);
      } else {
        // Para aulas, mostrar horários semanais fixos
        // TODO: Chamar API /api/public/classes/{id}/schedules
        // Por enquanto, mock
        setAvailableSlots([
          'Segunda 18:00 - 19:00',
          'Quarta 18:00 - 19:00',
          'Sexta 18:00 - 19:00'
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = () => {
    if (!selectedSlot) return;
    
    // Redirecionar para login com dados da reserva
    const reserveData = {
      type,
      itemId: type === 'court' ? item.id_quadra : item.id_aula,
      itemName: item.nome,
      date: selectedDate,
      slot: selectedSlot,
    };
    
    // Salvar no sessionStorage para recuperar após login
    sessionStorage.setItem('pendingReservation', JSON.stringify(reserveData));
    
    // Redirecionar para login
    navigate('/login', { state: { from: '/', pendingReservation: reserveData } });
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 dias à frente
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-fitway-dark border-fitway-green/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            {type === 'court' ? <MapPin className="h-6 w-6 text-fitway-green" /> : <Users className="h-6 w-6 text-fitway-green" />}
            {item?.nome}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {type === 'court' 
              ? `Selecione a data e horário para reservar esta quadra. Valor: ${formatCurrency(item?.preco_hora || 0)}/hora`
              : `Veja os horários disponíveis para esta aula. Valor: ${formatCurrency(item?.preco_unitario || 0)}/aula`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Item */}
          <div className="grid gap-3 p-4 bg-white/5 rounded-lg border border-fitway-green/30">
            {type === 'court' ? (
              <>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-fitway-green" />
                  <span className="text-white/80">{item?.localizacao}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-fitway-green" />
                  <span className="text-white/80 capitalize">{item?.esporte?.replace('_', ' ')}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-fitway-green" />
                  <span className="text-white/80">{item?.duracao_min} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-fitway-green" />
                  <span className="text-white/80">{item?.capacidade_max} vagas</span>
                </div>
                {item?.nivel && (
                  <Badge variant="outline" className="w-fit border-fitway-green text-fitway-green capitalize">
                    {item.nivel}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Seletor de Data (só para quadras) */}
          {type === 'court' && (
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white">Data da Reserva</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                min={getMinDate()}
                max={getMaxDate()}
                className="bg-white/10 border-fitway-green/30 text-white"
              />
            </div>
          )}

          {/* Horários Disponíveis */}
          <div className="space-y-2">
            <Label className="text-white">
              {type === 'court' ? 'Horários Disponíveis' : 'Horários Semanais'}
            </Label>
            {loading ? (
              <CardSkeleton />
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-white/5 rounded-lg border border-fitway-green/30">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? 'default' : 'outline'}
                      className={`text-sm ${
                        selectedSlot === slot
                          ? 'bg-fitway-green text-fitway-dark hover:bg-fitway-green/90'
                          : 'border-fitway-green/30 text-white hover:bg-fitway-green/20'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Clock className="mr-2 h-3 w-3" />
                      {slot}
                    </Button>
                  ))
                ) : (
                  <p className="text-white/50 col-span-3 text-center py-4">
                    Nenhum horário disponível nesta data
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Resumo e Ação */}
          {selectedSlot && (
            <div className="p-4 bg-fitway-green/10 rounded-lg border border-fitway-green/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Horário Selecionado:</span>
                <span className="text-fitway-green font-bold">{selectedSlot}</span>
              </div>
              {type === 'court' && (
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Valor:</span>
                  <span className="text-fitway-green font-bold">{formatCurrency(item?.preco_hora || 0)}/hora</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-fitway-green/30">
          <Button variant="outline" onClick={onClose} className="border-white/30 text-white hover:bg-white/10">
            Cancelar
          </Button>
          <Button 
            variant="sport" 
            onClick={handleReserve}
            disabled={!selectedSlot}
            className="bg-fitway-green hover:bg-fitway-green/90"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {type === 'court' ? 'Reservar (Login necessário)' : 'Inscrever-se (Login necessário)'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
