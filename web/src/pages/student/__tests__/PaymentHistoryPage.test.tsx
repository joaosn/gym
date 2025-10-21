import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, userEvent } from "@/test-utils/testing-library";
import PaymentHistoryPage from "../PaymentHistory";

const getMyHistoryMock = vi.fn();
const createManualChargeMock = vi.fn();
const createCheckoutMercadoPagoMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id_usuario: 1, role: "aluno", nome: "Aluno Teste" },
    loading: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/services/payments.service", () => ({
  paymentsService: {
    getMyHistory: getMyHistoryMock,
    createManualCharge: createManualChargeMock,
    createCheckoutMercadoPago: createCheckoutMercadoPagoMock,
    getMyPendingCharges: vi.fn(),
    getParcela: vi.fn(),
    createCheckout: vi.fn(),
    approveSimulation: vi.fn(),
    adminCreateCheckoutLink: vi.fn(),
    listAll: vi.fn(),
    getCharge: vi.fn(),
    createCharge: vi.fn(),
    updateCharge: vi.fn(),
    deleteCharge: vi.fn(),
  },
}));

const buildHistoryResponse = () => ({
  data: [
    {
      id_cobranca: 10,
      descricao: "Mensalidade Premium",
      status: "pendente",
      valor_total: 120,
      valor_pago: 0,
      referencia_tipo: "assinatura",
      vencimento: "2025-10-21",
      parcelas: [
        {
          id_parcela: 501,
          status: "pendente",
          valor: 120,
          valor_pago: 0,
          numero_parcela: 1,
          total_parcelas: 1,
        },
      ],
    },
  ],
  total: 1,
  current_page: 1,
  last_page: 1,
});

describe("PaymentHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads user history on mount", async () => {
    getMyHistoryMock.mockResolvedValue(buildHistoryResponse());

    render(
      <MemoryRouter>
        <PaymentHistoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mensalidade Premium")).toBeInTheDocument();
    });

    expect(screen.getByText("Pendente")).toBeInTheDocument();
    expect(getMyHistoryMock).toHaveBeenCalledWith({
      status: "all",
      page: 1,
      per_page: 20,
    });
  });

  it("requests Mercado Pago link for pending parcel", async () => {
    getMyHistoryMock.mockResolvedValue(buildHistoryResponse());
    createCheckoutMercadoPagoMock.mockResolvedValue({
      url_checkout: "https://mp.test/checkout",
      pagamento: { id_pagamento: 999 },
    });

    render(
      <MemoryRouter>
        <PaymentHistoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mensalidade Premium")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Link MP"));

    expect(createCheckoutMercadoPagoMock).toHaveBeenCalledWith("501");
  });
});
