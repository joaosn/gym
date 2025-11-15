import { useState, useEffect } from "react";
import { Plus, Search, Filter, Clock, Mail, Phone, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { instructorsService } from "@/services/instructors.service";
import type { Instructor, InstructorFormData, Availability } from "@/types";
import { formatCurrency, formatPhone, formatDate, debounce, getErrorMessage, maskCurrency, parseCurrency, maskPhone, maskCREF, sanitizeNameInput, stripNonDigits } from "@/lib/utils";

const ESPECIALIDADES_OPTIONS = [
  "Musculação",
  "Hipertrofia",
  "Emagrecimento",
  "Yoga",
  "Pilates",
  "Alongamento",
  "CrossFit",
  "Funcional",
  "HIIT",
  "Natação",
  "Hidroginástica",
  "Beach Tennis",
  "Spinning",
  "Zumba",
];

const DIAS_SEMANA = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export default function Instructors() {
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    especialidade: "all",
    status: "all",
    search: "",
  });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  // Form data
  const [formData, setFormData] = useState<InstructorFormData>({
    nome: "",
    email: "",
    telefone: "",
    cref: "",
    valor_hora: 0,
    especialidades: [],
    bio: "",
    status: "ativo",
    criar_usuario: false,
  });
  const [valorHoraInput, setValorHoraInput] = useState("");

  const handleNomeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, nome: sanitizeNameInput(value) }));
  };

  const handleTelefoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, telefone: maskPhone(value) }));
  };

  const handleCrefChange = (value: string) => {
    setFormData((prev) => ({ ...prev, cref: maskCREF(value) }));
  };

  const handleValorHoraChange = (value: string) => {
    const masked = maskCurrency(value);
    setValorHoraInput(masked);
    setFormData((prev) => ({ ...prev, valor_hora: parseCurrency(masked) }));
  };

  const buildInstructorPayload = (): InstructorFormData => ({
    ...formData,
    nome: sanitizeNameInput(formData.nome).trim(),
    telefone: stripNonDigits(formData.telefone),
    cref: formData.cref.toUpperCase(),
    valor_hora: formData.valor_hora,
  });

  // Disponibilidade editor
  const [availabilityData, setAvailabilityData] = useState<Omit<Availability, 'id_disponibilidade' | 'dia_semana_texto'>[]>([]);

  // Load instructors
  const loadInstructors = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.especialidade && filters.especialidade !== "all") {
        params.especialidade = filters.especialidade;
      }
      if (filters.status && filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      
      const response = await instructorsService.listInstructors(params);
      setInstructors(response.data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar instrutores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstructors();
  }, [filters]);

  // Debounced search
  const handleSearchChange = debounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, 500);

  // Handle create
  const handleCreate = async () => {
    if (!formData.nome || !formData.email || !formData.cref || formData.valor_hora <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email, CREF e valor/hora",
        variant: "destructive",
      });
      return;
    }

    if (formData.criar_usuario && !formData.senha) {
      toast({
        title: "Senha obrigatória",
        description: "Informe uma senha para criar o usuário",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildInstructorPayload();
      await instructorsService.createInstructor(payload);
      toast({ title: "Instrutor criado com sucesso!" });
      setIsCreateOpen(false);
      resetForm();
      loadInstructors();
    } catch (error: any) {
      toast({
        title: "Erro ao criar instrutor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!selectedInstructor) return;

    setSubmitting(true);
    try {
      const payload = buildInstructorPayload();
      await instructorsService.updateInstructor(selectedInstructor.id_instrutor, payload);
      toast({ title: "Instrutor atualizado com sucesso!" });
      setIsEditOpen(false);
      resetForm();
      loadInstructors();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar instrutor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedInstructor) return;

    setSubmitting(true);
    try {
      await instructorsService.deleteInstructor(selectedInstructor.id_instrutor);
      toast({ title: "Instrutor excluído com sucesso!" });
      setIsDeleteOpen(false);
      setSelectedInstructor(null);
      loadInstructors();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir instrutor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (instructor: Instructor) => {
    try {
      await instructorsService.toggleStatus(instructor.id_instrutor);
      toast({ title: "Status atualizado com sucesso!" });
      loadInstructors();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle update availability
  const handleUpdateAvailability = async () => {
    if (!selectedInstructor) return;

    setSubmitting(true);
    try {
      await instructorsService.updateAvailability(selectedInstructor.id_instrutor, availabilityData);
      toast({ title: "Disponibilidade atualizada!" });
      setIsAvailabilityOpen(false);
      loadInstructors();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar disponibilidade",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setFormData({
      nome: instructor.nome,
      email: instructor.email,
      telefone: instructor.telefone ? maskPhone(instructor.telefone) : "",
      cref: instructor.cref || "",
      valor_hora: instructor.valor_hora,
      especialidades: instructor.especialidades,
      bio: instructor.bio,
      status: instructor.status,
    });
    setValorHoraInput(formatCurrency(instructor.valor_hora));
    setIsEditOpen(true);
  };

  // Open availability modal
  const openAvailabilityModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setAvailabilityData(
      instructor.disponibilidades.map((d) => ({
        dia_semana: d.dia_semana,
        hora_inicio: d.hora_inicio,
        hora_fim: d.hora_fim,
        disponivel: d.disponivel,
      }))
    );
    setIsAvailabilityOpen(true);
  };

  // Add availability slot
  const addAvailabilitySlot = () => {
    setAvailabilityData((prev) => [
      ...prev,
      { dia_semana: 1, hora_inicio: "08:00", hora_fim: "12:00", disponivel: true },
    ]);
  };

  // Remove availability slot
  const removeAvailabilitySlot = (index: number) => {
    setAvailabilityData((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cref: "",
      valor_hora: 0,
      especialidades: [],
      bio: "",
      status: "ativo",
      criar_usuario: false,
    });
    setSelectedInstructor(null);
    setValorHoraInput("");
  };

  // Toggle especialidade
  const toggleEspecialidade = (esp: string) => {
    setFormData((prev) => {
      const especialidades = prev.especialidades.includes(esp)
        ? prev.especialidades.filter((e) => e !== esp)
        : [...prev.especialidades, esp];
      return { ...prev, especialidades };
    });
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Personal Trainers</h1>
          <p className="text-gray-400 max-w-3xl">
            Gerencie instrutores e disponibilidades. 
            <span className="block mt-1 text-sm text-gray-500">
              💡 Instrutores com conta podem acessar o sistema, os demais são apenas listados para agendamentos.
            </span>
          </p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsCreateOpen(true); }} 
          size="lg" 
          className="shrink-0 bg-fitway-green hover:bg-fitway-green/90 text-fitway-dark font-semibold"
        >
          <Plus className="mr-2 h-5 w-5" />
          Novo Instrutor
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-10 h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-fitway-green focus:ring-fitway-green/20"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <Select value={filters.especialidade} onValueChange={(value) => setFilters((prev) => ({ ...prev, especialidade: value }))}>
          <SelectTrigger className="w-full sm:w-[220px] h-11 bg-gray-800 border-gray-700 text-white">
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            <SelectValue placeholder="Todas Especialidades" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">Todas Especialidades</SelectItem>
            {ESPECIALIDADES_OPTIONS.map((esp) => (
              <SelectItem key={esp} value={esp}>{esp}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-full sm:w-[160px] h-11 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Todos Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitway-green mx-auto"></div>
            <p className="text-gray-400">Carregando instrutores...</p>
          </div>
        </div>
      ) : instructors.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg bg-gray-900/50">
          <p className="text-gray-300 text-lg">Nenhum instrutor encontrado</p>
          <p className="text-sm text-gray-500 mt-2">Clique em "Novo Instrutor" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <div 
              key={instructor.id_instrutor} 
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-fitway-green/20 hover:border-fitway-green/50 hover:scale-[1.02] transition-all duration-200"
            >
              {/* Header com gradiente */}
              <div className="bg-gradient-to-br from-fitway-green/20 via-fitway-green/5 to-gray-800 p-6 border-b border-gray-700 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-xl truncate text-white">{instructor.nome}</h3>
                      {instructor.id_usuario && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-blue-900/60 text-blue-300 border-blue-700/50 shrink-0 hover:bg-blue-900/80 transition-colors"
                        >
                          🔐 Login
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 shrink-0 text-fitway-green" />
                      <span className="truncate">{instructor.cref}</span>
                    </p>
                  </div>
                  <Badge 
                    variant={instructor.status === "ativo" ? "default" : "secondary"}
                    className={`shrink-0 font-semibold ${
                      instructor.status === "ativo" 
                        ? "bg-green-600/80 hover:bg-green-600 text-white border-green-700/50" 
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                    } transition-colors`}
                  >
                    {instructor.status}
                  </Badge>
                </div>
                
                {/* Valor em destaque */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg space-y-1">
                  <p className="text-xs font-medium text-gray-400">Valor da Sessão</p>
                  <p className="text-2xl font-bold text-fitway-green drop-shadow-lg">{formatCurrency(instructor.valor_hora)}</p>
                  <p className="text-xs text-gray-500">por hora</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Contato */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm group">
                    <Mail className="h-4 w-4 text-gray-500 group-hover:text-fitway-green flex-shrink-0 transition-colors" />
                    <span className="truncate text-gray-300">{instructor.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm group">
                    <Phone className="h-4 w-4 text-gray-500 group-hover:text-fitway-green flex-shrink-0 transition-colors" />
                    <span className="text-gray-300">{formatPhone(instructor.telefone)}</span>
                  </div>
                </div>

                {/* Especialidades */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Especialidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {instructor.especialidades.length > 0 ? (
                      instructor.especialidades.map((esp) => (
                        <Badge 
                          key={esp} 
                          variant="outline" 
                          className="text-xs font-medium bg-fitway-green/15 hover:bg-fitway-green/25 border-fitway-green/40 text-fitway-green hover:text-fitway-green transition-all"
                        >
                          {esp}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">Nenhuma especialidade cadastrada</span>
                    )}
                  </div>
                </div>

                {/* Disponibilidades */}
                <div className="flex items-center gap-2.5 bg-gray-900/60 rounded-lg p-3.5 border border-gray-700/50 hover:border-fitway-green/30 transition-colors">
                  <Clock className="h-4 w-4 text-fitway-green shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-white">{instructor.disponibilidades.length}</span>
                    <span className="text-sm text-gray-400 ml-1">{instructor.disponibilidades.length === 1 ? "horário configurado" : "horários configurados"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openAvailabilityModal(instructor)}
                    className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-fitway-green/20 hover:border-fitway-green hover:text-fitway-green transition-all font-medium"
                  >
                    <Clock className="mr-1.5 h-4 w-4" />
                    Horários
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleStatus(instructor)}
                    className={`font-medium transition-all ${
                      instructor.status === "ativo" 
                        ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-orange-600/20 hover:border-orange-600/50 hover:text-orange-400" 
                        : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-green-600/20 hover:border-green-600/50 hover:text-green-400"
                    }`}
                  >
                    {instructor.status === "ativo" ? "Desativar" : "Ativar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditModal(instructor)}
                    className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-blue-600/20 hover:border-blue-600/50 hover:text-blue-400 transition-all font-medium"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-red-600/20 hover:border-red-600/50 hover:text-red-400 transition-all font-medium"
                    onClick={() => {
                      setSelectedInstructor(instructor);
                      setIsDeleteOpen(true);
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Novo Instrutor</DialogTitle>
            <DialogDescription className="text-gray-400">Cadastre um novo personal trainer ou instrutor</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nome *</Label>
                <Input 
                  value={formData.nome} 
                  onChange={(e) => handleNomeChange(e.target.value)} 
                  maxLength={80}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Email *</Label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Telefone</Label>
                <Input 
                  value={formData.telefone} 
                  onChange={(e) => handleTelefoneChange(e.target.value)} 
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">CREF *</Label>
                <Input 
                  placeholder="123456-G/SP" 
                  value={formData.cref} 
                  onChange={(e) => handleCrefChange(e.target.value)} 
                  maxLength={12}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Valor/Hora (R$) *</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={valorHoraInput}
                onChange={(e) => handleValorHoraChange(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Especialidades</Label>
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                {ESPECIALIDADES_OPTIONS.map((esp) => (
                  <div key={esp} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.especialidades.includes(esp)}
                      onCheckedChange={() => toggleEspecialidade(esp)}
                      className="border-gray-600"
                    />
                    <span className="text-sm text-gray-300">{esp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Bio</Label>
              <Textarea 
                placeholder="Descreva a experiência e qualificações do instrutor..."
                value={formData.bio} 
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                rows={3}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
              />
            </div>

            {/* Criar Usuário - Destaque */}
            <div className="border border-gray-700 rounded-lg p-4 bg-fitway-green/10 space-y-3">
              <div className="flex items-start gap-3">
                <Switch
                  id="criar-usuario"
                  checked={formData.criar_usuario}
                  onCheckedChange={(checked) => setFormData({ ...formData, criar_usuario: checked })}
                />
                <div className="flex-1">
                  <Label htmlFor="criar-usuario" className="text-base font-semibold cursor-pointer text-white">
                    Criar conta de acesso ao sistema
                  </Label>
                  <p className="text-sm text-gray-400 mt-1">
                    Marque esta opção se o instrutor precisar fazer login no sistema. 
                    Caso contrário, ele será apenas listado para agendamentos.
                  </p>
                </div>
              </div>

              {formData.criar_usuario && (
                <div className="space-y-2 pl-11 pt-2 border-t border-gray-700">
                  <Label className="text-gray-300">Senha de Acesso *</Label>
                  <Input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres"
                    value={formData.senha || ""} 
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })} 
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                  />
                  <p className="text-xs text-gray-500">
                    O instrutor poderá fazer login com o email cadastrado acima.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { setIsCreateOpen(false); resetForm(); }}
              className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={submitting}
              className="bg-fitway-green hover:bg-fitway-green/90 text-fitway-dark font-semibold"
            >
              {submitting ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Instrutor</DialogTitle>
            <DialogDescription className="text-gray-400">Atualize os dados do instrutor</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nome</Label>
                <Input 
                  value={formData.nome} 
                  onChange={(e) => handleNomeChange(e.target.value)} 
                  maxLength={80}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Telefone</Label>
                <Input 
                  value={formData.telefone} 
                  onChange={(e) => handleTelefoneChange(e.target.value)} 
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">CREF</Label>
                <Input 
                  value={formData.cref} 
                  onChange={(e) => handleCrefChange(e.target.value)} 
                  maxLength={12}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Valor/Hora (R$)</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={valorHoraInput}
                onChange={(e) => handleValorHoraChange(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Especialidades</Label>
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                {ESPECIALIDADES_OPTIONS.map((esp) => (
                  <div key={esp} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.especialidades.includes(esp)}
                      onCheckedChange={() => toggleEspecialidade(esp)}
                      className="border-gray-600"
                    />
                    <span className="text-sm text-gray-300">{esp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Bio</Label>
              <Textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                rows={3}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-fitway-green focus:ring-fitway-green/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { setIsEditOpen(false); resetForm(); }}
              className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEdit} 
              disabled={submitting}
              className="bg-fitway-green hover:bg-fitway-green/90 text-fitway-dark font-semibold"
            >
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AVAILABILITY MODAL */}
      <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Disponibilidade - {selectedInstructor?.nome}</DialogTitle>
            <DialogDescription>Gerencie os horários disponíveis para agendamento</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {availabilityData.map((slot, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <Select
                  value={slot.dia_semana.toString()}
                  onValueChange={(value) => {
                    const newData = [...availabilityData];
                    newData[index].dia_semana = parseInt(value);
                    setAvailabilityData(newData);
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS_SEMANA.map((dia) => (
                      <SelectItem key={dia.value} value={dia.value.toString()}>{dia.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="time"
                  value={slot.hora_inicio}
                  onChange={(e) => {
                    const newData = [...availabilityData];
                    newData[index].hora_inicio = e.target.value;
                    setAvailabilityData(newData);
                  }}
                />

                <span>até</span>

                <Input
                  type="time"
                  value={slot.hora_fim}
                  onChange={(e) => {
                    const newData = [...availabilityData];
                    newData[index].hora_fim = e.target.value;
                    setAvailabilityData(newData);
                  }}
                />

                <Button variant="outline" size="sm" onClick={() => removeAvailabilitySlot(index)}>
                  Remover
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={addAvailabilitySlot} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Horário
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvailabilityOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateAvailability} disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o instrutor <strong>{selectedInstructor?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting}>
              {submitting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
