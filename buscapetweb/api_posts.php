<?php
// =============================================================================
// BUSCAPET - API DE PUBLICACIONES EN SERVIDOR (POSTS_DATA.JSON)
// Permite que las publicaciones se guarden en el servidor y sean visibles
// para todos los usuarios y dispositivos en buscapet.click
// =============================================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$dataFile = __DIR__ . '/posts_data.json';

// Si no existe, inicializar con arreglo vacío
if (!file_exists($dataFile)) {
    @file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// 1. OBTENER PUBLICACIONES DEL SERVIDOR (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = @file_get_contents($dataFile);
    $posts = json_decode($content, true);
    if (!is_array($posts)) {
        $posts = [];
    }
    echo json_encode($posts, JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. GUARDAR NUEVA PUBLICACIÓN EN EL SERVIDOR (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $newPost = json_decode($raw, true);

    if (!$newPost || !isset($newPost['id'])) {
        echo json_encode(['success' => false, 'error' => 'Datos de publicación inválidos']);
        exit;
    }

    $content = @file_get_contents($dataFile);
    $posts = json_decode($content, true);
    if (!is_array($posts)) {
        $posts = [];
    }

    // Evitar duplicados por id
    $exists = false;
    foreach ($posts as $idx => $p) {
        if (isset($p['id']) && $p['id'] === $newPost['id']) {
            $posts[$idx] = $newPost; // Actualizar
            $exists = true;
            break;
        }
    }

    if (!$exists) {
        array_unshift($posts, $newPost); // Insertar al inicio
    }

    // Guardar con bloqueo exclusivo
    $saved = @file_put_contents($dataFile, json_encode($posts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    if ($saved !== false) {
        echo json_encode(['success' => true, 'post' => $newPost]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se pudo escribir en el archivo de publicaciones']);
    }
    exit;
}
