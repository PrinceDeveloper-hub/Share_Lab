<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('category');
            $table->string('location');
            $table->text('description')->nullable();
            $table->text('rules')->nullable();
            $table->integer('max_hours_per_booking');
            $table->integer('weekly_cap_hours');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('resource_managers', function (Blueprint $table) {
            $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->primary(['resource_id', 'user_id']);
        });

        Schema::create('resource_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade');
            $table->string('name');
            $table->boolean('requires_verification');
            $table->timestamps();
        });

        Schema::create('user_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('requirement_name');
            $table->enum('status', ['pending', 'verified', 'rejected']);
            $table->string('file_path')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->text('review_note')->nullable();
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->string('purpose')->nullable();
            $table->enum('status', ['pending', 'waitlisted', 'approved', 'rejected', 'cancelled', 'checked_in', 'returned']);
            $table->text('decision_reason')->nullable();
            $table->foreignId('decided_by')->nullable()->constrained('users');
            $table->decimal('priority_score', 10, 2)->nullable();
            $table->text('priority_explanation')->nullable();
            $table->integer('waitlist_position')->nullable();
            $table->timestamp('confirm_by')->nullable();
            $table->boolean('is_late')->default(false);
            $table->timestamps();
        });

        Schema::create('condition_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->enum('type', ['checkin', 'return']);
            $table->enum('condition', ['excellent', 'good', 'fair', 'damaged']);
            $table->text('notes')->nullable();
            $table->json('checklist')->nullable();
            $table->foreignId('reported_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('reported_by')->nullable()->constrained('users');
            $table->enum('type', ['damage', 'delay', 'other']);
            $table->text('description');
            $table->enum('status', ['open', 'resolved']);
            $table->boolean('suggested_by_system')->default(false);
            $table->foreignId('confirmed_by')->nullable()->constrained('users');
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->text('resolution_note')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users');
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->foreignId('subject_id')->nullable()->index();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('cascade');
            $table->text('reason')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps(false);

            // Ensure no updates
            $table->engine = 'InnoDB';
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type');
            $table->text('message');
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('cascade');
            $table->boolean('read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('incidents');
        Schema::dropIfExists('condition_reports');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('user_credentials');
        Schema::dropIfExists('resource_requirements');
        Schema::dropIfExists('resource_managers');
        Schema::dropIfExists('resources');
    }
};