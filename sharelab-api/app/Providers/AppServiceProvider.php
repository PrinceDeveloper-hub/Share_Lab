<?php

namespace App\Providers;

use App\Auth\JwtGuard;
use App\Models\Booking;
use App\Models\Incident;
use App\Models\Resource;
use App\Models\UserCredential;
use App\Policies\BookingPolicy;
use App\Policies\CredentialPolicy;
use App\Policies\IncidentPolicy;
use App\Policies\ResourcePolicy;
use App\Services\Audit\AuditService;
use App\Services\Auth\JwtService;
use App\Services\Booking\BookingService;
use App\Services\Booking\BookingStateMachine;
use App\Services\Booking\PriorityScoreCalculator;
use App\Services\Booking\Rules\BookingRuleEngine;
use App\Services\Booking\Rules\ConflictRule;
use App\Services\Booking\Rules\DurationRule;
use App\Services\Booking\Rules\EligibilityRule;
use App\Services\Booking\Rules\WeeklyCapRule;
use App\Services\Booking\WaitlistService;
use App\Services\Condition\ConditionComparer;
use App\Services\Condition\ConditionReportService;
use App\Services\Credential\CredentialService;
use App\Services\Eligibility\EligibilityService;
use App\Services\Incident\IncidentService;
use App\Services\Notification\NotificationService;
use App\Services\Resource\ResourceService;
use App\Services\Resource\ResourceServiceInterface;
use App\Support\Clock;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Clock::class);
        $this->app->singleton(JwtService::class);
        $this->app->singleton(AuditService::class);
        $this->app->singleton(NotificationService::class);
        $this->app->singleton(EligibilityService::class);
        $this->app->singleton(ConditionComparer::class);
        $this->app->singleton(CredentialService::class);
        $this->app->singleton(IncidentService::class);
        $this->app->singleton(ConditionReportService::class);
        $this->app->singleton(PriorityScoreCalculator::class);
        $this->app->singleton(BookingStateMachine::class);
        $this->app->singleton(WaitlistService::class);
        $this->app->singleton(BookingService::class);
        $this->app->singleton(ResourceServiceInterface::class, ResourceService::class);

        $this->app->singleton(BookingRuleEngine::class, function ($app): BookingRuleEngine {
            return new BookingRuleEngine($app->tagged('booking.rules'));
        });
    }

    public function boot(): void
    {
        // Tagged in registration order: eligibility, duration, weekly cap, conflict.
        $this->app->tag([
            EligibilityRule::class,
            DurationRule::class,
            WeeklyCapRule::class,
            ConflictRule::class,
        ], 'booking.rules');

        Gate::policy(Resource::class, ResourcePolicy::class);
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(UserCredential::class, CredentialPolicy::class);
        Gate::policy(Incident::class, IncidentPolicy::class);

        Auth::extend('jwt', function ($app, string $name, array $config): JwtGuard {
            return new JwtGuard(
                Auth::createUserProvider($config['provider']),
                $app['request'],
                $app->make(JwtService::class),
            );
        });
    }
}
