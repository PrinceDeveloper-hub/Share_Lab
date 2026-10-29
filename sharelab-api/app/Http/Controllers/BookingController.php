<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Requests\BookingRequest;
use App\Http\Requests\ConditionReportRequest;
use App\Http\Requests\DecisionRequest;
use App\Http\Requests\ExtendBookingRequest;
use App\Http\Requests\IncidentRequest;
use App\Http\Resources\BookingResource;
use App\Http\Resources\IncidentResource;
use App\Http\Resources\TimelineEntryResource;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Resource;
use App\Services\Booking\BookingService;
use App\Services\Booking\PriorityScoreCalculator;
use App\Services\Condition\ConditionReportService;
use App\Services\Incident\IncidentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    use ApiResponses;

    public function __construct(
        private readonly BookingService $bookings,
        private readonly ConditionReportService $conditions,
        private readonly IncidentService $incidents,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->bookings->paginateForUser($request->user(), $request->all());

        return $this->paginated($paginator, BookingResource::class, 'Bookings retrieved successfully.', [
            'counts' => $this->bookings->statusCounts($request->user()),
        ]);
    }

    public function managerIndex(Request $request): JsonResponse
    {
        $paginator = $this->bookings->paginateForManager($request->user(), $request->all());
        $calculator = app(PriorityScoreCalculator::class);

        $paginator->getCollection()->each(function (Booking $booking) use ($calculator): void {
            if ($booking->status->value === 'pending') {
                $booking->recommendation = $calculator->recommendation($booking);
            }
        });

        return $this->paginated($paginator, BookingResource::class, 'Request queue retrieved successfully.');
    }

    public function ownerIndex(Request $request): JsonResponse
    {
        $paginator = $this->bookings->paginateForOwner($request->user(), $request->all());

        return $this->paginated($paginator, BookingResource::class, 'Owned resource bookings retrieved successfully.');
    }

    public function store(BookingRequest $request): JsonResponse
    {
        $resource = Resource::query()->findOrFail($request->integer('resource_id'));
        $this->authorize('create', [Booking::class, $resource]);

        $booking = $this->bookings->request($request->user(), $request->validated());

        return $this->resource(new BookingResource($booking), 'Booking request submitted successfully.', 201);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);
        $booking = $booking->fresh([
            'resource.owner', 'resource.requirements', 'resource.managers', 'user',
            'checkInReport', 'returnReport', 'incidents',
        ]);

        $extra = [];
        if ($request->user()->can('decide', $booking) && $booking->status->value === 'pending') {
            $extra['recommendation'] = app(PriorityScoreCalculator::class)->recommendation($booking);
        }

        return $this->resource(new BookingResource($booking), 'Booking retrieved successfully.', 200, $extra);
    }

    public function decision(DecisionRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('decide', $booking);

        $booking = $this->bookings->decide(
            $request->user(),
            $booking,
            (string) $request->input('decision'),
            (string) $request->input('reason'),
        );

        return $this->resource(new BookingResource($booking), 'Decision recorded successfully.');
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);

        $validated = $request->validate(['reason' => ['nullable', 'string', 'max:1000']]);
        $booking = $this->bookings->cancel($request->user(), $booking, $validated['reason'] ?? null);

        return $this->resource(new BookingResource($booking), 'Booking cancelled successfully.');
    }

    public function extend(ExtendBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('extend', $booking);

        $booking = $this->bookings->extend($request->user(), $booking, (string) $request->input('end_at'));

        return $this->resource(new BookingResource($booking), 'Booking extended successfully.');
    }

    public function confirm(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);
        $booking = $this->bookings->confirmOffer($request->user(), $booking);

        return $this->resource(new BookingResource($booking), 'Waitlist offer confirmed.');
    }

    public function checkIn(ConditionReportRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('checkIn', $booking);

        $data = $request->validated();
        if ($request->hasFile('photo')) {
            $data['file_path'] = $request->file('photo')->store('condition-reports/'.$booking->id, 'local');
        }

        $report = $this->conditions->checkIn($request->user(), $booking, $data);

        return $this->ok([
            'report' => [
                'id' => $report->id,
                'condition' => $report->condition,
                'notes' => $report->notes,
                'at' => $report->created_at?->toIso8601String(),
            ],
            'booking' => (new BookingResource($booking->fresh(['resource', 'user'])))->resolve(),
        ], 'Checked in successfully.');
    }

    public function returnItems(ConditionReportRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('returnItems', $booking);

        $data = $request->validated();
        if ($request->hasFile('photo')) {
            $data['file_path'] = $request->file('photo')->store('condition-reports/'.$booking->id, 'local');
        }

        $report = $this->conditions->return($request->user(), $booking, $data);

        return $this->ok([
            'report' => [
                'id' => $report->id,
                'condition' => $report->condition,
                'notes' => $report->notes,
                'at' => $report->created_at?->toIso8601String(),
            ],
            'booking' => (new BookingResource($booking->fresh(['resource', 'user'])))->resolve(),
        ], 'Return recorded successfully.');
    }

    public function reportIncident(IncidentRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);
        $incident = $this->incidents->report($request->user(), $booking, $request->validated());

        return $this->resource(new IncidentResource($incident), 'Incident reported successfully.', 201);
    }

    public function timeline(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        $entries = AuditLog::query()
            ->with('actor:id,name,email,role')
            ->where('booking_id', $booking->id)
            ->oldest()
            ->get();

        return $this->ok(
            TimelineEntryResource::collection($entries)->resolve(),
            'Booking timeline retrieved successfully.',
        );
    }

    public function dashboard(Request $request): JsonResponse
    {
        return $this->ok($this->bookings->dashboard($request->user()), 'Dashboard summary retrieved successfully.');
    }
}
