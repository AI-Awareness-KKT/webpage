<?php
// save_user.php
// Accepts JSON POST. Appends to data/users.csv (prevents duplicates).

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
if (!$raw) {
    echo json_encode(['success'=>false,'error'=>'No input received']); exit;
}
$data = json_decode($raw, true);
if (!$data) {
    echo json_encode(['success'=>false,'error'=>'Invalid JSON']); exit;
}

$name = trim($data['name'] ?? '');
$school = trim($data['school'] ?? '');
$state = trim($data['state'] ?? '');
$ua = trim($data['user_agent'] ?? '');
$ts = trim($data['timestamp'] ?? date('c'));

if ($name === '' || $school === '' || $state === '') {
    echo json_encode(['success'=>false,'error'=>'All fields required']); exit;
}

// sanitize CSV fields (remove newlines)
function clean($s){ return str_replace(array(\"\\r\",\"\\n\"), array(' ', ' '), $s); }

$line = array(clean($name), clean($school), clean($state), clean($ua), clean($ts));
$csvFile = __DIR__ . '/data/users.csv';

// Ensure data directory and file exist
if (!file_exists(__DIR__ . '/data')) {
    if (!mkdir(__DIR__ . '/data', 0755, true)) {
        echo json_encode(['success'=>false,'error'=>'Unable to create data directory']); exit;
    }
}
if (!file_exists($csvFile)) {
    // create file and add header
    file_put_contents($csvFile, \"Name,School,State,UserAgent,Timestamp\\n\", LOCK_EX);
}

// Read existing entries to detect duplicates (Name+School+State)
$existing = file($csvFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$duplicate = false;
foreach ($existing as $idx => $row) {
    if ($idx === 0) continue; // skip header
    $cols = str_getcsv($row);
    if (count($cols) >= 3) {
        $en = trim($cols[0]); $es = trim($cols[1]); $est = trim($cols[2]);
        if (strcasecmp($en, $name) === 0 && strcasecmp($es, $school) === 0 && strcasecmp($est, $state) === 0) {
            $duplicate = true;
            break;
        }
    }
}

if ($duplicate) {
    echo json_encode(['success'=>false,'duplicate'=>true,'error'=>'Duplicate entry detected']); exit;
}

// Append to CSV
$fp = fopen($csvFile, 'a');
if (!$fp) {
    echo json_encode(['success'=>false,'error'=>'Unable to open CSV for writing']); exit;
}
fputcsv($fp, $line);
fclose($fp);

echo json_encode(['success'=>true,'message'=>'Saved']);
exit;
?>