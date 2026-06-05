<?php
// api/mailer/sendmail.php

require_once __DIR__ . '/../vendor/phpmailer/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Отправка письма для подтверждения email
 */
function sendVerificationEmail($to, $name, $token)
{
    $mail = new PHPMailer(true);
    
    try {
        // Настройки SMTP для Gmail
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'jun30010kmtn.ruu@gmail.com';
        $mail->Password   = 'tuhxasjrdzxbwgyd';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // Кодировка письма
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        
        // Отправитель и получатель
        $mail->setFrom('jun30010kmtn.ruu@gmail.com', 'Гид по Костроме');
        $mail->addAddress($to, $name);
        
        // Тема письма
        $subject = 'Подтверждение регистрации - Гид по Костроме';
        $mail->Subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        
        // Ссылка для подтверждения (на HTML страницу)
        $verifyLink = "https://kostromagid.ru/verify-success.html?token=" . $token;
        
        // HTML письмо
        $mail->isHTML(true);
        $mail->Body = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Подтверждение регистрации</title>
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
                    font-weight: normal;
                }
                .welcome-text {
                    color: #89674f;
                    font-size: 18px;
                    margin-bottom: 10px;
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
                    border: none;
                    cursor: pointer;
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
                .footer p {
                    margin: 5px 0;
                }
                .signature {
                    margin-top: 30px;
                    color: #89674f;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="rabbit">🐰</div>
                <h1>Гид по Костроме</h1>
                <div class="welcome-text">Добро пожаловать!</div>
                <div class="message">
                    Рады видеть вас в нашем гиде по городу Кострома.<br><br>
                    Для завершения регистрации и активации аккаунта,<br>
                    пожалуйста, подтвердите ваш email-адрес.
                </div>
                <a href="' . $verifyLink . '" class="button">Подтвердить почту</a>
                <div class="message">
                    Если вы не регистрировались в нашем гиде,<br>
                    просто проигнорируйте это письмо.
                </div>
                <div class="signature">
                    С уважением,<br>
                    Команда проекта «Гид по Костроме»
                </div>
                <div class="footer">
                    <p>© 2025 Гид по Костроме. Все права защищены.</p>
                    <p>Кострома — жемчужина Золотого кольца России</p>
                </div>
            </div>
        </body>
        </html>
        ';
        
        $mail->AltBody = "🐰\n\nГид по Костроме\n\nДобро пожаловать!\n\nРады видеть вас в нашем гиде по городу Кострома.\n\nДля завершения регистрации и активации аккаунта, подтвердите email, перейдя по ссылке:\n$verifyLink\n\nЕсли вы не регистрировались в нашем гиде, просто проигнорируйте это письмо.\n\nС уважением,\nКоманда проекта «Гид по Костроме»\n\n© 2025 Гид по Костроме. Все права защищены.\nКострома — жемчужина Золотого кольца России";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("Email sending failed: " . $mail->ErrorInfo);
        return false;
    }
}