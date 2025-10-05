import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Determine user role based on current path
  const getUserRole = (): 'admin' | 'personal' | 'aluno' => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/personal')) return 'personal';
    if (location.pathname.startsWith('/aluno')) return 'aluno';
    return 'aluno'; // default
  };

  // Don't show sidebar on public pages
  const isPublicPage = ['/', '/home', '/login', '/register', '/reserve'].includes(location.pathname);
  
  if (isPublicPage) {
    return <>{children}</>;
  }

  const userRole = getUserRole();

  return (
    <div className="flex h-screen bg-dashboard-bg">
      <Sidebar userRole={userRole} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;