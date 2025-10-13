import ZeroTrustGuard from "@/components/zeroTrustGuard"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ZeroTrustGuard>{children}</ZeroTrustGuard>
}