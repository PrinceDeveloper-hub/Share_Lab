<?php

use App\Enums\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Add ShareLab-specific fields to the default Laravel users table.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['user', 'owner', 'manager', 'admin'])
                ->default(Role::User->value)
                ->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
