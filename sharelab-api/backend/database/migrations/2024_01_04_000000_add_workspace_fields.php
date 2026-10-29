<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->json('availability_windows')->nullable()->after('weekly_cap_hours');
            $table->string('image_path')->nullable()->after('status');
            $table->index(['status', 'category']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['resource_id', 'start_at', 'end_at']);
            $table->index(['user_id', 'status']);
            $table->index(['status', 'confirm_by']);
        });

        Schema::table('condition_reports', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('checklist');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'read', 'created_at']);
        });

        Schema::table('incidents', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('incidents', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'read', 'created_at']);
        });

        Schema::table('condition_reports', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['resource_id', 'start_at', 'end_at']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['status', 'confirm_by']);
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->dropIndex(['status', 'category']);
            $table->dropColumn(['availability_windows', 'image_path']);
        });
    }
};
