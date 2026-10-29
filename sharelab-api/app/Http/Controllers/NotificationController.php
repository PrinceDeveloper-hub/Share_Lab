<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponses;

    public function index(Request $request): JsonResponse
    {
        $paginator = $request->user()->notifications()->latest('created_at')->paginate(
            min(100, max(1, $request->integer('per_page', 15))),
        );

        return $this->paginated($paginator, NotificationResource::class, 'Notifications retrieved successfully.');
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return $this->ok([
            'unread' => $request->user()->notifications()->where('read', false)->count(),
        ], 'Unread notification count retrieved successfully.');
    }

    public function read(Request $request, Notification $notification): JsonResponse
    {
        abort_unless((int) $notification->user_id === (int) $request->user()->id, 403);

        $notification->forceFill(['read' => true])->save();

        return $this->resource(new NotificationResource($notification), 'Notification marked as read.');
    }

    public function readAll(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()->where('read', false)->update(['read' => true]);

        return $this->ok(['updated' => $count], 'All notifications marked as read.');
    }
}
