<?php

use App\Services\Booking\WaitlistService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('sharelab:expire-waitlist-offers', function (WaitlistService $waitlist) {
    $expired = $waitlist->expireOffers();
    $this->info("Expired {$expired} waitlist offer(s).");
})->purpose('Expire 24-hour waitlist offers and promote the next eligible request');

Schedule::command('sharelab:expire-waitlist-offers')->everyMinute()->withoutOverlapping();
