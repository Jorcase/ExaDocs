<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Expirar cursadas del 1er cuatrimestre a la medianoche del 1 de Julio
Schedule::command('app:expire-cursadas --semester=1')->cron('0 0 1 7 *');

// Expirar cursadas del 2do cuatrimestre y anuales a la medianoche del 1 de Enero
Schedule::command('app:expire-cursadas --semester=2')->cron('0 0 1 1 *');
