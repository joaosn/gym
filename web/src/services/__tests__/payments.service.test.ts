import { describe, expect, it, beforeEach, vi } from "vitest";

const getMock = vi.fn();
const postMock = vi.fn();
const putMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("../../lib/api-client", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    put: putMock,
    delete: deleteMock,
  },
}));

import { paymentsService } from "../payments.service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("payments.service", () => {
  it("builds query params for admin listAll", async () => {
    const response = {
      data: [],
      total: 0,
      current_page: 1,
      last_page: 1,
    };
    getMock.mockResolvedValue(response);

    const filters = {
      status: "pago",
      tipo: "assinatura",
      search: "ana",
      page: 2,
      per_page: 10,
    } as const;

    const result = await paymentsService.listAll(filters);

    expect(getMock).toHaveBeenCalledWith(
      "/admin/payments?status=pago&tipo=assinatura&search=ana&page=2&per_page=10"
    );
    expect(result).toBe(response);
  });

  it("omits empty referencia_id when creating charge", async () => {
    postMock.mockResolvedValue({ data: { id_cobranca: 1 } });

    await paymentsService.createCharge({
      id_usuario: "10",
      referencia_tipo: "manual",
      referencia_id: "",
      valor_total: 150,
      descricao: "Mensalidade",
      vencimento: "2025-10-21",
    });

    expect(postMock).toHaveBeenCalledWith("/admin/payments", {
      id_usuario: "10",
      referencia_tipo: "manual",
      valor_total: 150,
      descricao: "Mensalidade",
      vencimento: "2025-10-21",
    });
  });

  it("reuses simulation payload for checkout if not provided", async () => {
    postMock.mockResolvedValue({
      data: { id_pagamento: 20, provedor: "simulacao" },
    });

    const result = await paymentsService.createCheckout("55");

    expect(postMock).toHaveBeenCalledWith("/payments/checkout/55", {
      provedor: "simulacao",
    });
    expect(result).toEqual({ id_pagamento: 20, provedor: "simulacao" });
  });
});
