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

function save_base64_photo_to_disk($photoStr) {
    if (!is_string($photoStr)) return 'img/posts/demo/milo_1.jpg';
    $photoStr = trim($photoStr);
    if (strpos($photoStr, 'img/') === 0 || strpos($photoStr, 'http://') === 0 || strpos($photoStr, 'https://') === 0) {
        return $photoStr;
    }
    // Si contiene HEIC o HEIF (no soportado por navegadores web estándar)
    if (stripos($photoStr, 'image/heic') !== false || stripos($photoStr, 'image/heif') !== false) {
        return 'img/posts/demo/milo_1.jpg';
    }
    // Guardar Base64 como archivo real en img/posts/uploads/
    $uploadDir = __DIR__ . '/img/posts/uploads/';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0777, true);
    }
    @chmod($uploadDir, 0777);

    $ext = 'jpg';
    if (preg_match('/^data:image\/(\w+);base64,/', $photoStr, $m)) {
        $ext = strtolower($m[1]);
        if ($ext === 'jpeg') $ext = 'jpg';
        if (!in_array($ext, ['jpg', 'png', 'webp', 'gif'])) $ext = 'jpg';
        $photoStr = substr($photoStr, strpos($photoStr, ',') + 1);
    }
    $decoded = base64_decode($photoStr);
    if ($decoded !== false && strlen($decoded) > 0) {
        $fileName = 'pet_' . time() . '_' . substr(md5(uniqid(mt_rand(), true)), 0, 8) . '.' . $ext;
        if (@file_put_contents($uploadDir . $fileName, $decoded) !== false) {
            return 'img/posts/uploads/' . $fileName;
        }
    }
    return $photoStr;
}

// 1. OBTENER PUBLICACIONES DEL SERVIDOR (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = @file_get_contents($dataFile);
    $posts = json_decode($content, true);
    if (!is_array($posts)) {
        $posts = [];
    }

    // Asegurar que las fotos no queden en base64 pesado ni formato HEIC
    $modified = false;
    foreach ($posts as $pIdx => &$p) {
        if (isset($p['photos']) && is_array($p['photos'])) {
            foreach ($p['photos'] as $k => $ph) {
                if (is_string($ph) && (strpos($ph, 'data:image') === 0 || strlen($ph) > 100)) {
                    $savedUrl = save_base64_photo_to_disk($ph);
                    if ($savedUrl !== $ph) {
                        $p['photos'][$k] = $savedUrl;
                        $modified = true;
                    }
                }
            }
        }
    }
    unset($p);

    if ($modified) {
        @file_put_contents($dataFile, json_encode($posts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
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

    // Persistir fotos a disco en img/posts/uploads/
    if (isset($newPost['photos']) && is_array($newPost['photos'])) {
        foreach ($newPost['photos'] as $idx => $photo) {
            $newPost['photos'][$idx] = save_base64_photo_to_disk($photo);
        }
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
