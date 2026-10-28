<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Auth\Access\AuthorizationException::class,
        \Illuminate\Foundation\Auth\Access\AuthorizationException::class,
        \Symfony\Component\HttpFoundation\File\Exception\FileNotFoundException::class,
    ];

    /**
     * Register the exception hooks for the application.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $exception
     * @return void
     *
     * @phpstan-ignore-next-line
     */
    public function report(Throwable $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     *
     * @phpstan-ignore-next-line
     */
    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson() || $request->header('Accept', 'application/json') === 'application/json') {
            if (method_exists($exception, 'getStatusCode')) {
                $statusCode = $exception->getStatusCode();
                $message = $exception->getMessage();

                // Handle validation errors
                if ($exception instanceof \Illuminate\Validation\ValidationException) {
                    $errors = $exception->errors();
                    // Format errors into envelope
                    $formattedErrors = [];
                    foreach ($errors as $field => $messages) {
                        foreach ($messages as $msg) {
                            $formattedErrors[$field][] = $msg;
                        }
                    }

                    return new JsonResponse(
                        [
                            'data' => null,
                            'message' => 'Validation failed',
                            'errors' => empty($formattedErrors) ? null : $formattedErrors,
                        ],
                        422
                    );
                }

                // Handle authorization exceptions
                if ($exception instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    return new JsonResponse(
                        [
                            'data' => null,
                            'message' => 'Unauthorized',
                            'errors' => [],
                        ],
                        403
                    );
                }

                // Handle not found
                if ($exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    return new JsonResponse(
                        [
                            'data' => null,
                            'message' => 'Resource not found',
                            'errors' => [],
                        ],
                        404
                    );
                }

                // Handle conflict
                if ($exception instanceof \Illuminate\Db\Query\BuilderException) {
                    // Check for duplicate entry errors
                    return new JsonResponse(
                        [
                            'data' => null,
                            'message' => $message,
                            'errors' => [],
                        ],
                        409
                    );
                }

                // Generic error response
                return new JsonResponse(
                    [
                        'data' => null,
                        'message' => $exception instanceof \Throwable ? $message : 'An error occurred',
                        'errors' => [],
                    ],
                    $statusCode ?: 500
                );
            }
        }

        // Fallback for non-JSON requests
        return parent::render($request, $exception);
    }
}