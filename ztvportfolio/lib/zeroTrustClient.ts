// Ensures every fetch to protected routes includes Zero-Trust headers

export async function ztFetch(input: RequestInfo | URL, init?: RequestInit) {
  const fingerprint = sessionStorage.getItem("session_fingerprint")
  const signature = sessionStorage.getItem("session_signature")

  const headers = new Headers(init?.headers || {})
  if (fingerprint && signature) {
    headers.set("x-session-fingerprint", fingerprint)
    headers.set("x-signature", signature)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}