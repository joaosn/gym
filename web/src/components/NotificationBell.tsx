import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notificationsService } from '@/services/notifications.service';
import type { Notificacao } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Polling: atualizar a cada 30 segundos
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Erro ao carregar contagem de notificações:', error);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.list({ lida: 'false' });
      setRecentNotifications(response.data.slice(0, 5)); // Apenas as 5 mais recentes
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      loadUnreadCount();
      loadRecentNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleNotificationClick = async (notificacao: Notificacao) => {
    // Marcar como lida
    if (!notificacao.lida) {
      await handleMarkAsRead(notificacao.id_notificacao);
    }

    // Navegar para link (se houver)
    if (notificacao.link) {
      navigate(notificacao.link);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'cobranca':
        return '💳';
      case 'pagamento':
        return '✅';
      case 'sessao':
        return '🏋️';
      case 'reserva':
        return '🎾';
      case 'aula':
        return '📚';
      case 'assinatura':
        return '⭐';
      case 'sistema':
        return '🔔';
      default:
        return '📌';
    }
  };

  return (
    <>
      {/* Backdrop quando dropdown aberto */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90]"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <DropdownMenu open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (open) loadRecentNotifications();
      }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-card border-2 border-fitway-green/30 shadow-2xl shadow-fitway-green/20"
        >
        <DropdownMenuLabel className="text-base font-bold border-b border-border pb-2">
          Notificações
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        )}

        {!loading && recentNotifications.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação não lida
          </div>
        )}

        {!loading && recentNotifications.map((notificacao) => (
          <DropdownMenuItem
            key={notificacao.id_notificacao}
            className="flex flex-col items-start p-3 cursor-pointer"
            onClick={() => handleNotificationClick(notificacao)}
          >
            <div className="flex items-start gap-2 w-full">
              <span className="text-lg">{getTipoIcon(notificacao.tipo)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{notificacao.titulo}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notificacao.mensagem}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(notificacao.criado_em)}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}

        {!loading && recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm text-fitway-green cursor-pointer"
              onClick={() => {
                const base = user?.role === 'admin' ? '/admin' : user?.role === 'instrutor' ? '/instrutor' : '/aluno';
                navigate(`${base}/notificacoes`);
              }}
            >
              Ver todas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}
