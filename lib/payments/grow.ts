const GROW_BASE_URL =
  process.env.GROW_SANDBOX === "true"
    ? "https://sandbox.meshulam.co.il"
    : "https://secure.meshulam.co.il";

export function buildPaymentUrl(pageCode: string): string {
  return `${GROW_BASE_URL}/payment?b=${pageCode}`;
}

export async function createPaymentProcess(params: {
  sum: number;
  description?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  successUrl: string;
  errorUrl: string;
  cancelUrl?: string;
}): Promise<{ paymentUrl: string; pageCode: string }> {
  const userId = process.env.GROW_USER_ID;
  const pageCode = process.env.GROW_PAGE_CODE;
  const apiKey = process.env.GROW_API_KEY;

  if (!userId || !pageCode || !apiKey) {
    throw new Error("Missing Grow credentials (GROW_USER_ID, GROW_PAGE_CODE, GROW_API_KEY)");
  }

  const form = new FormData();
  form.append("userId", userId);
  form.append("pageCode", pageCode);
  form.append("apiKey", apiKey);
  form.append("sum", params.sum.toString());
  form.append("currency", "1"); // 1 = ILS (NIS)
  form.append("numPayments", "1");
  form.append("paymentType", "1"); // 1 = save card token for recurring
  form.append("successUrl", params.successUrl);
  form.append("errorUrl", params.errorUrl);
  if (params.cancelUrl) form.append("cancelUrl", params.cancelUrl);
  if (params.description) form.append("description", params.description);
  if (params.fullName) form.append("fullName", params.fullName);
  if (params.email) form.append("email", params.email);
  if (params.phone) form.append("phone", params.phone);

  const res = await fetch(`${GROW_BASE_URL}/createPaymentProcess`, {
    method: "POST",
    body: form,
  });

  const json = (await res.json()) as {
    status: number;
    data?: { pageCode?: string };
    err?: string;
  };

  if (json.status !== 1 || !json.data?.pageCode) {
    throw new Error(`Grow createPaymentProcess failed: ${json.err ?? JSON.stringify(json)}`);
  }

  return {
    pageCode: json.data.pageCode,
    paymentUrl: buildPaymentUrl(json.data.pageCode),
  };
}

export async function approveTransaction(transactionCode: string): Promise<void> {
  const userId = process.env.GROW_USER_ID;
  const apiKey = process.env.GROW_API_KEY;

  if (!userId || !apiKey) return;

  const form = new FormData();
  form.append("userId", userId);
  form.append("apiKey", apiKey);
  form.append("transactionCode", transactionCode);

  await fetch(`${GROW_BASE_URL}/approveTransaction`, {
    method: "POST",
    body: form,
  });
}
