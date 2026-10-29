<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Auth\JwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withCredentials();
    }

    private function makeUser(array $attributes = []): User
    {
        return User::query()->create(array_merge([
            'name' => 'Test User',
            'email' => 'test'.uniqid().'@sharelab.test',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ], $attributes));
    }

    private function login(User $user)
    {
        return $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);
    }

    private function accessTokenFrom($response): string
    {
        $cookie = $response->getCookie('sharelab_access', false);

        $this->assertNotNull($cookie, 'The access cookie was not set.');

        return $cookie->getValue();
    }

    private function refreshTokenFrom($response): string
    {
        $cookie = $response->getCookie('sharelab_refresh', false);

        $this->assertNotNull($cookie, 'The refresh cookie was not set.');

        return $cookie->getValue();
    }

    /**
     * The test client reuses the application between requests, so drop cached
     * guards and let the guard resolve the current request.
     */
    private function useCookie(string $name, string $value): static
    {
        $this->app['auth']->forgetGuards();

        return $this->withUnencryptedCookie($name, $value);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $user = $this->makeUser();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'not-the-password',
        ])
            ->assertStatus(401)
            ->assertJsonPath('data', null)
            ->assertCookieMissing('sharelab_access')
            ->assertCookieMissing('sharelab_refresh');
    }

    public function test_login_issues_http_only_cookies_and_authenticates_me(): void
    {
        $user = $this->makeUser();

        $response = $this->login($user)
            ->assertOk()
            ->assertJsonPath('data.user.email', $user->email)
            ->assertCookieNotExpired('sharelab_access')
            ->assertCookieNotExpired('sharelab_refresh');

        $access = $response->getCookie('sharelab_access', false);
        $refresh = $response->getCookie('sharelab_refresh', false);

        $this->assertTrue($access->isHttpOnly());
        $this->assertSame('/', $access->getPath());
        $this->assertTrue($refresh->isHttpOnly());
        $this->assertSame('/api', $refresh->getPath());

        $this->useCookie('sharelab_access', $access->getValue())
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_register_creates_a_user_and_starts_a_session(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New Member',
            'email' => 'new-member@sharelab.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertCreated()
            ->assertJsonPath('data.user.email', 'new-member@sharelab.test')
            ->assertJsonPath('data.user.role', 'user')
            ->assertCookieNotExpired('sharelab_access')
            ->assertCookieNotExpired('sharelab_refresh');

        $this->assertDatabaseHas('users', [
            'email' => 'new-member@sharelab.test',
            'role' => 'user',
        ]);

        $this->useCookie('sharelab_access', $this->accessTokenFrom($response))
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.name', 'New Member');
    }

    public function test_register_validates_duplicate_email_and_weak_password(): void
    {
        $this->makeUser(['email' => 'taken@sharelab.test']);

        $this->postJson('/api/register', [
            'name' => 'Second Member',
            'email' => 'taken@sharelab.test',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_guest_middleware_blocks_authenticated_requests(): void
    {
        $user = $this->makeUser();
        $access = $this->accessTokenFrom($this->login($user));

        $this->useCookie('sharelab_access', $access)
            ->postJson('/api/login', [
                'email' => $user->email,
                'password' => 'password123',
            ])
            ->assertStatus(409)
            ->assertJsonPath('message', 'You are already signed in.')
            ->assertJsonPath('data.user.email', $user->email);
    }

    public function test_refresh_rotates_the_access_token_from_the_refresh_cookie(): void
    {
        $user = $this->makeUser();
        $login = $this->login($user);
        $originalAccess = $this->accessTokenFrom($login);
        $refresh = $this->refreshTokenFrom($login);

        $response = $this->useCookie('sharelab_refresh', $refresh)
            ->postJson('/api/refresh')
            ->assertOk()
            ->assertJsonPath('data.user.email', $user->email)
            ->assertCookieNotExpired('sharelab_access')
            ->assertCookieNotExpired('sharelab_refresh');

        $newAccess = $this->accessTokenFrom($response);
        $newRefresh = $this->refreshTokenFrom($response);

        $this->assertNotSame($originalAccess, $newAccess);
        $this->assertNotSame($refresh, $newRefresh);

        $this->useCookie('sharelab_access', $newAccess)
            ->getJson('/api/me')
            ->assertOk();
    }

    public function test_refresh_rejects_access_tokens_and_missing_refresh_cookies(): void
    {
        $user = $this->makeUser();
        $response = $this->login($user);
        $access = $this->accessTokenFrom($response);

        $this->useCookie('sharelab_refresh', $access)
            ->postJson('/api/refresh')
            ->assertStatus(401)
            ->assertCookieExpired('sharelab_access')
            ->assertCookieExpired('sharelab_refresh');

        $this->postJson('/api/refresh')
            ->assertStatus(401);
    }

    public function test_logout_clears_cookies_and_protected_routes_stay_protected(): void
    {
        $user = $this->makeUser();
        $access = $this->accessTokenFrom($this->login($user));

        $this->useCookie('sharelab_access', $access)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertCookieExpired('sharelab_access')
            ->assertCookieExpired('sharelab_refresh');

        $this->useCookie('sharelab_access', '')
            ->getJson('/api/me')
            ->assertStatus(401);
    }

    public function test_logout_clears_cookies_even_without_an_access_token(): void
    {
        $this->postJson('/api/logout')
            ->assertOk()
            ->assertCookieExpired('sharelab_access')
            ->assertCookieExpired('sharelab_refresh');
    }

    public function test_cookie_guard_rejects_tampered_or_refresh_tokens(): void
    {
        $user = $this->makeUser();
        $response = $this->login($user);
        $refresh = $this->refreshTokenFrom($response);

        $this->useCookie('sharelab_access', $refresh)
            ->getJson('/api/me')
            ->assertStatus(401);

        $this->useCookie('sharelab_access', 'not.a.jwt')
            ->getJson('/api/me')
            ->assertStatus(401);
    }

    public function test_jwt_service_signs_and_verifies_only_access_tokens_for_the_guard(): void
    {
        $user = $this->makeUser();
        $jwt = app(JwtService::class);

        $access = $jwt->issueAccessToken($user);
        $refresh = $jwt->issueRefreshToken($user);

        $this->assertSame('access', $jwt->decode($access)['token_type']);
        $this->assertSame('refresh', $jwt->decode($refresh)['token_type']);
        $this->assertSame((string) $user->id, $jwt->decode($access)['sub']);
    }
}
