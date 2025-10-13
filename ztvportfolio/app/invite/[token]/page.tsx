import { notFound } from "next/navigation"

export default async function InviteTokenPage({ params }: { params: { token: string } }) {
  const token = params.token

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/invite/token/${token}`, {
    cache: "no-store",
  })

  if (!res.ok) return notFound()
  const data = await res.json()

  // If already used or invalid
  if (!data.success || data.invite.used)
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-500">
        <p>⚠️ This invite link has expired or already been used.</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-green-400 font-mono space-y-4 p-6">
      <h1 className="text-2xl mb-4">🎟️ Zero Trust Vault — Invite Details</h1>

      <div className="border border-green-500 p-4 rounded-md bg-black/60">
        <p><strong>Email:</strong> {data.invite.email}</p>
        <p><strong>Invite Hash:</strong> {data.invite.invite_hash}</p>
        <p><strong>Signature:</strong> {data.invite.signature}</p>
        <p><strong>Expires:</strong> {data.invite.expires_at ?? "Never"}</p>
      </div>

      <p className="text-sm text-green-500/80 mt-6 max-w-md text-center">
        Copy these details securely — this page will self-destruct after first access.
      </p>
    </div>
  )
}