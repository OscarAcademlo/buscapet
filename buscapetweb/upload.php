<?php
// =============================================================================
// BUSCAPET - SERVIDOR DE SUBIDA DE IMÁGENES A LA CARPETA IMG/POSTS/UPLOADS/
// Compatible con PHP 7.x y 8.x en Hostinger y Apache
// =============================================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$uploadDir = __DIR__ . '/img/posts/uploads/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
}
@chmod($uploadDir, 0777);

$relDir = 'img/posts/uploads/';
if (!is_writable($uploadDir)) {
    $fallbackDir = __DIR__ . '/img/posts/';
    if (is_dir($fallbackDir) && is_writable($fallbackDir)) {
        $uploadDir = $fallbackDir;
        $relDir = 'img/posts/';
    } else {
        $uploadDir = __DIR__ . '/img/';
        $relDir = 'img/';
    }
}

// 1. Subida mediante FormData multipart/form-data
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $fileTmp = $_FILES['photo']['tmp_name'];
    $originalName = $_FILES['photo']['name'];
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
        $ext = 'jpg';
    }

    $uniqueId = time() . '_' . substr(md5(uniqid(mt_rand(), true)), 0, 8);
    $fileName = 'pet_' . $uniqueId . '.' . $ext;
    $targetFile = $uploadDir . $fileName;

    if (@move_uploaded_file($fileTmp, $targetFile)) {
        echo json_encode([
            'success' => true,
            'url' => $relDir . $fileName
        ]);
        exit;
    }
}

// 2. Subida mediante Base64 (POST o JSON)
$inputRaw = file_get_contents('php://input');
$dataJson = json_decode($inputRaw, true);
$imageBase64 = isset($_POST['image_base64']) ? $_POST['image_base64'] : ($dataJson['image_base64'] ?? null);

if ($imageBase64) {
    $ext = 'jpg';
    if (preg_match('/^data:image\/(\w+);base64,/', $imageBase64, $match)) {
        $ext = strtolower($match[1]);
        if ($ext === 'jpeg') {
            $ext = 'jpg';
        }
        if (!in_array($ext, ['jpg', 'png', 'webp', 'gif'])) {
            $ext = 'jpg';
        }
        $imageBase64 = substr($imageBase64, strpos($imageBase64, ',') + 1);
    }

    $decoded = base64_decode($imageBase64);
    if ($decoded !== false && strlen($decoded) > 0) {
        $uniqueId = time() . '_' . substr(md5(uniqid(mt_rand(), true)), 0, 8);
        $fileName = 'pet_' . $uniqueId . '.' . $ext;
        $targetFile = $uploadDir . $fileName;

        if (@file_put_contents($targetFile, $decoded) !== false) {
            echo json_encode([
                'success' => true,
                'url' => $relDir . $fileName
            ]);
            exit;
        }
    }
}

echo json_encode([
    'success' => false,
    'error' => 'No se pudo guardar la imagen en img/posts/uploads/'
]);
