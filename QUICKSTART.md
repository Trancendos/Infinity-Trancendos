# Quick Start Guide - Infinity-Trancendos

## 🚀 Get Running in 60 Seconds

```bash
# Clone the repository
git clone https://github.com/Trancendos/Infinity-Trancendos.git
cd Infinity-Trancendos

# Install dependencies
npm install

# Start the server
npm start

# Open in browser
# Visit: http://localhost:3000
```

## 🌐 Deploy for Free (5 Minutes)

### Render.com (No Credit Card)

1. Fork this repo on GitHub
2. Sign up at [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Click "Create Web Service"
6. Done! Your app is live at `https://[your-name].onrender.com`

## 🔍 Key Endpoints

- **Main App**: `http://localhost:3000/`
- **Health Check**: `http://localhost:3000/health`
- **Resources API**: `http://localhost:3000/api/resources`

## 📁 Project Structure

```
Infinity-Trancendos/
├── src/
│   └── web/
│       ├── server.js          # Express server
│       └── public/
│           └── index.html     # Web UI
├── .github/
│   └── workflows/
│       ├── ci.yml             # CI pipeline
│       └── health-check.yml   # Health monitoring
├── package.json               # Dependencies
├── render.yaml                # Render.com config
└── README.md                  # Full documentation
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Test health endpoint
curl http://localhost:3000/health

# Test API endpoint
curl http://localhost:3000/api/resources
```

## 🧪 Testing

The CI pipeline automatically tests:
- ✅ Server starts successfully
- ✅ Health check endpoint responds
- ✅ Runs on Node.js 18.x and 20.x

## 📊 Monitoring

- Health checks run every 30 minutes via GitHub Actions
- Automatic issue creation if service is down
- View workflow runs in the Actions tab

## 🆘 Crisis Resources

**If you or someone you know is in crisis:**
- **US**: Call 988 (Suicide & Crisis Lifeline)
- **International**: [findahelpline.com](https://findahelpline.com)
- **Emergency**: Call 911

## 📚 More Information

- [Full README](README.md) - Complete documentation
- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [GitHub Issues](https://github.com/Trancendos/Infinity-Trancendos/issues) - Report issues

---

**Built with**: Node.js, Express, HTML/CSS/JavaScript
**License**: MIT
