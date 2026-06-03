<?php
// api/auth/verify.php

header('Content-Type: text/html; charset=UTF-8');

require_once __DIR__ . '/../config/database.php';

$token = isset($_GET['token']) ? $_GET['token'] : '';

if (empty($token)) {
    die("❌ Неверная ссылка подтверждения");
}

$db = getDB();

try {
    $stmt = $db->prepare("SELECT user_id, expires_at FROM email_verifications WHERE token = ? AND expires_at > NOW()");
    $stmt->execute(array($token));
    $verification = $stmt->fetch();

    if (!$verification) {
        die("❌ Ссылка подтверждения недействительна или истекла.");
    }

    $stmt = $db->prepare("UPDATE users SET email_verified = 1 WHERE id = ?");
    $stmt->execute(array($verification['user_id']));

    $stmt = $db->prepare("DELETE FROM email_verifications WHERE token = ?");
    $stmt->execute(array($token));

    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email подтвержден</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #ffffff;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #ffffff;
                text-align: center;
            }
            .rabbit {
                font-size: 80px;
                margin-bottom: 20px;
            }
            h1 {
                color: #89674f;
                font-size: 28px;
                margin-bottom: 20px;
            }
            .message {
                color: #89674f;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 14px 40px;
                background-color: #89674f;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 30px;
                font-size: 16px;
                font-weight: bold;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #6b4f3d;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e0d6c7;
                color: #89674f;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="rabbit">🐰</div>
            <h1>Email подтвержден!</h1>
            <div class="message">
                Ваш email успешно подтвержден.<br>
                Теперь вы можете войти в свой аккаунт.
            </div>
            <a href="http://v3vanity.beget.tech" class="button">Перейти на сайт</a>
            <div class="footer">
                <p>© 2025 Гид по Костроме. Все права защищены.</p>
                <p>Кострома — жемчужина Золотого кольца России</p>
            </div>
        </div>
    </body>
    </html>
    <?php
    
} catch (PDOException $e) {
    error_log("Verify error: " . $e->getMessage());
    echo "❌ Ошибка сервера. Попробуйте позже.";
}
?>