<?php
// api/auth/debug_register.php - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../mailer/sendmail.php';

$db = getDB();

$email = 'test_debug@example.com';
$password = '123456';
$name = 'Debug Test';

echo "<h2>Debug Register Test</h2>";

echo "<h3>1. Database connection:</h3>";
if ($db) {
    echo "✅ Connected!<br>";
} else {
    echo "❌ Not connected!<br>";
    exit();
}

echo "<h3>2. Check users table:</h3>";
try {
    $stmt = $db->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Table 'users' exists<br>";
    } else {
        echo "❌ Table 'users' does NOT exist!<br>";
        exit();
    }
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
    exit();
}

echo "<h3>3. Check email_verified column:</h3>";
try {
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'email_verified'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Column 'email_verified' exists<br>";
    } else {
        echo "❌ Column 'email_verified' does NOT exist!<br>";
        exit();
    }
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
    exit();
}

echo "<h3>4. Check email_verifications table:</h3>";
try {
    $stmt = $db->query("SHOW TABLES LIKE 'email_verifications'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Table 'email_verifications' exists<br>";
    } else {
        echo "❌ Table 'email_verifications' does NOT exist!<br>";
        exit();
    }
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
    exit();
}

echo "<h3>5. Try to insert test user:</h3>";
try {
    // Удаляем старого тестового пользователя
    $stmt = $db->prepare("DELETE FROM users WHERE email = ?");
    $stmt->execute(array($email));
    
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("
        INSERT INTO users (email, password_hash, name, email_verified, has_paid_access, subscription_status) 
        VALUES (?, ?, ?, 0, 0, 'inactive')
    ");
    
    if ($stmt->execute(array($email, $password_hash, $name))) {
        $userId = $db->lastInsertId();
        echo "✅ User inserted! ID: $userId<br>";
        
        // Генерируем токен БЕЗ random_bytes()
        $token = generateSafeToken();
        $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $stmt = $db->prepare("INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)");
        if ($stmt->execute(array($userId, $token, $expires))) {
            echo "✅ Token inserted: $token<br>";
        } else {
            echo "❌ Failed to insert token!<br>";
        }
        
        echo "<h3>6. Try to send email:</h3>";
        $emailSent = sendVerificationEmail($email, $name, $token);
        if ($emailSent) {
            echo "✅ Email sent! Check your inbox/spam<br>";
        } else {
            echo "❌ Email failed! Check error_log<br>";
        }
        
    } else {
        echo "❌ Failed to insert user!<br>";
    }
} catch (PDOException $e) {
    echo "❌ PDO Error: " . $e->getMessage() . "<br>";
}

echo "<h3>7. Check if user was created:</h3>";
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute(array($email));
$user = $stmt->fetch();
if ($user) {
    echo "✅ User found!<br>";
    echo "<pre>";
    print_r($user);
    echo "</pre>";
} else {
    echo "❌ User NOT found!<br>";
}

echo "<h3>8. Check email_verifications table:</h3>";
$stmt = $db->prepare("SELECT * FROM email_verifications WHERE user_id = (SELECT id FROM users WHERE email = ?)");
$stmt->execute(array($email));
$tokenRow = $stmt->fetch();
if ($tokenRow) {
    echo "✅ Token found!<br>";
    echo "<pre>";
    print_r($tokenRow);
    echo "</pre>";
} else {
    echo "❌ Token NOT found!<br>";
}

/**
 * Генерация безопасного токена (альтернатива random_bytes для старых версий PHP)
 *
 * @return string
 */
function generateSafeToken() {
    // Пытаемся использовать random_bytes (PHP 7+)
    if (function_exists('random_bytes')) {
        return bin2hex(random_bytes(32));
    }
    
    // Альтернатива для старых версий PHP через openssl
    if (function_exists('openssl_random_pseudo_bytes')) {
        return bin2hex(openssl_random_pseudo_bytes(32));
    }
    
    // Самый простой fallback (менее безопасный, но работает везде)
    return md5(uniqid(rand(), true)) . md5(uniqid(rand(), true));
}
?>