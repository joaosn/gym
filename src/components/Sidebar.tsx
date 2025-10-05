import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Users,
  Calendar,
  MapPin,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  User,
  Clock,
  Target,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  userRole: 'admin' | 'personal' | 'aluno';
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  children?: NavItem[];
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const getNavItems = (): NavItem[] => {
    switch (userRole) {
      case 'admin':
        return [
          { title: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { title: 'Planos', href: '/admin/planos', icon: Target },
          { title: 'Quadras', href: '/admin/quadras', icon: MapPin },
          { title: 'Aulas', href: '/admin/aulas', icon: BookOpen },
          { title: 'Personal Trainers', href: '/admin/personais', icon: Users },
          { title: 'Alunos', href: '/admin/alunos', icon: User },
          { title: 'Pagamentos', href: '/admin/pagamentos', icon: CreditCard, badge: '8' },
        ];
      case 'personal':
        return [
          { title: 'Dashboard', href: '/personal/dashboard', icon: Home },
          { title: 'Agenda', href: '/personal/agenda', icon: Calendar },
          { title: 'Horários', href: '/personal/slots', icon: Clock },
          { title: 'Turmas', href: '/personal/turmas', icon: BookOpen },
        ];
      case 'aluno':
        return [
          { title: 'Dashboard', href: '/aluno/dashboard', icon: Home },
          { title: 'Planos', href: '/aluno/planos', icon: Target },
          { title: 'Quadras', href: '/aluno/quadras', icon: MapPin },
          { title: 'Aulas', href: '/aluno/aulas', icon: BookOpen },
          { title: 'Personal', href: '/aluno/personal', icon: User },
          { title: 'Perfil', href: '/aluno/perfil', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    // Implement logout logic
    navigate('/login');
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'admin': return 'Administrador';
      case 'personal': return 'Personal Trainer';
      case 'aluno': return 'Aluno';
      default: return '';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin': return 'bg-red-500';
      case 'personal': return 'bg-blue-500';
      case 'aluno': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn(
      "h-screen bg-dashboard-card border-r border-dashboard-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-dashboard-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-fitway-green rounded-lg flex items-center justify-center">
                <span className="text-fitway-dark font-bold text-sm">F</span>
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">FITWAY</h2>
                <Badge className={cn("text-xs", getRoleColor())}>
                  {getRoleTitle()}
                </Badge>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-dashboard-bg"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isExpanded = expandedItems.includes(item.title);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.title}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-dashboard-bg hover:text-fitway-green transition-colors",
                    isActive && "bg-fitway-green text-fitway-dark hover:bg-fitway-green hover:text-fitway-dark",
                    isCollapsed && "justify-center px-0"
                  )}
                  onClick={() => hasChildren ? toggleExpanded(item.title) : handleNavigation(item.href)}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto border-orange-500 text-orange-500">
                          {item.badge}
                        </Badge>
                      )}
                      {hasChildren && (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>

                {/* Submenu */}
                {hasChildren && isExpanded && !isCollapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children?.map((child) => {
                      const isChildActive = location.pathname === child.href;
                      return (
                        <Button
                          key={child.title}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-white/80 hover:bg-dashboard-bg hover:text-fitway-green",
                            isChildActive && "bg-fitway-green/20 text-fitway-green"
                          )}
                          onClick={() => handleNavigation(child.href)}
                        >
                          <child.icon className="h-3 w-3 mr-2" />
                          {child.title}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-dashboard-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-red-500/20 hover:text-red-400",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sair"}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;