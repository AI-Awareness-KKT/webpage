<?php
// users.php - simple viewer for data/users.csv
$csvFile = __DIR__ . '/data/users.csv';
$rows = [];
if (file_exists($csvFile)) {
    $rows = array_map('str_getcsv', file($csvFile));
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Collected Visitors</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:20px;}
    table{border-collapse:collapse;width:100%;}
    th,td{padding:8px;border:1px solid #ddd;text-align:left;}
    th{background:#f6f6f6;}
  </style>
</head>
<body>
  <h1>Collected Visitor Details</h1>
  <p>Export: <a href="data/users.csv" download>Download CSV</a></p>
  <?php if (count($rows) <= 1): ?>
    <p><em>No entries yet.</em></p>
  <?php else: ?>
    <table>
      <thead>
        <tr><?php foreach ($rows[0] as $h) echo '<th>'.htmlspecialchars($h).'</th>'; ?></tr>
      </thead>
      <tbody>
        <?php for ($i=1;$i<count($rows);$i++): $r=$rows[$i]; ?>
          <tr>
            <?php foreach ($r as $c) echo '<td>'.htmlspecialchars($c).'</td>'; ?>
          </tr>
        <?php endfor; ?>
      </tbody>
    </table>
  <?php endif; ?>
</body>
</html>