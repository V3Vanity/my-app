<?php
// api/auth/me.php

require_once __DIR__ . '/../config/database.php';

$db = getDB();
$user = getCurrentUser($db);

if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Не авторизован"]);
    exit();
}

echo json_encode([
    "user" => [
        "id" => $user['id'],
        "email" => $user['email'],
        "name" => $user['name'],
        "has_paid_access" => (bool)$user['has_paid_access'],
        "subscription_status" => $user['subscription_status'],
        "subscription_created_at" => $user['subscription_created_at'],
        "paid_at" => $user['paid_at']
    ]
]);