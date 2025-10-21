import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '@/services/notifications.service';
import type { Notificacao } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Check, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  Dumbbell, 
  MapPin, 
  BookOpen, 
  Star, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FilterTab = 'all' | 'true' | 'false';

export default function NotificationList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationsService.list({ lida: filter });
      setNotifications(result.data);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar notificações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id_notificacao === id ? { ...n, lida: true, data_leitura: new Date().toISOString() } : n))
      );
      toast({
        title: 'Notificação marcada como lida',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao marcar notificação',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      await notificationsService.markAllAsRead();
      await loadNotifications();
      toast({
        title: 'Todas as notificações foram marcadas como lidas',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao marcar todas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await notificationsService.delete(deleteId);
      setNotifications((prev) => prev.filter((n) => n.id_notificacao !== deleteId));
      toast({
        title: 'Notificação excluída',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir notificação',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleNotificationClick = async (notification: Notificacao) => {
    // Marca como lida se ainda não foi
    if (!notification.lida) {
      await handleMarkAsRead(notification.id_notificacao);
    }
    // Navega para o link se existir
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Ícones por tipo
  const getTypeIcon = (tipo: Notificacao['tipo']) => {
    const iconMap = {
      cobranca: <CreditCard className="h-5 w-5 text-yellow-500" />,
      pagamento: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      sessao: <Dumbbell className="h-5 w-5 text-blue-500" />,
      reserva: <MapPin className="h-5 w-5 text-purple-500" />,
      aula: <BookOpen className="h-5 w-5 text-indigo-500" />,
      assinatura: <Star className="h-5 w-5 text-amber-500" />,
      sistema: <Bell className="h-5 w-5 text-gray-500" />,
    };
    return iconMap[tipo];
  };

  // Agrupar notificações por data
  const groupByDate = (notifications: Notificacao[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups: { label: string; items: Notificacao[] }[] = [
      { label: 'Hoje', items: [] },
      { label: 'Ontem', items: [] },
      { label: 'Esta Semana', items: [] },
      { label: 'Mais Antigas', items: [] },
    ];

    notifications.forEach((n) => {
      const nDate = new Date(n.criado_em);
      if (nDate >= today) {
        groups[0].items.push(n);
      } else if (nDate >= yesterday) {
        groups[1].items.push(n);
      } else if (nDate >= thisWeek) {
        groups[2].items.push(n);
      } else {
        groups[3].items.push(n);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  };

  const groupedNotifications = groupByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.lida).length;

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} {unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} disabled={markingAllRead} variant="outline" size="sm">
            {markingAllRead ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Marcando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tabs de Filtro */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="false">Não Lidas</TabsTrigger>
          <TabsTrigger value="true">Lidas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
            <p className="text-sm text-muted-foreground text-center">
              {filter === 'false'
                ? 'Você não tem notificações não lidas'
                : filter === 'true'
                ? 'Você não tem notificações lidas'
                : 'Você ainda não recebeu nenhuma notificação'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notificações Agrupadas */}
      {!loading && groupedNotifications.map((group) => (
        <div key={group.label} className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">{group.label}</h2>
          <div className="space-y-2">
            {group.items.map((notification) => (
              <Card
                key={notification.id_notificacao}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.lida ? 'border-l-4 border-l-fitway-green bg-white/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Ícone do Tipo */}
                    <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.tipo)}</div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{notification.titulo}</h3>
                        {!notification.lida && (
                          <Badge variant="default" className="bg-fitway-green text-white flex-shrink-0">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.mensagem}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatRelativeTime(notification.criado_em)}</span>
                        {notification.lida && notification.data_leitura && (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Lida {formatRelativeTime(notification.data_leitura)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.lida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id_notificacao);
                          }}
                          title="Marcar como lida"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(notification.id_notificacao);
                        }}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Notificação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A notificação será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
