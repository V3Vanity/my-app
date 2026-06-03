<?php
// api/reviews/test_reviews.php

require_once __DIR__ . '/../config/database.php';

$db = getDB();

echo "<h2>Test Reviews</h2>";

// Проверяем все отзывы
$stmt = $db->query("SELECT * FROM reviews ORDER BY created_at DESC");
$reviews = $stmt->fetchAll();

echo "<h3>All reviews (" . count($reviews) . "):</h3>";
echo "<pre>";
print_r($reviews);
echo "</pre>";

// Проверяем количество approved
$stmt = $db->query("SELECT COUNT(*) as count FROM reviews WHERE is_approved = 1");
$approved = $stmt->fetch();
echo "<h3>Approved reviews: " . $approved['count'] . "</h3>";

// Обновим все отзывы, чтобы они были approved
$db->query("UPDATE reviews SET is_approved = 1");
echo "<h3>✅ Updated all reviews to is_approved = 1</h3>";
?>