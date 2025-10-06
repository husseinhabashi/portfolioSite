import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Fingerprint, Eye, Terminal, Database } from "lucide-react"
import { SessionFingerprintDisplay } from "@/components/session-fingerprint-display"
import { SessionWatermark } from "@/components/session-watermark"
import { TrackingPixel } from "@/components/tracking-pixel"
import { SecurityControls } from "@/components/security-controls"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SecurityControls />

      {/* Session watermark overlay */}
      <SessionWatermark />

      {/* Tracking pixel for leak detection */}
      <TrackingPixel />

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Secure Portfolio</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/security">
              <Button variant="ghost" size="sm">
                Security
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="gap-2">
            <Lock className="h-3 w-3" />
            Cryptographically Secured Access
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance">Advanced Cybersecurity Engineering Portfolio</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            This invite-only portal demonstrates enterprise-grade security engineering through cryptographic
            authentication, session fingerprinting, IP binding, and advanced leak tracking.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Link href="/security">
              <Button size="lg" className="gap-2">
                <Eye className="h-4 w-4" />
                View Security Architecture
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Security Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Cryptographic Invites</CardTitle>
                <CardDescription>SHA-256 hashing with ECDSA digital signatures</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Each invite is cryptographically signed with the server's private key. Access requires valid signature
                verification using public key cryptography.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Fingerprint className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Session Fingerprinting</CardTitle>
                <CardDescription>Unique cryptographic session identifiers</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Every session generates a SHA-256 fingerprint from IP, user-agent, invite hash, and timestamp. All
                sessions are logged and auditable.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>IP Binding</CardTitle>
                <CardDescription>Hardware-level access control</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Invites are permanently bound to the first IP address used. Subsequent access from different IPs is
                automatically denied.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Leak Tracking</CardTitle>
                <CardDescription>Canary tokens and watermarking</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                All assets include unique signatures. Tracking pixels and watermarks enable tracing leaked content back
                to the original session.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Terminal className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Signature-Based Admin</CardTitle>
                <CardDescription>Zero-password authentication</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Admin access uses challenge-response with ECDSA signatures. No passwords, only cryptographic proof of
                key ownership.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Comprehensive Auditing</CardTitle>
                <CardDescription>Full security event logging</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Every access attempt, authentication event, and security violation is logged with full context for
                forensic analysis.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Technical Implementation</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">Next.js</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">PostgreSQL</Badge>
            <Badge variant="secondary">Node.js Crypto</Badge>
            <Badge variant="secondary">ECDSA</Badge>
            <Badge variant="secondary">SHA-256</Badge>
            <Badge variant="secondary">Docker</Badge>
            <Badge variant="secondary">Neon Database</Badge>
          </div>
        </div>
      </section>

      {/* Footer with session fingerprint */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Secure Portfolio - Demonstrating Advanced Cybersecurity Engineering
            </p>
            <SessionFingerprintDisplay />
          </div>
        </div>
      </footer>
    </div>
  )
}
