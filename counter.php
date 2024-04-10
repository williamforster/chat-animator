<?php
// Specify the path to your text file
$filePath = '../counter.txt';

// Check if the file exists and is less than 200MB, or if it doesn't exist
if (!file_exists($filePath) || (file_exists($filePath) && filesize($filePath) < 209715200)) {
    // Get the current date and time
    $currentDateTime = date('Y-m-d H:i:s') . PHP_EOL;

    // Append the current date and time to the file or create it if it doesn't exist
    file_put_contents($filePath, $currentDateTime, FILE_APPEND);
} else {
    // File exists and is too large
    echo "The counter file exists and is too large to be modified.";
}
?>
