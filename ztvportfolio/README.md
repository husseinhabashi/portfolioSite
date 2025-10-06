# Secure Portfolio - Advanced Cybersecurity Engineering Demo

A full-stack personal portfolio website demonstrating enterprise-grade security engineering with cryptographic authentication, session fingerprinting, IP binding, and advanced leak tracking.

## 🔐 Security Features

- **Cryptographic Invite System**: SHA-256 hashing with ECDSA digital signatures
- **Session Fingerprinting**: Unique cryptographic identifiers for every session
- **IP Binding**: Hardware-level access control preventing invite sharing
- **Signature-Based Admin**: Zero-password authentication using challenge-response
- **Watermarking**: Visual and embedded session identifiers on all content
- **Leak Tracking**: Canary tokens and tracking pixels for forensic analysis
- **DevTools Detection**: Client-side security monitoring and event logging
- **Comprehensive Auditing**: Full security event logging in PostgreSQL

## 🚀 Quick Start

### Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 2: Generate Cryptographic Keys
\`\`\`bash
npm run setup:keys
\`\`\`
This creates `.env.local` with server and admin keys, plus `admin-private-key.pem`.

### Step 3: Start Development Server
\`\`\`bash
npm run dev
\`\`\`
The app will be available at `http://localhost:3000`

### Step 4: Generate an Invite
\`\`\`bash
npm run setup:invite user@example.com
\`\`\`
Copy the invite hash and signature to access the portal at `/invite`.

## 🔑 Generating Invites

To grant access to a user:

\`\`\`bash
npm run setup:invite user@example.com
\`\`\`

This outputs:
- Invite Hash (SHA-256)
- Digital Signature (ECDSA)

Share both with the user to access the portal.

## 👤 Admin Access

### Step 1: Get Admin Challenge
1. Navigate to `/admin`
2. Copy the challenge nonce displayed

### Step 2: Sign the Challenge
\`\`\`bash
npm run setup:sign <challenge-nonce>
\`\`\`

### Step 3: Submit Credentials
Paste the signature and your public key into the admin form.

**Note**: Your admin private key is in `admin-private-key.pem` (generated during setup).

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js Crypto
- **Database**: PostgreSQL (Neon)
- **Cryptography**: ECDSA (secp256k1), SHA-256
- **Deployment**: Vercel, Docker

### Database Schema
- `invites`: Cryptographically signed invite keys
- `sessions`: Session fingerprints and metadata
- `ip_bindings`: IP address bindings per invite
- `audit_logs`: Security event logging
- `leak_tracking`: Asset access tracking
- `admin_keys`: Authorized admin public keys

### Security Flow

1. **Invite Generation**
   \`\`\`
   hash = SHA-256(email + timestamp + nonce)
   signature = ECDSA_sign(hash, server_private_key)
   \`\`\`

2. **Access Verification**
   \`\`\`
   verify(signature, hash, server_public_key)
   → create session fingerprint
   → bind to IP address
   \`\`\`

3. **Session Tracking**
   \`\`\`
   fingerprint = SHA-256(IP + UA + invite + timestamp)
   → log all access
   → embed watermarks
   → track with canary tokens
   \`\`\`

## 📁 Project Structure

\`\`\`
secure-portfolio/
├── app/
│   ├── api/              # API routes
│   │   ├── admin/        # Admin endpoints
│   │   ├── invites/      # Invite management
│   │   ├── session/      # Session management
│   │   ├── security/     # Security logging
│   │   └── track/        # Leak tracking
│   ├── admin/            # Admin panel
│   ├── invite/           # Invite entry page
│   ├── security/         # Security docs
│   └── page.tsx          # Homepage
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── security-controls.tsx
│   ├── session-fingerprint-display.tsx
│   ├── session-watermark.tsx
│   └── tracking-pixel.tsx
├── lib/
│   ├── crypto.ts         # Cryptographic utilities
│   ├── db.ts             # Database operations
│   └── env.ts            # Environment config
├── scripts/
│   ├── 001_initial_schema.sql
│   ├── generate-keys.ts
│   ├── generate-invite.ts
│   └── sign-admin-challenge.ts
└── package.json
\`\`\`

## 🔒 Security Considerations

### What This Demonstrates
- Cryptographic authentication without passwords
- Session management with fingerprinting
- IP-based access control
- Forensic leak tracking
- Comprehensive audit logging

### Production Recommendations
- Use HSM or KMS for key storage
- Implement rate limiting
- Add CAPTCHA for invite verification
- Use Redis for session storage
- Enable HTTPS with TLS 1.3
- Implement CSP headers
- Add DDoS protection
- Regular security audits

## 🧪 Testing

### Test Invite Flow
1. Generate invite: `npm run setup:invite test@example.com`
2. Navigate to `/invite`
3. Enter credentials
4. Verify session creation in admin panel

### Test Admin Access
1. Navigate to `/admin`
2. Copy challenge nonce
3. Sign with: `npm run setup:sign <nonce>`
4. Submit signature and public key

### Test Leak Tracking
1. Access any page with valid session
2. Check browser console for tracking pixel logs
3. View leak tracking data in admin panel

## 📝 Environment Variables

Required variables (auto-generated by `npm run setup:keys`):

\`\`\`env
DATABASE_URL=postgresql://...
SERVER_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
SERVER_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
ADMIN_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
INVITE_SECRET=random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## 🐳 Docker Deployment (Optional)

### Using Docker Compose
\`\`\`bash
docker-compose up -d
\`\`\`

### GitHub Codespaces
1. Click "Code" → "Codespaces" → "Create codespace on main"
2. Run `npm run setup:keys`
3. Run `npm run dev`

## 🤝 Contributing

This is a demonstration project showcasing security engineering skills. Feel free to fork and adapt for your own portfolio.

## 📄 License

MIT License - See LICENSE file for details

## 🎯 Purpose

This project demonstrates advanced cybersecurity engineering skills for potential recruiters and employers. Every security feature is implemented with production-grade cryptography and best practices.

**Key Takeaways:**
- Deep understanding of cryptographic primitives
- Practical application of ECDSA and SHA-256
- Session management and fingerprinting
- Forensic tracking and audit logging
- Full-stack security implementation

## 🛠️ Troubleshooting

### "Cannot find module" errors
Make sure you've run `npm install` to install all dependencies including `tsx`.

### Database connection errors
Ensure your `DATABASE_URL` in `.env.local` is correct. The Neon integration should provide this automatically.

### Script execution errors
Use the npm scripts instead of running files directly:
- ✅ `npm run setup:keys`
- ❌ `npx ts-node scripts/generate-keys.ts`
