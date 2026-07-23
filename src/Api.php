<?php
// Permette la comunicazione con il frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");

// 1. CONNESSIONE AL DATABASE
$host = "fdb1032.awardspace.net";
$dbname = "4762366_cc";
$username = "4762366_cc";
$password = "CrystalCharting2026";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Errore di connessione: " . $e->getMessage());
}

// 2. LETTURA DELL'AZIONE RICHIESTA
// Usiamo i classici parametri GET o POST, facili da inviare
$action = $_REQUEST['action'] ?? '';

// --- IMBARCAZIONI ---

if ($action == 'get_barche') {
    $stmt = $conn->query("SELECT * FROM Imbarcazioni");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($action == 'add_barca') {
    $sql = "INSERT INTO Imbarcazioni (nomebarca, tipo, alimentazione, capienza, cabine, potenza, descrizione, lunghezza, costo_giornaliero) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $_POST['nomebarca'] ?? '',
        $_POST['tipo'] ?? '',
        $_POST['alimentazione'] ?? '',
        $_POST['capienza'] ?? 0,
        $_POST['cabine'] ?? '',
        $_POST['potenza'] ?? 0,
        $_POST['descrizione'] ?? '',
        $_POST['lunghezza'] ?? 0,
        $_POST['costo_giornaliero'] ?? 0
    ]);
    echo "OK";
    exit;
}

if ($action == 'delete_barca') {
    $stmt = $conn->prepare("DELETE FROM Imbarcazioni WHERE idBarca = ?");
    $stmt->execute([$_GET['id']]);
    echo "OK";
    exit;
}

// --- PRENOTAZIONI ---

if ($action == 'get_prenotazioni') {
    $sql = "SELECT idPrenotazione, idBarca, timestamp_prenotazione, 
                   DATE_FORMAT(data_checkin, '%d/%m/%Y') AS checkin, 
                   DATE_FORMAT(data_checkout, '%d/%m/%Y') AS checkout, 
                   email, nome_prenotazione 
            FROM Prenotazioni";
    $stmt = $conn->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($action == 'add_prenotazione') {
    $sql = "INSERT INTO Prenotazioni (idBarca, data_checkin, data_checkout, email, nome_prenotazione) 
            VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $_POST['idBarca'],
        $_POST['data_checkin'],
        $_POST['data_checkout'],
        $_POST['email'],
        $_POST['nome_prenotazione']
    ]);
    echo "OK";
    exit;
}

if ($action == 'delete_prenotazione') {
    $stmt = $conn->prepare("DELETE FROM Prenotazioni WHERE idPrenotazione = ?");
    $stmt->execute([$_GET['id']]);
    echo "OK";
    exit;
}

// Se si apre la pagina senza comandi
echo "API Attiva - Specifica un'azione valida.";
?>
