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

import PersonalDashboard from "./pages/personal/Dashboard";
import PersonalSchedule from "./pages/personal/Schedule";
import PersonalSlots from "./pages/personal/Slots";
import PersonalClasses from "./pages/personal/Classes";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminPlans from "./pages/admin/Plans";
import AdminCourts from "./pages/admin/Courts";
import AdminClasses from "./pages/admin/Classes";
import AdminPersonals from "./pages/admin/Personals";
import AdminPayments from "./pages/admin/Payments";
import AdminStudents from "./pages/admin/Students";
import EditPlan from "./pages/admin/EditPlan";
import EditCourt from "./pages/admin/EditCourt";
import EditClass from "./pages/admin/EditClass";
import EditPersonal from "./pages/admin/EditPersonal";
import EditStudent from "./pages/admin/EditStudent";
import AddPlan from "./pages/admin/AddPlan";
import AddCourt from "./pages/admin/AddCourt";
import AddClass from "./pages/admin/AddClass";
import AddPersonal from "./pages/admin/AddPersonal";
import AddStudent from "./pages/admin/AddStudent";

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
          
          {/* Personal Routes */}
          <Route path="/personal" element={<ProtectedRoute allowedRoles={['personal']} />}>
            <Route index element={<Navigate to="/personal/dashboard" replace />} />
            <Route path="dashboard" element={<PersonalDashboard />} />
            <Route path="agenda" element={<PersonalSchedule />} />
            <Route path="slots" element={<PersonalSlots />} />
            <Route path="turmas" element={<PersonalClasses />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="planos" element={<AdminPlans />} />
            <Route path="planos/novo" element={<AddPlan />} />
            <Route path="planos/editar/:id" element={<EditPlan />} />
            <Route path="quadras" element={<AdminCourts />} />
            <Route path="quadras/novo" element={<AddCourt />} />
            <Route path="quadras/editar/:id" element={<EditCourt />} />
            <Route path="aulas" element={<AdminClasses />} />
            <Route path="aulas/novo" element={<AddClass />} />
            <Route path="aulas/editar/:id" element={<EditClass />} />
            <Route path="personais" element={<AdminPersonals />} />
            <Route path="personais/novo" element={<AddPersonal />} />
            <Route path="personais/editar/:id" element={<EditPersonal />} />
            <Route path="alunos" element={<AdminStudents />} />
            <Route path="alunos/novo" element={<AddStudent />} />
            <Route path="alunos/editar/:id" element={<EditStudent />} />
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