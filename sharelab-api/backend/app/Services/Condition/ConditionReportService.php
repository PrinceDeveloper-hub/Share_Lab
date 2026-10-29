<?php

namespace App\Services\Condition;

use App\Enums\BookingStatus;
use App\Enums\ConditionType;
use App\Models\Booking;
use App\Models\ConditionReport;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\Booking\BookingStateMachine;
use App\Services\Incident\IncidentService;
use App\Services\Notification\NotificationService;
use App\Support\Clock;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConditionReportService
{
    public function __construct(
        private readonly Clock $clock,
        private readonly AuditService $audit,
        private readonly NotificationService $notifications,
        private readonly ConditionComparer $comparer,
        private readonly IncidentService $incidents,
        private readonly BookingStateMachine $stateMachine,
    ) {
    }

    public function checkIn(User $user, Booking $booking, array $data): ConditionReport
    {
        if ((int) $booking->user_id !== (int) $user->id) {
            abort(403, 'Only the booking owner can check in.');
        }

        if ($booking->status !== BookingStatus::Approved) {
            throw ValidationException::withMessages(['booking' => 'Only approved bookings can be checked in.']);
        }

        $now = $this->clock->now();
        $start = CarbonImmutable::parse($booking->start_at);
        $end = CarbonImmutable::parse($booking->end_at);

        if ($now->lessThan($start->subMinutes(30)) || $now->greaterThan($end)) {
            throw ValidationException::withMessages([
                'booking' => 'Check-in is available from 30 minutes before the start until the booked end time.',
            ]);
        }

        if ($booking->checkInReport()->exists()) {
            throw ValidationException::withMessages(['booking' => 'This booking has already been checked in.']);
        }

        return DB::transaction(function () use ($user, $booking, $data): ConditionReport {
            $this->stateMachine->assert($booking->status, BookingStatus::CheckedIn);

            $booking->forceFill(['status' => BookingStatus::CheckedIn])->save();

            $report = ConditionReport::query()->create([
                'booking_id' => $booking->id,
                'type' => ConditionType::CheckIn,
                'condition' => $data['condition'],
                'notes' => $data['notes'] ?? null,
                'checklist' => $data['checklist'] ?? null,
                'file_path' => $data['file_path'] ?? null,
                'reported_by' => $user->id,
            ]);

            $this->audit->record(
                $user,
                'checked_in',
                Booking::class,
                $booking->id,
                $booking->id,
                'Check-in completed.',
                ['condition' => $report->condition],
            );

            $this->notifications->send($user, 'booking_checked_in', "You checked in for booking #{$booking->id}.", $booking->id);

            return $report->load('reporter');
        });
    }

    public function return(User $user, Booking $booking, array $data): ConditionReport
    {
        if ((int) $booking->user_id !== (int) $user->id) {
            abort(403, 'Only the booking owner can return this item.');
        }

        if ($booking->status !== BookingStatus::CheckedIn) {
            throw ValidationException::withMessages(['booking' => 'Only checked-in bookings can be returned.']);
        }

        return DB::transaction(function () use ($user, $booking, $data): ConditionReport {
            $this->stateMachine->assert($booking->status, BookingStatus::Returned);

            $now = $this->clock->now();
            $end = CarbonImmutable::parse($booking->end_at);
            $isLate = $now->greaterThan($end);

            $report = ConditionReport::query()->create([
                'booking_id' => $booking->id,
                'type' => ConditionType::Return,
                'condition' => $data['condition'],
                'notes' => $data['notes'] ?? null,
                'checklist' => $data['checklist'] ?? null,
                'file_path' => $data['file_path'] ?? null,
                'reported_by' => $user->id,
            ]);

            $booking->forceFill([
                'status' => BookingStatus::Returned,
                'is_late' => $isLate,
            ])->save();

            $checkIn = $booking->checkInReport()->latest('id')->first();
            $comparison = $this->comparer->compare(
                $checkIn?->condition,
                $report->condition,
                $end,
                $now,
            );

            if ($isLate) {
                $this->incidents->suggested(
                    $booking,
                    'delay',
                    'The item was returned after the booked end time. Please confirm whether this was a late return.',
                );
            }

            if ($comparison['suggested'] && $comparison['type'] === 'damage') {
                $this->incidents->suggested($booking, 'damage', (string) $comparison['description']);
            }

            $this->audit->record(
                $user,
                'returned',
                Booking::class,
                $booking->id,
                $booking->id,
                $data['notes'] ?? 'Items returned.',
                [
                    'condition' => $report->condition,
                    'is_late' => $isLate,
                    'check_in_condition' => $checkIn?->condition,
                    'comparison' => $comparison,
                ],
            );

            $this->notifications->send($user, 'booking_returned', "You returned booking #{$booking->id}.", $booking->id);
            $this->notifications->sendToManagers(
                (int) $booking->resource_id,
                'booking_returned',
                "Booking #{$booking->id} was returned as {$report->condition}.",
                $booking->id,
            );

            return $report->load('reporter');
        });
    }
}
