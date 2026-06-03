<?php
// api/index.php - Главный роутер API

// Подключаем конфигурацию БД
require_once __DIR__ . '/config/database.php';

// Получаем метод запроса и URI
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Убираем базовый путь /api/
$path = str_replace('/api/', '', parse_url($requestUri, PHP_URL_PATH));
$path = trim($path, '/');

// Разбираем путь на части
$parts = explode('/', $path);
$resource = $parts[0] ?? '';
$action = $parts[1] ?? '';

// Устанавливаем заголовки для JSON ответов
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, apikey');
header('Access-Control-Allow-Credentials: true');

// Обработка preflight запросов
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Отправка JSON ответа
 * 
 * @param array|object $data Данные для отправки
 * @param int $statusCode HTTP статус код
 * @return void
 */
function sendJson($data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

/**
 * Получение и декодирование тела запроса
 * 
 * @return array Декодированные данные
 */
function getInput(): array
{
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);
    return is_array($data) ? $data : [];
}

// ==================== РОУТЫ ====================

try {
    /** @var PDO $db */
    $db = getDB();
    
    // ========== AUTH РОУТЫ ==========
    
    // Регистрация
    if ($resource === 'auth' && $action === 'register' && $method === 'POST') {
        /** @var array $data */
        $data = getInput();
        
        /** @var string $email */
        $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
        /** @var string $password */
        $password = $data['password'] ?? '';
        /** @var string $name */
        $name = htmlspecialchars($data['name'] ?? '');
        
        /** @var array $errors */
        $errors = [];
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Неверный формат email";
        }
        if (strlen($password) < 6) {
            $errors[] = "Пароль должен быть не менее 6 символов";
        }
        if (empty($name)) {
            $errors[] = "Имя обязательно";
        }
        
        if (!empty($errors)) {
            sendJson(["error" => $errors[0]], 400);
        }
        
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendJson(["error" => "Пользователь с таким email уже зарегистрирован"], 409);
        }
        
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO users (email, password_hash, name, has_paid_access, subscription_status) VALUES (?, ?, ?, 0, 'inactive')");
        
        if ($stmt->execute([$email, $password_hash, $name])) {
            sendJson([
                "success" => true,
                "message" => "Регистрация успешна!",
                "user" => [
                    "id" => $db->lastInsertId(),
                    "email" => $email,
                    "name" => $name
                ]
            ]);
        } else {
            sendJson(["error" => "Ошибка при регистрации"], 500);
        }
    }
    
    // Логин
    if ($resource === 'auth' && $action === 'login' && $method === 'POST') {
        /** @var array $data */
        $data = getInput();
        
        /** @var string $email */
        $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
        /** @var string $password */
        $password = $data['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            sendJson(["error" => "Email и пароль обязательны"], 400);
        }
        
        $stmt = $db->prepare("SELECT id, email, name, password_hash, has_paid_access, subscription_status FROM users WHERE email = ?");
        $stmt->execute([$email]);
        /** @var array|false $user */
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            sendJson(["error" => "Неверный email или пароль"], 401);
        }
        
        startSession();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['name'];
        
        sendJson([
            "success" => true,
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "name" => $user['name'],
                "has_paid_access" => (bool)$user['has_paid_access'],
                "subscription_status" => $user['subscription_status']
            ]
        ]);
    }
    
    // Выход
    if ($resource === 'auth' && $action === 'logout' && $method === 'POST') {
        startSession();
        session_destroy();
        sendJson(["success" => true]);
    }
    
    // Получить текущего пользователя
    if ($resource === 'auth' && $action === 'me' && $method === 'GET') {
        /** @var array|null $user */
        $user = getCurrentUser($db);
        if (!$user) {
            sendJson(["error" => "Не авторизован"], 401);
        }
        sendJson([
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "name" => $user['name'],
                "has_paid_access" => (bool)$user['has_paid_access'],
                "subscription_status" => $user['subscription_status']
            ]
        ]);
    }
    
    // Проверка доступа
    if ($resource === 'auth' && $action === 'check-access' && $method === 'GET') {
        /** @var array|null $user */
        $user = getCurrentUser($db);
        if (!$user) {
            sendJson(["hasAccess" => false]);
        }
        /** @var bool $hasAccess */
        $hasAccess = ($user['has_paid_access'] == 1 && $user['subscription_status'] === 'active');
        sendJson([
            "hasAccess" => $hasAccess,
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "name" => $user['name']
            ]
        ]);
    }
    
    // ========== REVIEWS РОУТЫ ==========
    
    // Получить отзывы
    if ($resource === 'reviews' && empty($action) && $method === 'GET') {
        /** @var int $limit */
        $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 100;
        
        $stmt = $db->prepare("SELECT id, name, city, text, created_at FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC LIMIT ?");
        $stmt->execute([$limit]);
        /** @var array $reviews */
        $reviews = $stmt->fetchAll();
        
        sendJson($reviews);
    }
    
    // Создать отзыв
    if ($resource === 'reviews' && $action === 'create' && $method === 'POST') {
        /** @var array $data */
        $data = getInput();
        
        /** @var string $name */
        $name = htmlspecialchars(trim($data['name'] ?? ''));
        /** @var string $city */
        $city = htmlspecialchars(trim($data['city'] ?? ''));
        /** @var string $text */
        $text = htmlspecialchars(trim($data['text'] ?? ''));
        
        /** @var array $errors */
        $errors = [];
        if (empty($name)) $errors[] = "Имя обязательно";
        if (empty($city)) $errors[] = "Город обязателен";
        if (empty($text)) $errors[] = "Текст отзыва обязателен";
        
        if (!empty($errors)) {
            sendJson(["error" => $errors[0]], 400);
        }
        
        $stmt = $db->prepare("INSERT INTO reviews (name, city, text, is_approved) VALUES (?, ?, ?, 1)");
        
        if ($stmt->execute([$name, $city, $text])) {
            sendJson([
                "success" => true,
                "message" => "Спасибо за ваш отзыв!",
                "id" => $db->lastInsertId()
            ]);
        } else {
            sendJson(["error" => "Ошибка при сохранении отзыва"], 500);
        }
    }
    
    // ========== PAYMENTS РОУТЫ ==========
    
    // Создать платеж
    if ($resource === 'payments' && $action === 'create' && $method === 'POST') {
        /** @var array|null $user */
        $user = getCurrentUser($db);
        if (!$user) {
            sendJson(["error" => "Пожалуйста, войдите в аккаунт"], 401);
        }
        
        /** @var array $data */
        $data = getInput();
        /** @var string $amount */
        $amount = $data['amount'] ?? '990.00';
        /** @var string $description */
        $description = $data['description'] ?? 'Доступ к электронному путеводителю по Костроме';
        /** @var string $returnUrl */
        $returnUrl = $data['returnUrl'] ?? 'https://your-domain.com/app';
        
        /** @var string $shopId */
        $shopId = getenv('YOOKASSA_SHOP_ID') ?: 'your_shop_id';
        /** @var string $secretKey */
        $secretKey = getenv('YOOKASSA_SECRET_KEY') ?: 'your_secret_key';
        
        if ($shopId === 'your_shop_id' || $secretKey === 'your_secret_key') {
            sendJson(["error" => "Платежная система не настроена"], 500);
        }
        
        /** @var string $idempotenceKey */
        $idempotenceKey = uniqid('', true);
        
        /** @var array $paymentData */
        $paymentData = [
            "amount" => ["value" => $amount, "currency" => "RUB"],
            "capture" => true,
            "confirmation" => ["type" => "redirect", "return_url" => $returnUrl],
            "description" => $description,
            "metadata" => ["user_id" => (string)$user['id']]
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
        
        /** @var string|false $response */
        $response = curl_exec($ch);
        /** @var int $httpCode */
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 || $httpCode === 201) {
            /** @var array $payment */
            $payment = json_decode($response, true);
            
            try {
                $stmt = $db->prepare("INSERT INTO payments (id, user_id, amount, status) VALUES (?, ?, ?, 'pending')");
                $stmt->execute([$payment['id'], $user['id'], $amount]);
            } catch (PDOException $e) {
                // Логируем ошибку
                error_log("Save payment error: " . $e->getMessage());
            }
            
            sendJson([
                "success" => true,
                "confirmationUrl" => $payment['confirmation']['confirmation_url'],
                "paymentId" => $payment['id']
            ]);
        } else {
            sendJson(["error" => "Ошибка создания платежа"], 500);
        }
    }
    
    // Вебхук для YooKassa
    if ($resource === 'payments' && $action === 'webhook' && $method === 'POST') {
        /** @var string $rawInput */
        $rawInput = file_get_contents("php://input");
        /** @var array|null $payload */
        $payload = json_decode($rawInput, true);
        
        if (!$payload) {
            http_response_code(200);
            echo "OK";
            exit();
        }
        
        /** @var string|null $eventType */
        $eventType = $payload['event'] ?? $payload['type'] ?? null;
        /** @var array $payment */
        $payment = $payload['object'] ?? $payload;
        /** @var string|null $paymentId */
        $paymentId = $payment['id'] ?? null;
        /** @var string|null $paymentStatus */
        $paymentStatus = $payment['status'] ?? null;
        /** @var string|null $userId */
        $userId = $payment['metadata']['user_id'] ?? $payment['metadata']['userId'] ?? null;
        
        if (($eventType === 'payment.succeeded' || $paymentStatus === 'succeeded') && $userId) {
            /** @var string $now */
            $now = date('Y-m-d H:i:s');
            
            try {
                $stmt = $db->prepare("UPDATE payments SET status = 'succeeded', paid_at = ? WHERE id = ?");
                $stmt->execute([$now, $paymentId]);
                
                $stmt = $db->prepare("UPDATE users SET has_paid_access = 1, subscription_status = 'active', subscription_created_at = ?, paid_at = ?, payment_id = ? WHERE id = ?");
                $stmt->execute([$now, $now, $paymentId, $userId]);
            } catch (PDOException $e) {
                error_log("Webhook error: " . $e->getMessage());
            }
        }
        
        http_response_code(200);
        echo "OK";
        exit();
    }
    
    // Если ничего не найдено
    sendJson(["error" => "Endpoint not found"], 404);
    
} catch (PDOException $e) {
    sendJson(["error" => "Ошибка сервера: " . $e->getMessage()], 500);
}