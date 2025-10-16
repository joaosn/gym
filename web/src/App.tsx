import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PublicReservePage from "./pages/PublicReservePage";

// Protected Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentPlans from "./pages/student/Plans";
import StudentCourts from "./pages/student/Courts";
import StudentClasses from "./pages/student/Classes";
import StudentPersonal from "./pages/student/Personal";
import StudentProfile from "./pages/student/Profile";

import InstrutorDashboard from "./pages/personal/Dashboard";
import InstrutorSchedule from "./pages/personal/Schedule";
import InstrutorSlots from "./pages/personal/Slots";
import InstrutorClasses from "./pages/personal/Classes";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminCourts from "./pages/admin/Courts";
import AdminPlans from "./pages/admin/Plans";
import AdminUsers from "./pages/admin/Users";
import AdminInstructors from "./pages/admin/Instructors";
import AdminPersonalSessions from "./pages/admin/PersonalSessions";
import AdminClasses from "./pages/admin/Classes";
import AdminPayments from "./pages/admin/Payments";
import EditPlan from "./pages/admin/EditPlan";
import EditClass from "./pages/admin/EditClass";
import AddPlan from "./pages/admin/AddPlan";
import AddClass from "./pages/admin/AddClass";

import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reserve" element={<PublicReservePage />} />
          
          {/* Student Routes */}
          <Route path="/aluno" element={<ProtectedRoute allowedRoles={['aluno']} />}>
            <Route index element={<Navigate to="/aluno/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="planos" element={<StudentPlans />} />
            <Route path="quadras" element={<StudentCourts />} />
            <Route path="aulas" element={<StudentClasses />} />
            <Route path="personal" element={<StudentPersonal />} />
            <Route path="perfil" element={<StudentProfile />} />
          </Route>
          
          {/* Instrutor Routes */}
          <Route path="/instrutor" element={<ProtectedRoute allowedRoles={['instrutor']} />}>
            <Route index element={<Navigate to="/instrutor/dashboard" replace />} />
            <Route path="dashboard" element={<InstrutorDashboard />} />
            <Route path="agenda" element={<InstrutorSchedule />} />
            <Route path="slots" element={<InstrutorSlots />} />
            <Route path="turmas" element={<InstrutorClasses />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="quadras" element={<AdminCourts />} />
            <Route path="planos" element={<AdminPlans />} />
            <Route path="planos/novo" element={<AddPlan />} />
            <Route path="planos/editar/:id" element={<EditPlan />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="instrutores" element={<AdminInstructors />} />
            <Route path="sessoes-personal" element={<AdminPersonalSessions />} />
            <Route path="aulas" element={<AdminClasses />} />
            <Route path="aulas/novo" element={<AddClass />} />
            <Route path="aulas/editar/:id" element={<EditClass />} />
            <Route path="pagamentos" element={<AdminPayments />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;