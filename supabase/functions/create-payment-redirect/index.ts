// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const amount = body.amount;
    const description = body.description;
    const userId = body.userId;
    const returnUrl = body.returnUrl;

    console.log("📝 Получен запрос:");
    console.log("  - userId:", userId);
    console.log("  - amount:", amount);
    console.log("  - returnUrl:", returnUrl);

    const YOOKASSA_SHOP_ID = Deno.env.get("YOOKASSA_SHOP_ID");
    const YOOKASSA_SECRET_KEY = Deno.env.get("YOOKASSA_SECRET_KEY");

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      console.error("❌ Нет ключей ЮKassa");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment system not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const auth = btoa(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`);

    const paymentData = {
      amount: { value: amount, currency: "RUB" },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      description:
        description || "Доступ к электронному путеводителю по Костроме",
      metadata: {
        user_id: String(userId), // 👈 ИСПОЛЬЗУЕМ user_id
        userId: String(userId), // 👈 И ДУБЛИРУЕМ ДЛЯ НАДЕЖНОСТИ
      },
    };

    console.log(
      "📦 Отправляем в ЮKassa:",
      JSON.stringify(paymentData, null, 2),
    );

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
        "Idempotence-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(paymentData),
    });

    const payment = await response.json();

    if (!response.ok) {
      console.error("❌ Ошибка ЮKassa:", payment);
      return new Response(
        JSON.stringify({ success: false, error: payment.description }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ Платеж создан!");
    console.log("  - paymentId:", payment.id);
    console.log("  - metadata:", JSON.stringify(payment.metadata));
    console.log("  - confirmationUrl:", payment.confirmation.confirmation_url);

    return new Response(
      JSON.stringify({
        success: true,
        confirmationUrl: payment.confirmation.confirmation_url,
        paymentId: payment.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
