<?php
echo "<h2>Database Debug</h2>";

// Данные для подключения
$host = "localhost";
$dbname = "v3vanity_gid";
$username = "v3vanity_gid";
$password = "OnePiece007008";

echo "<h3>Testing connection with:</h3>";
echo "Host: " . $host . "<br>";
echo "Database: " . $dbname . "<br>";
echo "User: " . $username . "<br>";
echo "Password: " . str_repeat("*", strlen($password)) . "<br><br>";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✅ SUCCESS! Connected to database!<br>";
    
    // Проверяем таблицы
    $tables = ['users', 'reviews', 'payments'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Table '$table' exists<br>";
        } else {
            echo "❌ Table '$table' does NOT exist<br>";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br>";
    echo "<br>Possible reasons:<br>";
    echo "1. Wrong host (try 'v3vanity.mysql.beget.com' instead of 'localhost')<br>";
    echo "2. Wrong password<br>";
    echo "3. Database 'v3vanity_gid' doesn't exist<br>";
    echo "4. User 'v3vanity_gid' doesn't have permissions<br>";
}
?>