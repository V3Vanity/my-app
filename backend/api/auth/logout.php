<?php
// api/auth/logout.php

require_once __DIR__ . '/../config/database.php';

startSession();
session_destroy();

echo json_encode(["success" => true]);