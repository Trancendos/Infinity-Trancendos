# Infinity-Trancendos

Mental Health and Wellbeing Support - A continuously available live service providing mental health resources and support.

## 🌟 Features

- 24/7 availability with health monitoring
- Mental health resources and crisis helpline information
- Simple, accessible user interface
- RESTful API for resources
- Automated health checks and monitoring

## 🚀 Live Service

The application is deployed as a live service with:
- **Zero-cost hosting** on Render.com free tier
- **Automated health checks** every 30 minutes
- **CI/CD pipeline** via GitHub Actions
- **99.9% uptime target** with automatic monitoring

## 📋 Health Check

The service exposes a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T01:26:09.428Z",
  "uptime": 12345
}
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Trancendos/Infinity-Trancendos.git
cd Infinity-Trancendos
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## 🚢 Deployment

### Deploy to Render.com (Free Tier)

1. Fork this repository
2. Sign up for a free account at [Render.com](https://render.com)
3. Create a new Web Service
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` configuration
6. Click "Create Web Service"
7. Your service will be live at `https://your-service-name.onrender.com`

### Deploy to Other Platforms

The application can be deployed to any platform that supports Node.js:

- **Railway**: Connect GitHub repo, auto-deploys
- **Fly.io**: `fly launch` and `fly deploy` (requires Fly CLI)
- **Vercel**: Import from GitHub
- **Heroku**: Free tier ended, but can use eco dynos

## 📊 Monitoring

- GitHub Actions runs automated health checks every 30 minutes
- Alerts are created as GitHub Issues if the service goes down
- Service uptime and performance metrics available via hosting platform

## 🔧 Configuration

Environment variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/development)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 📚 Additional Resources

- [QUICKSTART.md](QUICKSTART.md) - Get started in 60 seconds
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions

## 🆘 Crisis Support

If you're experiencing a mental health emergency:
- **US**: Call 988 (Suicide & Crisis Lifeline)
- **International**: Visit [findahelpline.com](https://findahelpline.com)
- **Emergency**: Call 911 or go to your nearest emergency room

---

**Note**: This is a support resource application. For immediate crisis intervention, always contact emergency services or crisis helplines directly.
