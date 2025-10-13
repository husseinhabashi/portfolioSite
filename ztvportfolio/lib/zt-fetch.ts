export async function ztFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  // Grab persisted Zero-Trust credentials
  const fingerprint =
    typeof window !== "undefined"
      ? sessionStorage.getItem("session_fingerprint") ||
        localStorage.getItem("headers:x-session-fingerprint")
      : null

  const signature =
    typeof window !== "undefined"
      ? sessionStorage.getItem("session_signature") ||
        localStorage.getItem("headers:x-signature")
      : null

  const headers = new Headers(init.headers || {})

  // Inject Zero-Trust headers automatically
  if (fingerprint) headers.set("x-session-fingerprint", fingerprint)
  if (signature) headers.set("x-signature", signature)

  // Perform fetch with modified headers
  const res = await fetch(input, {
    ...init,
    headers,
  })

  // Optional: auto-redirect if unauthorized
  if (res.status === 401 || res.status === 403) {
    console.warn("[ZT] Unauthorized → redirecting to /invite")
    if (typeof window !== "undefined") window.location.href = "/invite"
  }

  return res
}