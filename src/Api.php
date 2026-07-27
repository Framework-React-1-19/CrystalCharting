<?php
// Gestione Header e CORS per chiamate locali/esterne
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. CONNESSIONE AL DATABASE
$host = "fdb1032.awardspace.net";
$dbname = "4762366_cc";
$username = "4762366_cc";
$password = "CrystalCharting2026";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Connessione DB fallita: " . $e->getMessage()]);
    exit();
}

$action = $_REQUEST['action'] ?? '';

// --- IMBARCAZIONI ---

if ($action == 'get_barche') {
    header("Content-Type: application/json; charset=UTF-8");
    $stmt = $conn->query("SELECT * FROM Imbarcazioni");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($action == 'add_barca') {
    try {
        $sql = "INSERT INTO Imbarcazioni (nomebarca, tipo, alimentazione, capienza, cabine, potenza, descrizione, lunghezza, costo_giornaliero) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $_POST['nomebarca'] ?? '',
            $_POST['tipo'] ?? '',
            $_POST['alimentazione'] ?? '',
            $_POST['capienza'] ?? 0,
            $_POST['cabine'] ?? '0',
            $_POST['potenza'] ?? 0,
            $_POST['descrizione'] ?? '',
            $_POST['lunghezza'] ?? 0,
            $_POST['costo_giornaliero'] ?? 0
        ]);
        echo "OK";
    } catch(Exception $e) {
        http_response_code(400);
        echo "Errore: " . $e->getMessage();
    }
    exit();
}

if ($action == 'delete_barca') {
    $stmt = $conn->prepare("DELETE FROM Imbarcazioni WHERE idBarca = ?");
    $stmt->execute([$_GET['id'] ?? 0]);
    echo "OK";
    exit();
}

// --- PRENOTAZIONI ---

if ($action == 'get_prenotazioni') {
    header("Content-Type: application/json; charset=UTF-8");
    $sql = "SELECT idPrenotazione, idBarca, timestamp_prenotazione, 
                   DATE_FORMAT(data_checkin, '%d/%m/%Y') AS checkin, 
                   DATE_FORMAT(data_checkout, '%d/%m/%Y') AS checkout, 
                   DATE_FORMAT(data_checkin, '%Y-%m-%d') AS data_checkin, 
                   DATE_FORMAT(data_checkout, '%Y-%m-%d') AS data_checkout, 
                   email, nome_prenotazione 
            FROM Prenotazioni";
    $stmt = $conn->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($action == 'add_prenotazione') {
    try {
        // Supporto sia per payload JSON che FormData
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        
        $sql = "INSERT INTO Prenotazioni (idBarca, data_checkin, data_checkout, email, nome_prenotazione) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $input['idBarca'] ?? null,
            $input['data_checkin'] ?? null,
            $input['data_checkout'] ?? null,
            $input['email'] ?? '',
            $input['nome_prenotazione'] ?? ''
        ]);
        echo "OK";
    } catch(Exception $e) {
        http_response_code(400);
        echo "Errore: " . $e->getMessage();
    }
    exit();
}

if ($action == 'delete_prenotazione') {
    $stmt = $conn->prepare("DELETE FROM Prenotazioni WHERE idPrenotazione = ?");
    $stmt->execute([$_GET['id'] ?? 0]);
    echo "OK";
    exit();
}

echo "API Attiva";
?>