/**
 * Wraps a Supabase query function with error handling.
 * Returns { data, error } — never throws.
 */
export const safeQuery = async (queryFn, fallback = []) => {
  try {
    const { data, error } = await queryFn()
    if (error) {
      console.error('[Supabase]', error.message)
      window.dispatchEvent(new CustomEvent('arete-db-error', { detail: error.message }))
      return { data: fallback, error }
    }
    return { data: data ?? fallback, error: null }
  } catch (err) {
    console.error('[Network]', err)
    window.dispatchEvent(new CustomEvent('arete-db-error', { detail: 'Network error' }))
    return { data: fallback, error: err }
  }
}

/** Convenience: get the current authenticated user ID */
export const getUserId = async () => {
  const { data: { user } } = await import('./supabase').then(m => m.supabase.auth.getUser())
  return user?.id ?? null
}
