<?php
// api/reviews/get.php - ПРОСТЕЙШАЯ РАБОЧАЯ ВЕРСИЯ

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=UTF-8');

$db = getDB();

$sql = "SELECT id, name, city, text, created_at FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC";
$result = $db->query($sql);
$reviews = $result->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($reviews);
?>