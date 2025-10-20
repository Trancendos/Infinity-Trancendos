# Deployment Guide - Infinity-Trancendos

This guide provides step-by-step instructions for deploying the Infinity-Trancendos mental health support application as a zero-cost live service.

## 🎯 Zero-Cost Deployment Options

### Option 1: Render.com (Recommended)

**Pros:**
- Completely free tier (no credit card required)
- Automatic HTTPS
- Easy GitHub integration
- Health check support
- Automatic deployments on push

**Steps:**

1. **Fork the Repository**
   - Go to https://github.com/Trancendos/Infinity-Trancendos
   - Click "Fork" in the top right

2. **Sign Up for Render**
   - Visit https://render.com
   - Sign up with GitHub (free)

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the forked repository

4. **Configure Service**
   - Render will auto-detect the `render.yaml` configuration
   - Name: `infinity-trancendos` (or your choice)
   - Region: Choose closest to your users
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for initial deployment
   - Your service will be live at: `https://[your-service-name].onrender.com`

6. **Update Health Check URL**
   - After deployment, update `.github/workflows/health-check.yml`
   - Replace the placeholder URL with your Render URL
   - Commit and push the change

**Limitations:**
- Free tier spins down after 15 minutes of inactivity
- Takes ~30 seconds to spin back up on first request
- 750 hours/month of runtime (unlimited if only one service)

### Option 2: Railway.app

**Pros:**
- Free $5 credit per month (enough for small apps)
- No sleep/spin-down
- Simple deployment

**Steps:**

1. Sign up at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js
5. Add environment variable: `PORT=3000`
6. Deploy automatically starts

**Limitations:**
- Requires credit card for verification
- $5/month credit (usually sufficient)

### Option 3: Fly.io

**Pros:**
- Generous free tier
- Global CDN
- No sleep/spin-down

**Steps:**

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. Navigate to your project: `cd Infinity-Trancendos`
4. Initialize: `fly launch`
5. Deploy: `fly deploy`

**Limitations:**
- Requires credit card
- Free tier: 3 shared VMs, 3GB storage

### Option 4: Vercel (Alternative)

**Note:** Vercel is primarily for serverless functions, but can work with Node.js apps.

**Steps:**

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project: `cd Infinity-Trancendos`
3. Deploy: `vercel`
4. Follow prompts

## 📊 Monitoring Setup

### GitHub Actions Health Checks

The repository includes automated health monitoring:

1. Health checks run every 30 minutes
2. If service is down, a GitHub Issue is automatically created
3. Edit `.github/workflows/health-check.yml` to add your deployed URL

### Update Health Check

After deployment, update the health check workflow:

```bash
# Edit .github/workflows/health-check.yml
# Replace the placeholder with your actual URL:
HEALTH_CHECK_URL="https://your-app.onrender.com/health"
```

## 🔧 Environment Variables

Required environment variables for production:

```bash
PORT=3000                    # Port to run on (auto-set by most platforms)
NODE_ENV=production          # Set automatically by hosting platforms
```

## 🚀 Post-Deployment Checklist

- [ ] Service is accessible via public URL
- [ ] Health check endpoint responds: `https://your-url/health`
- [ ] Main page loads: `https://your-url/`
- [ ] API endpoint works: `https://your-url/api/resources`
- [ ] Updated health-check.yml with deployed URL
- [ ] Verified GitHub Actions CI passes
- [ ] Tested service after 15+ minutes (for platforms with sleep)

## 📈 Scaling Considerations

If you need to scale beyond free tier:

1. **Render**: Upgrade to paid plan ($7/month) for no sleep
2. **Railway**: Add payment method for additional credits
3. **Fly.io**: Upgrade resources as needed
4. **Consider**: DigitalOcean App Platform, AWS Free Tier, Azure, GCP

## 🐛 Troubleshooting

### Service won't start
- Check build logs in hosting platform
- Verify `package.json` has correct start script
- Ensure Node.js version is 18+

### Health check fails
- Verify service is running: `curl https://your-url/health`
- Check if platform has spun down (free tier)
- Review server logs

### Can't access from browser
- Check if HTTPS is required (most platforms)
- Verify firewall/network settings
- Test with curl first

## 📞 Support

- GitHub Issues: https://github.com/Trancendos/Infinity-Trancendos/issues
- Platform Support:
  - Render: https://render.com/docs
  - Railway: https://docs.railway.app
  - Fly.io: https://fly.io/docs

---

**Remember**: This is a mental health support application. Ensure high availability and monitor health checks regularly.
