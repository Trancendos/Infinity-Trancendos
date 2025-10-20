# Troubleshooting Guide - Infinity-Trancendos

This guide helps you diagnose and fix common issues when deploying or running Infinity-Trancendos.

## 🔍 Quick Diagnostics

Run the automated verification script:
```bash
./verify-setup.sh
```

This will check:
- Node.js version
- Dependencies installation
- File structure
- Server startup
- All endpoints

## Common Issues

### 1. Port Already in Use

**Error:** `EADDRINUSE: address already in use 0.0.0.0:3000`

**Solution:**
```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process
pkill -f "node src/web/server.js"

# Or kill by PID
kill <PID>
```

### 2. Dependencies Not Installed

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
npm install
```

### 3. Node Version Too Old

**Error:** Various syntax or module errors

**Solution:**
```bash
# Check version
node -v

# Should be 18.0.0 or higher
# Update Node.js:
# Using nvm (recommended):
nvm install 20
nvm use 20

# Or download from: https://nodejs.org
```

### 4. Health Check Fails

**Symptoms:** `/health` endpoint returns 500 or doesn't respond

**Diagnosis:**
```bash
# Check if server is running
curl http://localhost:3000/health

# Check server logs
npm start
# Look for error messages
```

**Solutions:**
- Ensure server started successfully
- Check PORT environment variable is not conflicting
- Verify no firewall blocking port 3000
- Check server.js for syntax errors

### 5. API Endpoint Returns Empty Data

**Symptoms:** `/api/resources` returns `null` or empty array

**Diagnosis:**
```bash
curl http://localhost:3000/api/resources
```

**Solution:**
- This shouldn't happen with current code
- Verify src/web/server.js hasn't been modified
- Check for JSON parsing errors in browser console

### 6. 404 Page Not Showing

**Symptoms:** Default Express error instead of custom 404

**Solution:**
```bash
# Verify 404.html exists
ls -la src/web/public/404.html

# Check file is readable
cat src/web/public/404.html
```

### 7. Static Files Not Loading

**Symptoms:** CSS/images not loading, console errors

**Solution:**
```bash
# Verify public directory structure
ls -la src/web/public/

# Check file permissions
chmod 644 src/web/public/*.html

# Ensure Express static middleware is configured
grep "express.static" src/web/server.js
```

## Deployment Issues

### Render.com Specific

**Issue: Build fails**
- Check build logs in Render dashboard
- Verify package.json has correct `npm install` as build command
- Ensure Node version specified in package.json engines

**Issue: Service won't start**
- Check start command is `npm start`
- Verify PORT environment variable is used in server.js
- Look for errors in Render logs

**Issue: Service spins down (free tier)**
- This is normal on free tier after 15 min inactivity
- Takes ~30 seconds to spin back up
- Upgrade to paid plan for always-on service

### Railway.app Specific

**Issue: Out of credits**
- Free tier: $5/month
- Check usage in Railway dashboard
- Optimize resource usage or add payment method

### Fly.io Specific

**Issue: Deployment fails**
```bash
# Check Fly status
fly status

# View logs
fly logs

# Redeploy
fly deploy --force
```

## Environment Issues

### Development vs Production

**Issue: Works locally but not in production**

**Checklist:**
- [ ] Check NODE_ENV is set to 'production'
- [ ] Verify PORT environment variable is respected
- [ ] Ensure all dependencies in package.json, not just devDependencies
- [ ] Check platform-specific environment variables
- [ ] Review platform logs for errors

### Environment Variables

Required variables:
```bash
PORT=3000              # Set by platform automatically
NODE_ENV=production    # Set by platform or manually
```

## Performance Issues

### Slow Response Times

**Solutions:**
1. Check hosting platform resources
2. Verify not on free tier spin-down
3. Add caching headers for static files
4. Monitor with status dashboard

### High Memory Usage

**Solutions:**
1. Check for memory leaks in logs
2. Restart service
3. Upgrade hosting plan if needed

## Health Check Monitoring

### GitHub Actions Health Check Failing

**Issue: Automated health check creates issues**

**Solutions:**
1. Update `.github/workflows/health-check.yml` with correct URL
2. Verify service is actually up
3. Check if free tier spun down (Render)
4. Review health check logs in Actions tab

## Getting Help

If issues persist:

1. **Check Logs:**
   - Local: Terminal output
   - Render: Dashboard → Logs
   - Railway: Dashboard → Deployments → Logs
   - Fly.io: `fly logs`

2. **Verify Setup:**
   ```bash
   ./verify-setup.sh
   ```

3. **Test Endpoints:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/resources
   ```

4. **Create GitHub Issue:**
   - Include error messages
   - Include platform (Render, Railway, etc.)
   - Include relevant logs
   - Include steps to reproduce

## Debugging Tips

### Enable Verbose Logging

```bash
# Run with debugging
DEBUG=* npm start

# Or just Express
DEBUG=express:* npm start
```

### Test Individual Components

```bash
# Test just the server file
node src/web/server.js

# Test health check
curl -v http://localhost:3000/health

# Test with different port
PORT=8080 npm start
```

### Browser Console

Open browser console (F12) and check for:
- JavaScript errors
- Network request failures
- CORS errors

## Prevention

### Best Practices

1. **Always test locally first**
   ```bash
   npm install
   npm start
   # Test in browser
   ```

2. **Use verify-setup.sh before deploying**
   ```bash
   ./verify-setup.sh
   ```

3. **Monitor status dashboard**
   - Visit `/status.html` regularly
   - Check GitHub Actions status

4. **Keep dependencies updated**
   ```bash
   npm outdated
   npm update
   ```

5. **Review logs regularly**
   - Check for warnings
   - Monitor error rates
   - Track performance

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/guide)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Fly.io Documentation](https://fly.io/docs)

---

Still having issues? Create a GitHub issue with:
- Error messages
- Steps to reproduce
- Platform and Node.js version
- Output from `./verify-setup.sh`
