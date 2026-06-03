<?php
// api/auth/login.php

require_once __DIR__ . '/../config/database.php';

$db = getDB();

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

$email = isset($data['email']) ? filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email и пароль обязательны"]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT id, email, name, password_hash, email_verified, has_paid_access, subscription_status FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(["error" => "Неверный email или пароль"]);
        exit();
    }
    
    // ПРОВЕРКА ПОДТВЕРЖДЕНИЯ EMAIL
    if ($user['email_verified'] == 0) {
        http_response_code(403);
        echo json_encode(["error" => "Подтвердите email. Письмо отправлено на вашу почту."]);
        exit();
    }

    startSession();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['name'];

    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user['id'],
            "email" => $user['email'],
            "name" => $user['name'],
            "has_paid_access" => (bool)$user['has_paid_access'],
            "subscription_status" => $user['subscription_status']
        ]
    ]);
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Ошибка сервера"]);
}