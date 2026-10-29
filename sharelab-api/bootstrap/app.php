<?php

use App\Http\Middleware\EnsureGuest;
use App\Http\Middleware\JwtCookieMiddleware;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // The API runs behind nginx in deployment; trust its forwarded scheme,
        // host and client IP so secure cookies and URLs are detected correctly.
        $middleware->trustProxies(
            at: '*',
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO,
        );

        $middleware->redirectGuestsTo(
            fn (Request $request) => $request->is('api/*') ? null : '/',
        );

        $middleware->alias([
            'jwt.auth' => JwtCookieMiddleware::class,
            'role' => RoleMiddleware::class,
            'guest' => EnsureGuest::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'data' => null,
                    'message' => 'Authentication required.',
                    'errors' => [],
                    'meta' => ['success' => false],
                ], 401);
            }
        });

        $exceptions->render(function (ValidationException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'data' => null,
                    'message' => $exception->getMessage() ?: 'Validation failed.',
                    'errors' => $exception->errors(),
                    'meta' => ['success' => false],
                ], 422);
            }
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'data' => null,
                    'message' => $exception->getMessage() ?: 'Forbidden.',
                    'errors' => [],
                    'meta' => ['success' => false],
                ], 403);
            }
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'data' => null,
                    'message' => 'Not found.',
                    'errors' => [],
                    'meta' => ['success' => false],
                ], 404);
            }
        });

        $exceptions->render(function (HttpResponseException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $exception->getResponse();
            }
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $status = $exception->getStatusCode();

                return response()->json([
                    'data' => null,
                    // Never leak model class names into client-facing errors.
                    'message' => $status === 404
                        ? 'The requested resource was not found.'
                        : ($exception->getMessage() ?: 'The request could not be completed.'),
                    'errors' => [],
                    'meta' => ['success' => false],
                ], $exception->getStatusCode());
            }
        });
    })->create();
