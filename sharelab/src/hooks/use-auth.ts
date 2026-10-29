/**
 * Compatibility hook for older local components. New code should import
 * `useAuth` from `./useAuth` (or from the auth feature directly).
 */
export { useAuth } from './useAuth'
export type {
  AuthActionResult,
  AuthStatus,
  LoginPayload,
  RegisterPayload,
} from '../features/auth/AuthProvider'
