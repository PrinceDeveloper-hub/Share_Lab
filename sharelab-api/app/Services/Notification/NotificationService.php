<?php

namespace App\Services\Notification;

use App\Models\Notification;
use App\Models\ResourceManager;
use App\Models\User;

class NotificationService
{
    public function send(User|int $recipient, string $type, string $message, ?int $bookingId = null): Notification
    {
        $userId = $recipient instanceof User ? (int) $recipient->getKey() : $recipient;

        return Notification::query()->create([
            'user_id' => $userId,
            'type' => $type,
            'message' => $message,
            'booking_id' => $bookingId,
            'read' => false,
        ]);
    }

    public function sendToManagers(int $resourceId, string $type, string $message, ?int $bookingId = null): void
    {
        $ids = ResourceManager::query()
            ->where('resource_id', $resourceId)
            ->pluck('user_id')
            ->all();

        foreach (array_unique($ids) as $userId) {
            $this->send((int) $userId, $type, $message, $bookingId);
        }
    }
}
