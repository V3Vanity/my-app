<?php
// api/config/database.php

// Заголовки CORS
header('Content-Type: application/json');

// Проверяем наличие HTTP_ORIGIN
$origin = '*';
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
}
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, apikey');
header('Access-Control-Allow-Credentials: true');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Класс для работы с базой данных
 */
class Database {
    /** @var string Хост базы данных */
    private $host = "localhost";
    
    /** @var string Имя базы данных */
    private $db_name = "v3vanity_gid";
    
    /** @var string Имя пользователя БД */
    private $username = "v3vanity_gid";
    
    /** @var string Пароль пользователя БД */
    private $password = "OnePiece007008.";
    
    /** @var PDO|null Объект соединения с БД */
    public $conn = null;

    /**
     * Получение соединения с БД
     * 
     * @return PDO|null Объект PDO или null при ошибке
     */
    public function getConnection() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
            );
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(array("error" => "Database connection failed: " . $exception->getMessage()));
            exit();
        }
        return $this->conn;
    }
}

/**
 * Старт сессии, если не запущена
 *
 * @return void
 */
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Проверка авторизации пользователя
 *
 * @return bool
 */
function isAuthenticated() {
    startSession();
    return isset($_SESSION['user_id']) && isset($_SESSION['user_email']);
}

/**
 * Получение текущего пользователя
 *
 * @param PDO $db Объект соединения с БД
 * @return array|null Массив с данными пользователя или null
 */
function getCurrentUser($db) {
    if (!isAuthenticated()) {
        return null;
    }
    
    try {
        $stmt = $db->prepare("SELECT id, email, name, email_verified, has_paid_access, subscription_status, subscription_created_at, paid_at FROM users WHERE id = ?");
        $stmt->execute(array($_SESSION['user_id']));
        $user = $stmt->fetch();
        
        if ($user) {
            return $user;
        }
    } catch (PDOException $e) {
        error_log("getCurrentUser error: " . $e->getMessage());
    }
    
    return null;
}

/**
 * Создание экземпляра базы данных (синглтон)
 *
 * @return PDO Объект PDO
 */
function getDB() {
    static $db = null;
    if ($db === null) {
        $database = new Database();
        $db = $database->getConnection();
    }
    return $db;
}