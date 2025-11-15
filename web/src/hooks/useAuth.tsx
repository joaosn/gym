import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

export function useAuth() {
  // Carregar do localStorage IMEDIATAMENTE (síncrono)
  const [user, setUser] = useState<User | null>(() => authService.getUserFromStorage());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Validar com API (pode atualizar dados)
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Ouvir evento de login para atualizar imediatamente
    const handleLoginEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      setUser(customEvent.detail);
    };

    window.addEventListener('auth:login', handleLoginEvent);
    loadUser();

    return () => {
      window.removeEventListener('auth:login', handleLoginEvent);
    };
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  return { user, loading, logout };
}
