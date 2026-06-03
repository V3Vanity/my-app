<?php
// api/test.php - временный файл для проверки работы API

require_once __DIR__ . '/config/database.php';

echo "<h2>🔍 API Test Page</h2>";

// 1. Проверка подключения к БД
echo "<h3>1. Database Connection:</h3>";
try {
    $db = getDB();
    echo "✅ Connection successful!<br>";
} catch (Exception $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "<br>";
    $db = null;
}

// 2. Проверка существования таблиц
echo "<h3>2. Tables Check:</h3>";
if ($db !== null) {
    $tables = ['users', 'reviews', 'payments'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SHOW TABLES LIKE '$table'");
            if ($stmt->rowCount() > 0) {
                echo "✅ Table '$table' exists<br>";
            } else {
                echo "❌ Table '$table' does NOT exist<br>";
            }
        } catch (PDOException $e) {
            echo "❌ Error checking '$table': " . $e->getMessage() . "<br>";
        }
    }
} else {
    echo "❌ Cannot check tables - no database connection<br>";
}

// 3. Проверка функций
echo "<h3>3. Functions Check:</h3>";
$functions = ['startSession', 'isAuthenticated', 'getCurrentUser', 'getDB'];
foreach ($functions as $func) {
    echo (function_exists($func) ? "✅ " : "❌ ") . "$func()<br>";
}

// 4. Проверка количества пользователей
echo "<h3>4. Users Count:</h3>";
if ($db !== null) {
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM users");
        $row = $stmt->fetch();
        echo "📊 Total users: " . $row['count'] . "<br>";
    } catch (PDOException $e) {
        echo "❌ Error: " . $e->getMessage() . "<br>";
    }
} else {
    echo "❌ Cannot check users - no database connection<br>";
}

// 5. Проверка отзывов
echo "<h3>5. Reviews Count:</h3>";
if ($db !== null) {
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM reviews");
        $row = $stmt->fetch();
        echo "📝 Total reviews: " . $row['count'] . "<br>";
    } catch (PDOException $e) {
        echo "❌ Error: " . $e->getMessage() . "<br>";
    }
} else {
    echo "❌ Cannot check reviews - no database connection<br>";
}

// 6. Проверка платежей
echo "<h3>6. Payments Count:</h3>";
if ($db !== null) {
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM payments");
        $row = $stmt->fetch();
        echo "💰 Total payments: " . $row['count'] . "<br>";
    } catch (PDOException $e) {
        echo "❌ Error: " . $e->getMessage() . "<br>";
    }
} else {
    echo "❌ Cannot check payments - no database connection<br>";
}

echo "<hr>";
echo "<h3>✅ Test completed!</h3>";