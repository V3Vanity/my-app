<?php
// api/auth/check-access.php

require_once __DIR__ . '/../config/database.php';

$db = getDB();
$user = getCurrentUser($db);

if (!$user) {
    echo json_encode(["hasAccess" => false]);
    exit();
}

$hasAccess = ($user['has_paid_access'] == 1 && $user['subscription_status'] === 'active');

echo json_encode([
    "hasAccess" => $hasAccess,
    "user" => [
        "id" => $user['id'],
        "email" => $user['email'],
        "name" => $user['name']
    ]
]);