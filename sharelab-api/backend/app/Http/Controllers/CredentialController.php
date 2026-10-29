<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Requests\CredentialReviewRequest;
use App\Http\Requests\CredentialUploadRequest;
use App\Http\Resources\UserCredentialResource;
use App\Models\UserCredential;
use App\Services\Credential\CredentialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CredentialController extends Controller
{
    use ApiResponses;

    public function __construct(private readonly CredentialService $credentials)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->credentials->paginateForUser($request->user(), $request->integer('per_page', 20));

        return $this->paginated($paginator, UserCredentialResource::class, 'Credentials retrieved successfully.');
    }

    public function managerIndex(Request $request): JsonResponse
    {
        $paginator = $this->credentials->pendingForManager($request->user(), $request->integer('per_page', 20));

        return $this->paginated($paginator, UserCredentialResource::class, 'Pending credentials retrieved successfully.');
    }

    public function ownerIndex(Request $request): JsonResponse
    {
        $paginator = $this->credentials->pendingForOwner($request->user(), $request->integer('per_page', 20));

        return $this->paginated($paginator, UserCredentialResource::class, 'Pending credentials for your resources retrieved successfully.');
    }

    public function store(CredentialUploadRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $path = $file->store('credentials/'.$request->user()->id, 'local');

        $credential = $this->credentials->submit(
            $request->user(),
            $request->string('requirement_name')->toString(),
            $path,
        );

        return $this->resource(new UserCredentialResource($credential), 'Credential submitted. Pending verification.', 201);
    }

    public function review(CredentialReviewRequest $request, UserCredential $credential): JsonResponse
    {
        $this->authorize('review', $credential);

        $credential = $this->credentials->review(
            $request->user(),
            $credential,
            $request->string('decision')->toString() === 'verify',
            $request->string('note')->toString(),
        );

        return $this->resource(new UserCredentialResource($credential), 'Credential reviewed successfully.');
    }

    public function download(UserCredential $credential): StreamedResponse
    {
        abort_unless($credential->file_path && Storage::disk('local')->exists($credential->file_path), 404);

        return Storage::disk('local')->download($credential->file_path);
    }
}
