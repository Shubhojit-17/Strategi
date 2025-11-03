# 🔐 Security & Key Management

## API Keys and Secrets

This project uses several API keys and secrets that must be kept secure. **NEVER commit actual keys to Git.**

---

## Environment Variables

### Backend (`agent/.env`)

```bash
# ❌ NEVER COMMIT - Server-side secrets only
DEPLOYER_PRIVATE_KEY=<your-private-key>
PINATA_JWT=<your-pinata-jwt>
OPENAI_API_KEY=<your-openai-key>
MOONSHOT_API_KEY=<your-openrouter-key>
CROSSMINT_SERVER_API_KEY=<your-server-side-key>  # sk_staging_... or sk_production_...

# ✅ Safe to commit - Public addresses
ACCESS_NFT_ADDRESS=0x...
AGENT_REGISTRY_ADDRESS=0x...
PROVENANCE_ADDRESS=0x...
CROSSMINT_PROJECT_ID=<your-project-id>
```

### Frontend (`frontend/.env.local`)

```bash
# ⚠️ CAUTION - These are exposed to browser
NEXT_PUBLIC_CROSSMINT_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_CROSSMINT_CLIENT_KEY=<your-client-key>  # ck_staging_... or ck_production_...
NEXT_PUBLIC_ACCESS_NFT_ADDRESS=0x...
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
```

**Note**: Any variable starting with `NEXT_PUBLIC_` is exposed to the browser. Only use client-side keys here.

---

## Key Types

### 1. **Crossmint Keys** (Two Types)

#### Server-Side Key (Backend Only)
- **Variable**: `CROSSMINT_SERVER_API_KEY`
- **Format**: `sk_staging_...` or `sk_production_...`
- **Location**: `agent/.env` only
- **Purpose**: Backend API calls to Crossmint (wallet creation, minting)
- **Security**: ❌ NEVER expose to frontend or commit to Git

#### Client-Side Key (Frontend Only)
- **Variable**: `NEXT_PUBLIC_CROSSMINT_CLIENT_KEY`
- **Format**: `ck_staging_...` or `ck_production_...`
- **Location**: `frontend/.env.local`
- **Purpose**: Crossmint UI components (login widget, wallet UI)
- **Security**: ⚠️ Exposed to browser - use staging key for development

### 2. **Blockchain Keys**

#### Deployer Private Key
- **Variable**: `DEPLOYER_PRIVATE_KEY`
- **Format**: `0x...` (64 hex chars)
- **Purpose**: Deploy contracts, mint NFTs, pay gas fees
- **Security**: 🔴 CRITICAL - Controls funds on-chain
- **Best Practice**: Use a dedicated deployer wallet with limited funds

### 3. **IPFS Keys**

#### Pinata JWT
- **Variable**: `PINATA_JWT`
- **Format**: `eyJhbGci...` (JWT token)
- **Purpose**: Upload files/JSON to IPFS
- **Security**: ❌ NEVER expose - could incur storage costs

### 4. **AI Provider Keys**

#### OpenAI API Key
- **Variable**: `OPENAI_API_KEY`
- **Format**: `sk-proj-...`
- **Purpose**: GPT model access
- **Security**: ❌ NEVER expose - costs money per API call

#### OpenRouter API Key (for Moonshot AI)
- **Variable**: `MOONSHOT_API_KEY`
- **Format**: `sk-or-v1-...`
- **Purpose**: Access Moonshot/Kimi models via OpenRouter
- **Security**: ❌ NEVER expose - costs money per API call

---

## Security Best Practices

### ✅ DO

1. **Use `.env` files** for all secrets
2. **Add `.env` to `.gitignore`** (already done)
3. **Use `.env.example`** with placeholder values for documentation
4. **Rotate keys regularly** (monthly for production)
5. **Use staging keys** for development/testing
6. **Use production keys** only in production environment
7. **Limit wallet funds** (deployer wallet should only have what's needed)
8. **Use environment-specific keys** (dev vs staging vs production)

### ❌ DON'T

1. **Never commit `.env` files** to Git
2. **Never expose server keys** in frontend code
3. **Never share keys** in Slack, Discord, or public channels
4. **Never use production keys** in development
5. **Never log full API keys** (only log last 4 chars if needed)
6. **Never hardcode keys** in source code
7. **Never commit keys** to markdown documentation

---

## Key Rotation Checklist

When rotating keys (recommended quarterly):

- [ ] Generate new keys from provider dashboard
- [ ] Update `.env` files with new keys
- [ ] Restart backend server: `uvicorn app.main:app --reload`
- [ ] Rebuild frontend: `npm run build`
- [ ] Test all integrations (IPFS upload, AI execution, Crossmint wallet)
- [ ] Deactivate old keys in provider dashboards
- [ ] Update production deployment
- [ ] Document rotation date in team notes

---

## Environment-Specific Configuration

### Development
```bash
CROSSMINT_SERVER_API_KEY=sk_staging_...
NEXT_PUBLIC_CROSSMINT_CLIENT_KEY=ck_staging_...
```

### Staging
```bash
CROSSMINT_SERVER_API_KEY=sk_staging_...
NEXT_PUBLIC_CROSSMINT_CLIENT_KEY=ck_staging_...
```

### Production
```bash
CROSSMINT_SERVER_API_KEY=sk_production_...
NEXT_PUBLIC_CROSSMINT_CLIENT_KEY=ck_production_...
```

---

## Crossmint Key Architecture

### Why Two Keys?

Crossmint uses a **client-server architecture** for security:

```
┌─────────────────────────────────────────────┐
│  Frontend (Browser)                         │
│  - Uses CLIENT key (ck_...)               │
│  - Shows Crossmint UI widgets              │
│  - User login/authentication               │
│  - NO minting operations                   │
└──────────────┬──────────────────────────────┘
               │
               ▼ (API calls)
┌─────────────────────────────────────────────┐
│  Backend (Server)                           │
│  - Uses SERVER key (sk_...)               │
│  - Creates wallets via API                 │
│  - Mints NFTs to Crossmint wallets        │
│  - Handles gas payments                    │
└─────────────────────────────────────────────┘
```

**Flow**:
1. User logs in with email (frontend uses `ck_...`)
2. Frontend calls backend `/crossmint/wallet` API
3. Backend uses `sk_...` to create wallet via Crossmint API
4. Backend returns wallet address to frontend
5. Backend mints NFT using deployer key
6. Backend sends NFT to Crossmint wallet address

**Security**: Server key never touches the browser, preventing abuse.

---

## Git Security

### `.gitignore` (Already Configured)

```
# Environment files
.env
.env.local
.env.*.local

# Private keys
*.pem
*.key
*_private_key*

# Secrets
secrets/
*.secret
```

### Accidental Commit Recovery

If you accidentally commit a secret:

1. **Immediately rotate the key** (generate new one)
2. **Remove from Git history**:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch agent/.env" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
3. **Update all environments** with new keys
4. **Deactivate compromised keys** in provider dashboards

---

## Testing with Keys

### Contract Tests (Hardhat)
```javascript
// Uses DEPLOYER_PRIVATE_KEY from .env
// Tests run on live Somnia network
// Ensure test wallet has sufficient funds
```

### Backend Tests (pytest)
```python
# Uses all keys from agent/.env
# Tests interact with live services
# Ensure all API keys are valid
```

### Environment Check Script
```bash
cd agent
.\venv\Scripts\activate
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

keys = {
    'DEPLOYER_PRIVATE_KEY': os.getenv('DEPLOYER_PRIVATE_KEY'),
    'PINATA_JWT': os.getenv('PINATA_JWT'),
    'MOONSHOT_API_KEY': os.getenv('MOONSHOT_API_KEY'),
    'CROSSMINT_SERVER_API_KEY': os.getenv('CROSSMINT_SERVER_API_KEY')
}

for name, value in keys.items():
    if value:
        print(f'✅ {name}: {value[:10]}...{value[-4:]}')
    else:
        print(f'❌ {name}: NOT SET')
"
```

---

## Audit Log

All API calls with keys are logged (without exposing the keys):

```json
{
  "timestamp": "2025-11-01T12:00:00Z",
  "action": "ipfs_upload",
  "service": "pinata",
  "key_used": "****...Dy8",  // Only last 4 chars
  "success": true
}
```

Check logs: `agent/logs/audit.log`

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All `.env` files use production keys
- [ ] Server key is `sk_production_...`
- [ ] Client key is `ck_production_...`
- [ ] All staging keys removed
- [ ] `.env` files NOT committed to Git
- [ ] Environment variables set in hosting platform (Vercel, Railway, etc.)
- [ ] Test all integrations with production keys
- [ ] Set up monitoring for API usage
- [ ] Document all keys in team password manager (1Password, LastPass, etc.)

---

## Support

If keys are compromised:
1. **Immediately rotate all keys**
2. **Check API usage logs** for unauthorized access
3. **Contact providers**: Crossmint, Pinata, OpenRouter support
4. **Review Git history** for exposed secrets
5. **Update security documentation**

---

**Last Updated**: November 1, 2025  
**Next Key Rotation**: February 1, 2026
