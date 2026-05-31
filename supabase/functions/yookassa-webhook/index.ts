// supabase/functions/yookassa-webhook/index.ts

// @ts-nocheck
console.log("🚀 Вебхук функция запущена");

Deno.serve(async (req) => {
  console.log("📨 Получен запрос, метод:", req.method);

  try {
    if (req.method !== "POST") {
      console.log("⚠️ Не POST запрос, игнорируем");
      return new Response("OK", { status: 200 });
    }

    const payload = await req.json();
    console.log("📦 Весь payload:", JSON.stringify(payload, null, 2));

    const eventType = payload.event || payload.type;
    const payment = payload.object || payload;
    const paymentId = payment.id;
    const paymentStatus = payment.status;

    let userId = payment.metadata?.userId || payment.metadata?.user_id;

    console.log("🔍 Событие:", eventType);
    console.log("🔍 ID платежа:", paymentId);
    console.log("🔍 Статус:", paymentStatus);
    console.log("🔍 userId:", userId);

    if (eventType === "payment.succeeded" || paymentStatus === "succeeded") {
      console.log("✅ Успешный платеж!");

      if (!userId) {
        console.error("❌ НЕТ USER_ID!");
        return new Response("OK", { status: 200 });
      }

      const now = new Date().toISOString();

      const { createClient } =
        await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL"),
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      );

      // Обновляем пользователя в таблице user_profiles
      console.log("📝 Обновляем пользователя:", userId);
      const { error: userError } = await supabase.from("user_profiles").upsert({
        id: userId,
        has_paid_access: true,
        payment_id: paymentId,
        paid_at: now,
        subscription_status: "active",
        subscription_created_at: now,
        updated_at: now,
      });

      if (userError) {
        console.error("❌ Ошибка user_profiles:", userError);
      } else {
        console.log("✅ Пользователь обновлён!");
      }

      // Сохраняем платёж
      console.log("📝 Сохраняем платёж...");
      const { error: paymentError } = await supabase.from("payments").upsert({
        id: paymentId,
        user_id: userId,
        amount: parseFloat(payment.amount?.value || 0),
        status: "succeeded",
        paid_at: now,
      });

      if (paymentError) {
        console.error("❌ Ошибка payments:", paymentError);
      } else {
        console.log("✅ Платёж сохранён!");
      }

      console.log("🎉 Вебхук обработан!");
    } else {
      console.log(`ℹ️ Событие ${eventType} не требует обработки`);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    return new Response("OK", { status: 200 });
  }
});
