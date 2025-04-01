<?php
require_once dirname(__FILE__) . '/midtrans-php-master/Midtrans.php';

// Konfigurasi Midtrans
\Midtrans\Config::$serverKey = 'SB-Mid-server-a24Kvyxp2_j_wLtsCDQrO2RR';
\Midtrans\Config::$isProduction = false;
\Midtrans\Config::$isSanitized = true;
\Midtrans\Config::$is3ds = true;

// Mengambil data dari request
$data = json_decode(file_get_contents("php://input"), true);

// Validasi apakah data yang diperlukan tersedia
if (!isset($data['total'], $data['items'], $data['name'], $data['email'], $data['phone'])) {
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

// Pastikan semua item memiliki harga yang valid
foreach ($data['items'] as &$item) {
    if (!isset($item['id'], $item['price'], $item['quantity'], $item['name'])) {
        echo json_encode(['error' => 'Invalid item data']);
        exit;
    }
    $item['price'] = (int) $item['price']; // Pastikan price dalam bentuk integer
    $item['quantity'] = (int) $item['quantity']; // Pastikan quantity dalam bentuk integer
}

// Pastikan `total` juga dalam bentuk integer
$data['total'] = (int) $data['total'];

// Membuat order ID unik
$order_id = "ORDER-" . time() . "-" . rand(100, 999);

$params = [
    'transaction_details' => [
        'order_id' => $order_id,
        'gross_amount' => $data['total'], // Pastikan total harga valid
    ],
    'item_details' => $data['items'],
    'customer_details' => [
        'first_name' => $data['name'],
        'email' => $data['email'],
        'phone' => $data['phone'],
    ],
];

try {
    $snapToken = \Midtrans\Snap::getSnapToken($params);
    echo json_encode(['token' => $snapToken, 'order_id' => $order_id]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
