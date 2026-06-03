<?php
// api/payments/webhook.php

require_once __DIR__ . '/../config/database.php';

$db = getDB();

$rawInput = file_get_contents("php://input");
$payload = json_decode($rawInput, true);

// YooKassa подтверждает вебхук пустым запросом
if (!$payload) {
    http_response_code(200);
    echo "OK";
    exit();
}

$eventType = isset($payload['event']) ? $payload['event'] : (isset($payload['type']) ? $payload['type'] : null);
$payment = isset($payload['object']) ? $payload['object'] : $payload;
$paymentId = isset($payment['id']) ? $payment['id'] : null;
$paymentStatus = isset($payment['status']) ? $payment['status'] : null;
$userId = isset($payment['metadata']['user_id']) ? $payment['metadata']['user_id'] : (isset($payment['metadata']['userId']) ? $payment['metadata']['userId'] : null);

if (($eventType === 'payment.succeeded' || $paymentStatus === 'succeeded') && $userId) {
    $now = date('Y-m-d H:i:s');
    
    try {
        // Обновляем статус платежа
        $stmt = $db->prepare("UPDATE payments SET status = 'succeeded', paid_at = ? WHERE id = ?");
        $stmt->execute([$now, $paymentId]);
        
        // Обновляем пользователя
        $stmt = $db->prepare("
            UPDATE users 
            SET has_paid_access = 1, 
                subscription_status = 'active',
                subscription_created_at = ?,
                paid_at = ?,
                payment_id = ?
            WHERE id = ?
        ");
        $stmt->execute([$now, $now, $paymentId, $userId]);
        
        error_log("✅ Payment $paymentId confirmed for user $userId");
    } catch (PDOException $e) {
        error_log("Webhook error: " . $e->getMessage());
    }
}

http_response_code(200);
echo "OK";