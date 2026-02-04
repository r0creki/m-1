<?php
header("Content-Type: text/plain");
header("X-Content-Type-Options: nosniff");

/*
 URL:
 /api/script/centaura
 /api/script/dahood
*/

$path = $_SERVER["REQUEST_URI"];
$slug = trim(basename($path));

if (!$slug) {
    http_response_code(404);
    exit;
}

/* MAP SLUG → SCRIPT */
$scripts = [
    "centaura" => function () {
        return <<<LUA
print("[Pevo] Centaura Loaded")
-- SCRIPT ASLI DI SINI
LUA;
    },

    "animtroll" => function () {
        return <<<LUA
print("[Pevo] Animation Troll Loaded")
loadstring(game:HttpGet("https://raw.githubusercontent.com/yunus154524/scripts/refs/heads/main/anim2gui.lua"))()
LUA;
    },

    "spear-fishing" => function () {
        return <<<LUA
print("[Pevo] Anti-AFK Loaded")
LUA;
    },
];

/* FALLBACK */
if (!isset($scripts[$slug])) {
    echo "-- invalid game";
    exit;
}

/* OUTPUT */
$lua  = "-- Pevolution Protected\n";
$lua .= "if not game:IsLoaded() then game.Loaded:Wait() end\n\n";
$lua .= $scripts[$slug]();

echo $lua;
exit;
