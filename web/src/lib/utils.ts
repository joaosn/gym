import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =====================================================================
// FORMATAÇÃO DE VALORES MONETÁRIOS
// =====================================================================

/**
 * Formata valor numérico para Real Brasileiro (BRL)
 * @param value - Valor numérico a ser formatado
 * @param showSymbol - Se deve mostrar o símbolo R$ (padrão: true)
 * @returns String formatada (ex: "R$ 150,00" ou "150,00")
 * 
 * @example
 * formatCurrency(150) // "R$ 150,00"
 * formatCurrency(150.5) // "R$ 150,50"
 * formatCurrency(1500.99, false) // "1.500,99"
 */
export function formatCurrency(value: number | string, showSymbol: boolean = true): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return showSymbol ? 'R$ 0,00' : '0,00';
  }

  const formatted = numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `R$ ${formatted}` : formatted;
}

/**
 * Converte string de moeda para número
 * @param value - String formatada (ex: "R$ 150,00" ou "150,00")
 * @returns Número decimal
 * 
 * @example
 * parseCurrency("R$ 150,00") // 150
 * parseCurrency("1.500,50") // 1500.5
 */
export function parseCurrency(value: string): number {
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = value.replace(/[^\d,.-]/g, '');
  // Troca vírgula por ponto e converte
  const normalized = cleaned.replace('.', '').replace(',', '.');
  return parseFloat(normalized) || 0;
}

// =====================================================================
// FORMATAÇÃO DE DATA E HORA
// =====================================================================

/**
 * Formata data ISO para formato brasileiro
 * @param date - Data em ISO (ex: "2024-01-15T10:30:00")
 * @param includeTime - Se deve incluir horário (padrão: false)
 * @returns String formatada (ex: "15/01/2024" ou "15/01/2024 às 10:30")
 * 
 * @example
 * formatDate("2024-01-15T10:30:00") // "15/01/2024"
 * formatDate("2024-01-15T10:30:00", true) // "15/01/2024 às 10:30"
 */
export function formatDate(date: string | Date, includeTime: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '-';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  const dateStr = `${day}/${month}/${year}`;

  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} às ${hours}:${minutes}`;
  }

  return dateStr;
}

/**
 * Formata horário ISO para HH:mm
 * @param time - Horário em ISO ou string (ex: "14:30:00" ou "2024-01-15T14:30:00")
 * @returns String formatada (ex: "14:30")
 * 
 * @example
 * formatTime("14:30:00") // "14:30"
 * formatTime("2024-01-15T14:30:00") // "14:30"
 */
export function formatTime(time: string): string {
  if (!time) return '-';
  
  // Se for ISO completo, extrai só o horário
  if (time.includes('T')) {
    const d = new Date(time);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // Se já for formato HH:mm:ss, remove os segundos
  return time.substring(0, 5);
}

/**
 * Retorna data/hora relativa ("há 5 minutos", "ontem", etc)
 * @param date - Data em ISO
 * @returns String relativa
 * 
 * @example
 * formatRelativeTime("2024-01-15T10:00:00") // "há 2 horas"
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  
  return formatDate(d);
}

// =====================================================================
// VALIDAÇÕES
// =====================================================================

/**
 * Valida CPF (com ou sem formatação)
 * @param cpf - CPF string (ex: "123.456.789-00" ou "12345678900")
 * @returns true se válido
 * 
 * @example
 * isValidCPF("123.456.789-09") // true ou false
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/[^\d]/g, '');
  
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Valida email
 * @param email - Email string
 * @returns true se válido
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telefone brasileiro (com ou sem formatação)
 * @param phone - Telefone string (ex: "(11) 98888-7777" ou "11988887777")
 * @returns true se válido
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^\d]/g, '');
  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
  return cleaned.length === 10 || cleaned.length === 11;
}

// =====================================================================
// FORMATAÇÃO DE STRINGS
// =====================================================================

/**
 * Formata CPF
 * @param cpf - CPF string sem formatação
 * @returns CPF formatado (ex: "123.456.789-00")
 * 
 * @example
 * formatCPF("12345678900") // "123.456.789-00"
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/[^\d]/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone brasileiro
 * @param phone - Telefone string sem formatação
 * @returns Telefone formatado (ex: "(11) 98888-7777")
 * 
 * @example
 * formatPhone("11988887777") // "(11) 98888-7777"
 * formatPhone("1133334444") // "(11) 3333-4444"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Trunca texto com reticências
 * @param text - Texto a truncar
 * @param maxLength - Tamanho máximo
 * @returns Texto truncado
 * 
 * @example
 * truncate("Lorem ipsum dolor sit amet", 10) // "Lorem ipsu..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param text - Texto a capitalizar
 * @returns Texto capitalizado
 * 
 * @example
 * capitalize("joão silva") // "João Silva"
 */
export function capitalize(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// =====================================================================
// HELPERS GERAIS
// =====================================================================

/**
 * Gera slug a partir de texto
 * @param text - Texto a converter
 * @returns Slug (ex: "quadra-beach-tennis-1")
 * 
 * @example
 * slugify("Quadra Beach Tennis 1") // "quadra-beach-tennis-1"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}

/**
 * Debounce para inputs (evita chamadas excessivas)
 * @param func - Função a executar
 * @param delay - Delay em ms
 * @returns Função com debounce
 * 
 * @example
 * const search = debounce((term) => fetchResults(term), 500);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Copia texto para clipboard
 * @param text - Texto a copiar
 * @returns Promise<boolean>
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erro ao copiar:', err);
    return false;
  }
}

/**
 * Baixa arquivo
 * @param data - Dados (Blob ou string)
 * @param filename - Nome do arquivo
 * @param type - MIME type
 */
export function downloadFile(data: Blob | string, filename: string, type: string = 'text/plain'): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =====================================================================
// FORMATAÇÃO DE ERROS DE VALIDAÇÃO
// =====================================================================

/**
 * Formata erros de validação do backend para exibição amigável
 * Mapeia nomes de campos técnicos para labels em português
 * 
 * @param error - Objeto de erro (ApiError ou any)
 * @returns String formatada com bullets (• Campo: Mensagem)
 * 
 * @example
 * formatValidationErrors(error)
 * // "• Data/Hora de início: A reserva deve ser futura
 * //  • Quadra: Campo obrigatório"
 */
export function formatValidationErrors(error: any): string {
  // Se não tem errors, retorna mensagem padrão
  if (!error.errors || typeof error.errors !== 'object') {
    return error.message || 'Erro ao processar requisição';
  }

  // Mapeamento de campos técnicos → labels amigáveis
  const fieldLabels: Record<string, string> = {
    // Campos gerais
    id: 'ID',
    nome: 'Nome',
    email: 'E-mail',
    telefone: 'Telefone',
    documento: 'CPF',
    data_nascimento: 'Data de nascimento',
    senha: 'Senha',
    senha_atual: 'Senha atual',
    nova_senha: 'Nova senha',
    confirmar_senha: 'Confirmar senha',
    
    // Quadras
    id_quadra: 'Quadra',
    localizacao: 'Localização',
    esporte: 'Esporte',
    preco_hora: 'Preço por hora',
    caracteristicas: 'Características',
    
    // Usuários
    id_usuario: 'Usuário',
    papel: 'Papel',
    status: 'Status',
    
    // Planos
    id_plano: 'Plano',
    preco: 'Preço',
    ciclo_cobranca: 'Ciclo de cobrança',
    max_reservas_futuras: 'Máximo de reservas futuras',
    beneficios: 'Benefícios',
    
    // Instrutores
    id_instrutor: 'Instrutor',
    cref: 'CREF',
    valor_hora: 'Valor por hora',
    especialidades: 'Especialidades',
    
    // Reservas de Quadra
    id_reserva_quadra: 'Reserva',
    inicio: 'Data/Hora de início',
    fim: 'Data/Hora de término',
    preco_total: 'Preço total',
    observacoes: 'Observações',
    
    // Sessões Personal
    id_sessao_personal: 'Sessão Personal',
    id_aluno: 'Aluno',
    observacoes_instrutor: 'Observações do instrutor',
    
    // Disponibilidade
    id_disponibilidade: 'Disponibilidade',
    dia_semana: 'Dia da semana',
    hora_inicio: 'Hora de início',
    hora_fim: 'Hora de término',
    
    // Aulas
    id_aula: 'Aula',
    nivel: 'Nível',
    duracao_min: 'Duração (minutos)',
    capacidade_max: 'Capacidade máxima',
    preco_unitario: 'Preço unitário',
    
    // Assinaturas
    id_assinatura: 'Assinatura',
    data_inicio: 'Data de início',
    data_fim: 'Data de término',
    proximo_vencimento: 'Próximo vencimento',
    
    // Pagamentos
    id_pagamento: 'Pagamento',
    valor_total: 'Valor total',
    moeda: 'Moeda',
    provedor: 'Provedor',
    metodo_pagamento: 'Método de pagamento',
  };

  // Formata cada erro como bullet point
  return Object.entries(error.errors)
    .map(([field, messages]) => {
      const label = fieldLabels[field] || field;
      const messageArray = Array.isArray(messages) ? messages : [messages];
      return `• ${label}: ${messageArray[0]}`;
    })
    .join('\n');
}

/**
 * Verifica se o erro é uma instância de ApiError com erros de validação
 * @param error - Objeto de erro
 * @returns true se tem errors object
 */
export function hasValidationErrors(error: any): boolean {
  return error && typeof error === 'object' && 'errors' in error && error.errors !== null;
}

/**
 * Extrai mensagem de erro apropriada de qualquer tipo de erro
 * @param error - Objeto de erro
 * @returns Mensagem formatada
 */
export function getErrorMessage(error: any): string {
  if (hasValidationErrors(error)) {
    return formatValidationErrors(error);
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Erro inesperado. Tente novamente.';
}
