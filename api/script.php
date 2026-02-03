<?php
// api/script/index.php
header('Content-Type: text/plain');

// Strict security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: no-referrer');

// Validate request
function validateRequest() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    
    // Check if request is from Roblox
    $isRoblox = stripos($userAgent, 'Roblox') !== false;
    
    // Check referer (optional additional check)
    $validReferer = empty($referer) || parse_url($referer, PHP_URL_HOST) === $_SERVER['HTTP_HOST'];
    
    // Rate limiting check
    $ip = $_SERVER['REMOTE_ADDR'];
    $requests = getRequestCount($ip);
    
    if ($requests > 100) { // 100 requests per hour
        return false;
    }
    
    return $isRoblox && $validReferer;
}

// Get request count for IP (simplified)
function getRequestCount($ip) {
    $file = 'request_logs.json';
    $logs = [];
    
    if (file_exists($file)) {
        $logs = json_decode(file_get_contents($file), true) ?: [];
    }
    
    $hour = date('Y-m-d-H');
    $key = $ip . '_' . $hour;
    
    return $logs[$key] ?? 0;
}

// Log request
function logRequest($ip) {
    $file = 'request_logs.json';
    $logs = [];
    
    if (file_exists($file)) {
        $logs = json_decode(file_get_contents($file), true) ?: [];
    }
    
    $hour = date('Y-m-d-H');
    $key = $ip . '_' . $hour;
    
    $logs[$key] = ($logs[$key] ?? 0) + 1;
    
    // Clean old logs (older than 24 hours)
    foreach ($logs as $logKey => $count) {
        $parts = explode('_', $logKey);
        $logHour = end($parts);
        if (strtotime($logHour) < time() - 86400) {
            unset($logs[$logKey]);
        }
    }
    
    file_put_contents($file, json_encode($logs));
}

// Main execution
if (!validateRequest()) {
    // For invalid requests, return fake script or redirect
    header('HTTP/1.1 403 Forbidden');
    echo "-- Access Denied\n";
    echo "-- This endpoint is for Roblox client use only\n";
    exit;
}

// Log valid request
logRequest($_SERVER['REMOTE_ADDR']);

// List of hidden scripts (YOUR ACTUAL SCRIPTS)
$hiddenScripts = [
    'https://raw.githubusercontent.com/ExploitFin/AquaMatrix/refs/heads/AquaMatrix/AquaMatrix',
    'https://pastebin.com/raw/H5PfZB5y' // Additional script
];

// Combine scripts
$combinedScript = '';
foreach ($hiddenScripts as $index => $url) {
    $content = @file_get_contents($url);
    if ($content !== false) {
        $combinedScript .= "\n\n-- Script Part " . ($index + 1) . " (Source: " . hash('crc32', $url) . ")\n";
        $combinedScript .= $content;
    }
}

// Add protection wrapper
$output = "-- ============================================\n";
$output .= "-- Pevolution Protected Script Delivery System\n";
$output .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
$output .= "-- Request IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
$output .= "-- User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
$output .= "-- ============================================\n\n";
$output .= "-- Wait for game to load\n";
$output .= "if not game:IsLoaded() then\n";
$output .= "    game.Loaded:Wait()\n";
$output .= "end\n\n";
$output .= "-- Protection check\n";
$output .= "local function checkEnvironment()\n";
$output .= "    if not game or not game:IsA('DataModel') then\n";
$output .= "        return false\n";
$output .= "    end\n";
$output .= "    return true\n";
$output .= "end\n\n";
$output .= "-- Main execution\n";
$output .= "if checkEnvironment() then\n";
$output .= $combinedScript;
$output .= "\nelse\n";
$output .= "    warn('[Pevo] Invalid execution environment')\n";
$output .= "end\n";

echo $output;
?>