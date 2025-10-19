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
import StudentMyPlan from "./pages/student/MyPlan";
import StudentCourts from "./pages/student/Courts";
import StudentCourtBookings from "./pages/student/CourtBookings";
import StudentClasses from "./pages/student/Classes";
import StudentPersonal from "./pages/student/Personal";
import StudentProfile from "./pages/student/Profile";

import InstrutorDashboard from "./pages/personal/Dashboard";
import InstrutorSchedule from "./pages/personal/Schedule";
import InstrutorSlots from "./pages/personal/Slots";
import InstrutorClasses from "./pages/personal/Classes";
import InstrutorCourtBookings from "./pages/personal/CourtBookings";

// Admin Pages - Organized by context
import AdminDashboard from "./pages/admin/dashboard/Dashboard";
import AdminCourts from "./pages/admin/cadastros/courts/Courts";
import AdminPlans from "./pages/admin/cadastros/plans/Plans";
import AddPlan from "./pages/admin/cadastros/plans/AddPlan";
import EditPlan from "./pages/admin/cadastros/plans/EditPlan";
import AdminUsers from "./pages/admin/cadastros/users/Users";
import AdminInstructors from "./pages/admin/cadastros/instructors/Instructors";
import AdminPersonalSessions from "./pages/admin/agendamentos/personal-sessions/PersonalSessions";
import AdminCourtBookings from "./pages/admin/agendamentos/court-bookings";
import AdminClasses from "./pages/admin/agendamentos/classes/Classes";
import AddClass from "./pages/admin/agendamentos/classes/AddClass";
import EditClass from "./pages/admin/agendamentos/classes/EditClass";
import ClassSchedules from "./pages/admin/agendamentos/classes/ClassSchedules";
import GenerateOccurrences from "./pages/admin/agendamentos/classes/GenerateOccurrences";
import OccurrenceEnrollments from "./pages/admin/agendamentos/classes/OccurrenceEnrollments";
import ClassOccurrencesList from "./pages/admin/agendamentos/classes/ClassOccurrencesList";
import BulkEnrollment from "./pages/admin/agendamentos/classes/BulkEnrollment";
import AdminPayments from "./pages/admin/payments/Payments";
import AdminSubscriptions from "./pages/admin/payments/Subscriptions";

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
            <Route path="planos" element={<StudentMyPlan />} />
            <Route path="quadras" element={<StudentCourts />} />
            <Route path="reservas" element={<StudentCourtBookings />} />
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
            <Route path="reservas" element={<InstrutorCourtBookings />} />
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
            <Route path="reservas-quadra" element={<AdminCourtBookings />} />
            <Route path="aulas" element={<AdminClasses />} />
            <Route path="aulas/novo" element={<AddClass />} />
            <Route path="aulas/editar/:id" element={<EditClass />} />
            <Route path="aulas/:id/horarios" element={<ClassSchedules />} />
            <Route path="aulas/:id/gerar-ocorrencias" element={<GenerateOccurrences />} />
            <Route path="aulas/:classId/ocorrencias" element={<ClassOccurrencesList />} />
            <Route path="aulas/:classId/inscricao-lote" element={<BulkEnrollment />} />
            <Route path="aulas/ocorrencias/:occurrenceId/inscricoes" element={<OccurrenceEnrollments />} />
            <Route path="pagamentos" element={<AdminPayments />} />
            <Route path="assinaturas" element={<AdminSubscriptions />} />
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