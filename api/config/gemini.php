<?php
require_once __DIR__ . '/env.php';
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: '');
define('GEMINI_MODEL',   'gemini-flash-latest');
