<?php
// api/payments/create.php

require_once __DIR__ . '/../config/database.php';

$db = getDB();
$user = getCurrentUser($db);

if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Пожалуйста, войдите в аккаунт"]);
    exit();
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

$amount = isset($data['amount']) ? $data['amount'] : '990.00';
$description = isset($data['description']) ? $data['description'] : 'Доступ к электронному путеводителю по Костроме';
$returnUrl = isset($data['returnUrl']) ? $data['returnUrl'] : 'https://kostromagid.ru/app'; // 1. ОБНОВИЛИ returnUrl

// 2. ПРОПИСАЛИ КЛЮЧИ НАПРЯМУЮ
$shopId = '1372262';
$secretKey = 'test_pXy3xM219hL0r136NkuvpIhl1iL9ackc0a2tAThxzSY';

// Проверка, что ключи не пустые (можно оставить для надежности)
if (empty($shopId) || empty($secretKey)) {
    http_response_code(500);
    echo json_encode(["error" => "Платежная система не настроена"]);
    exit();
}

$idempotenceKey = uniqid('', true);

$paymentData = [
    "amount" => [
        "value" => $amount,
        "currency" => "RUB"
    ],
    "capture" => true,
    "confirmation" => [
        "type" => "redirect",
        "return_url" => $returnUrl
    ],
    "description" => $description,
    "metadata" => [
        "user_id" => (string)$user['id']
    ]
];

$ch = curl_init("https://api.yookassa.ru/v3/payments");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Basic " . base64_encode($shopId . ":" . $secretKey),
    "Idempotence-Key: " . $idempotenceKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 || $httpCode === 201) {
    $payment = json_decode($response, true);
    
    try {
        $stmt = $db->prepare("INSERT INTO payments (id, user_id, amount, status) VALUES (?, ?, ?, 'pending')");
        $stmt->execute([$payment['id'], $user['id'], $amount]);
    } catch (PDOException $e) {
        error_log("Save payment error: " . $e->getMessage());
    }
    
    echo json_encode([
        "success" => true,
        "confirmationUrl" => $payment['confirmation']['confirmation_url'],
        "paymentId" => $payment['id']
    ]);
} else {
    // Логируем ответ от ЮKassa для отладки
    error_log("YooKassa error: " . $response);
    http_response_code(500);
    echo json_encode(["error" => "Ошибка создания платежа"]);
}
?>