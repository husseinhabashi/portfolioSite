import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Lock, Fingerprint, Eye, Key, Database, AlertTriangle } from "lucide-react"
import { SessionFingerprintDisplay } from "@/components/session-fingerprint-display"
import { SessionWatermark } from "@/components/session-watermark"
import { TrackingPixel } from "@/components/tracking-pixel"
import { SecurityControls } from "@/components/security-controls"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <SecurityControls />
      <SessionWatermark />
      <TrackingPixel />

      {/* Header */}
      <header className="border-b border-green-800">
  <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
    {/* Back Button */}
    <Link href="/" className="w-full sm:w-auto">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 w-full sm:w-auto justify-center sm:justify-start text-green-400 hover:text-black hover:bg-green-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
    </Link>

    {/* Title */}
    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
      <Shield className="h-6 w-6 text-green-400 shrink-0" />
      <span className="font-bold text-lg sm:text-xl text-center sm:text-right">
        Admin Authentication
      </span>
    </div>
  </div>
</header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Introduction */}
        <section className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold">Cryptographic Security Design</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            This portfolio demonstrates enterprise-grade security engineering through multiple layers of cryptographic
            protection, session management, and leak detection. Every aspect is designed to be auditable, traceable, and
            secure by default.
          </p>
        </section>

        {/* Architecture Sections */}
        <div className="space-y-8">
          {/* Invite System */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>1. Cryptographic Invite System</CardTitle>
              </div>
              <CardDescription>SHA-256 hashing with ECDSA digital signatures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How It Works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Server generates invite hash:{" "}
                    <code className="font-mono bg-muted px-1">SHA-256(email + timestamp + nonce)</code>
                  </li>
                  <li>Invite hash is signed with server's private key using ECDSA (secp256k1 curve)</li>
                  <li>User receives invite hash and signature</li>
                  <li>On access, server verifies signature using public key before granting entry</li>
                </ol>
              </div>
              <div className="bg-muted p-4 rounded-lg font-mono text-xs">
                <div>Algorithm: ECDSA with SHA-256</div>
                <div>Curve: secp256k1</div>
                <div>Hash: SHA-256 (64-character hex)</div>
              </div>
            </CardContent>
          </Card>

          {/* Session Fingerprinting */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Fingerprint className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>2. Session Fingerprinting</CardTitle>
              </div>
              <CardDescription>Unique cryptographic session identifiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Fingerprint Generation:</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Each session creates a unique SHA-256 fingerprint combining multiple factors:
                </p>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs">
                  fingerprint = SHA-256(IP + User-Agent + Invite-Hash + Timestamp)
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Purpose:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Uniquely identify each session for audit trails</li>
                  <li>Enable leak tracking by tying assets to specific sessions</li>
                  <li>Detect session hijacking attempts</li>
                  <li>Provide transparency (visible in footer and console)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* IP Binding */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>3. IP Binding</CardTitle>
              </div>
              <CardDescription>Hardware-level access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Implementation:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>On first use of an invite, the client's IP address is recorded</li>
                  <li>
                    IP binding hash is created:{" "}
                    <code className="font-mono bg-muted px-1">SHA-256(invite-hash + IP)</code>
                  </li>
                  <li>All subsequent requests must originate from the same IP</li>
                  <li>Requests from different IPs are automatically denied with audit logging</li>
                </ol>
              </div>
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">
                  IP binding prevents invite sharing. Once bound, the invite cannot be used from any other location.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>4. Admin Signature Authentication</CardTitle>
              </div>
              <CardDescription>Zero-password challenge-response system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Challenge-Response Flow:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Admin requests access and receives a random nonce (challenge)</li>
                  <li>Admin signs the nonce with their private key offline</li>
                  <li>Admin submits signature and public key to server</li>
                  <li>Server verifies signature matches the challenge using the public key</li>
                  <li>Server checks if public key is authorized in database or environment</li>
                  <li>If valid, admin session is created (2-hour expiry)</li>
                </ol>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="font-semibold text-sm">Security Benefits:</div>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li>No passwords to steal or crack</li>
                  <li>Private key never transmitted</li>
                  <li>Challenge expires in 5 minutes</li>
                  <li>Each authentication uses unique nonce</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Watermarking & Leak Tracking */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>5. Watermarking & Leak Tracking</CardTitle>
              </div>
              <CardDescription>Canary tokens and forensic tracing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Multi-Layer Tracking:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>Visual Watermarks:</strong> Semi-transparent session ID and timestamp overlay on every page
                  </li>
                  <li>
                    <strong>Tracking Pixels:</strong> 1x1 invisible images with unique signatures on each page load
                  </li>
                  <li>
                    <strong>Asset Signatures:</strong> All URLs include session-specific canary tokens
                  </li>
                  <li>
                    <strong>Database Logging:</strong> Every asset access is logged with IP, user-agent, and timestamp
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Leak Detection:</h4>
                <p className="text-sm text-muted-foreground">
                  If content is leaked (screenshot, shared link, etc.), the watermark or signature can be traced back to
                  the exact session, invite, and user who accessed it. All tracking data is available in the admin
                  panel.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logging */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>6. Comprehensive Audit Logging</CardTitle>
              </div>
              <CardDescription>Full security event tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Logged Events:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted p-2 rounded">Invite verification attempts</div>
                  <div className="bg-muted p-2 rounded">Session creation/resumption</div>
                  <div className="bg-muted p-2 rounded">IP binding creation</div>
                  <div className="bg-muted p-2 rounded">IP mismatch violations</div>
                  <div className="bg-muted p-2 rounded">Admin authentication</div>
                  <div className="bg-muted p-2 rounded">Asset access tracking</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                All logs include timestamp, IP address, user-agent, and contextual details. Logs are immutable and
                stored in PostgreSQL for forensic analysis.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technical Stack */}
        <section className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-bold text-lg mb-4">Technical Stack</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2">Frontend:</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Next.js 15 (App Router)</li>
                <li>TypeScript</li>
                <li>React Server Components</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Backend:</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Next.js API Routes</li>
                <li>Node.js Crypto Module</li>
                <li>PostgreSQL (Neon)</li>
                <li>Edge Runtime Compatible</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Cryptography:</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>ECDSA (secp256k1)</li>
                <li>SHA-256 Hashing</li>
                <li>Cryptographically Secure RNG</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Deployment:</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Docker Compose</li>
                <li>GitHub Codespaces Ready</li>
                <li>Environment Variables</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Security Architecture Documentation</p>
            <SessionFingerprintDisplay />
          </div>
        </div>
      </footer>
    </div>
  )
}
