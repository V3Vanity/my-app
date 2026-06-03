<?php
// api/auth/verify-process.php

header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/../config/database.php';

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);
$token = isset($data['token']) ? $data['token'] : '';

if (empty($token)) {
    echo json_encode(array("success" => false, "error" => "Неверная ссылка подтверждения"));
    exit();
}

$db = getDB();

try {
    // Находим токен
    $stmt = $db->prepare("
        SELECT user_id, expires_at FROM email_verifications 
        WHERE token = ? AND expires_at > NOW()
    ");
    $stmt->execute(array($token));
    $verification = $stmt->fetch();

    if (!$verification) {
        echo json_encode(array("success" => false, "error" => "Ссылка подтверждения недействительна или истекла"));
        exit();
    }

    // Активируем пользователя
    $stmt = $db->prepare("UPDATE users SET email_verified = 1 WHERE id = ?");
    $stmt->execute(array($verification['user_id']));

    // Удаляем использованный токен
    $stmt = $db->prepare("DELETE FROM email_verifications WHERE token = ?");
    $stmt->execute(array($token));

    echo json_encode(array("success" => true));
    
} catch (PDOException $e) {
    error_log("Verify error: " . $e->getMessage());
    echo json_encode(array("success" => false, "error" => "Ошибка сервера"));
}
?>