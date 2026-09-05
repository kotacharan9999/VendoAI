# Vendo AI — Vercel Frontend Deployment

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Backend deployed and accessible via HTTPS

## Configuration

### Environment Variables (Vercel Dashboard)
| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.vendo-ai.com` | Backend API base URL |

### Build Settings
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://vendo-ai-backend.onrender.com"
  }
}
```

## Deployment Steps

### 1. Connect Repository
```bash
# In Vercel dashboard:
# 1. Import Git Repository
# 2. Select vendo-ai repo
# 3. Set Root Directory: apps/web
# 4. Configure Environment Variables
# 5. Deploy
```

### 2. Environment Variables
Add in Vercel Project Settings → Environment Variables:
- `NEXT_PUBLIC_API_URL` = your backend production URL (e.g., `https://vendo-ai.onrender.com`)

### 3. Custom Domain (Optional)
- Add `app.vendo-ai.com` in Domains tab
- Configure DNS: CNAME → `cname.vercel-dns.com`

### 4. Production Checklist
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] No `localhost` URLs in code
- [ ] No secrets in frontend code
- [ ] `next.config.js` has proper `images.remotePatterns` for product images
- [ ] Build passes locally: `npm run build`

---

## Post-Deployment

### Verify Health
```bash
curl https://app.vendo-ai.com/api/health  # (if you add API routes)
# Frontend health: just load the dashboard
```

### Monitor
- Vercel Analytics (enabled by default)
- Function logs for any SSR pages
- Build logs for each deployment

### Rollback
```bash
# Vercel CLI
vercel rollback <deployment-url>

# Or via dashboard: Deployments → ⋮ → Rollback
```

---

## Performance Optimization

### Caching
- Static pages (dashboard, inventory, products) cached at edge
- API calls use `TanStack Query` with 5-minute stale time
- Images served from object storage with CDN

### Image Configuration
```javascript
// next.config.js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: '*.s3.amazonaws.com' },
    { protocol: 'https', hostname: 'your-cdn.cloudfront.net' }
  ]
}
```

### Bundle Analysis
```bash
npm run build
# Check .next/analyze/client.html
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails on `next lint` | Run `npm run lint` locally first |
| API calls fail (CORS) | Backend `CORS_ORIGINS` must include Vercel domain |
| Images don't load | `next.config.js` `remotePatterns` missing hostname |
| Environment variables not working | Must be `NEXT_PUBLIC_*` prefix; redeploy after adding |
| Slow initial load | Enable `output: 'standalone'` in `next.config.js` |