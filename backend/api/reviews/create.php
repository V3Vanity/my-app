<?php
// api/reviews/create.php

require_once __DIR__ . '/../config/database.php';

$db = getDB();

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

$name = isset($data['name']) ? htmlspecialchars(trim($data['name'])) : '';
$city = isset($data['city']) ? htmlspecialchars(trim($data['city'])) : '';
$text = isset($data['text']) ? htmlspecialchars(trim($data['text'])) : '';

$errors = [];

if (empty($name)) {
    $errors[] = "Имя обязательно";
}
if (empty($city)) {
    $errors[] = "Город обязателен";
}
if (empty($text)) {
    $errors[] = "Текст отзыва обязателен";
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(["error" => $errors[0]]);
    exit();
}

try {
    $stmt = $db->prepare("
        INSERT INTO reviews (name, city, text, is_approved) 
        VALUES (?, ?, ?, 1)
    ");
    
    if ($stmt->execute([$name, $city, $text])) {
        echo json_encode([
            "success" => true,
            "message" => "Спасибо за ваш отзыв!",
            "id" => $db->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Ошибка при сохранении отзыва"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Ошибка сервера"]);
}