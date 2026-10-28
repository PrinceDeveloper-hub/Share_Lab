export const getSafeRedirect = (value: string | undefined, fallback = '/dashboard') => {
  if (!value) return fallback

  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/login') ||
    value.startsWith('/register')
  ) {
    return fallback
  }

  return value
}
