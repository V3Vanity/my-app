<?php
// api/auth/register.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../mailer/sendmail.php';

$db = getDB();

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

$email = isset($data['email']) ? filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL) : '';
$password = isset($data['password']) ? $data['password'] : '';
$name = isset($data['name']) ? htmlspecialchars(trim($data['name']), ENT_QUOTES, 'UTF-8') : '';

$errors = array();

if (empty($email)) {
    $errors[] = "Email обязателен";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Неверный формат email";
}

if (empty($password)) {
    $errors[] = "Пароль обязателен";
} elseif (strlen($password) < 6) {
    $errors[] = "Пароль должен быть не менее 6 символов";
}

if (empty($name)) {
    $errors[] = "Имя обязательно";
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(array("error" => $errors[0]));
    exit();
}

try {
    // Проверка на существование пользователя
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(array($email));
    
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(array("error" => "Пользователь с таким email уже зарегистрирован"));
        exit();
    }

    // Хеширование пароля
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Вставка пользователя (email_verified = 0)
    $stmt = $db->prepare("
        INSERT INTO users (email, password_hash, name, email_verified, has_paid_access, subscription_status) 
        VALUES (?, ?, ?, 0, 0, 'inactive')
    ");

    if ($stmt->execute(array($email, $password_hash, $name))) {
        $userId = $db->lastInsertId();
        
        // Генерируем токен подтверждения
        $token = md5(uniqid(rand(), true)) . md5(uniqid(rand(), true));
        $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $stmt = $db->prepare("INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute(array($userId, $token, $expires));
        
        // Отправляем письмо
        $emailSent = sendVerificationEmail($email, $name, $token);
        
        echo json_encode(array(
            "success" => true,
            "message" => "Регистрация успешна! На ваш email отправлено письмо с ссылкой для подтверждения.",
            "requires_verification" => true,
            "email_sent" => $emailSent
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("error" => "Ошибка при регистрации"));
    }
    
} catch (PDOException $e) {
    error_log("Register error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array("error" => "Ошибка сервера. Попробуйте позже."));
}
?>