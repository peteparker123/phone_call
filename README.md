# Phone a Friend - WebRTC Voice Chat

A simple peer-to-peer voice chat application using WebRTC and PeerJS.

## Features
- Real-time voice communication
- No sign-up required
- Peer-to-peer connection (no data stored on servers)
- Simple device ID sharing system

## How to Use
1. Open the application
2. Share your device ID with a friend
3. Click "Call" and enter your friend's device ID
4. Enjoy the conversation!

## Deployment

### Backend (Render)
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Use the included `render.yaml` for configuration
4. Note your Render URL (e.g., `your-app-name.onrender.com`)

### Frontend (Vercel)
1. Update `script.js` line 3 with your Render URL
2. Deploy frontend files to Vercel
3. Connect your GitHub repo to Vercel

### Configuration
Update the host in `script.js`:
```javascript
host: isLocalhost ? location.hostname : 'your-render-app-name.onrender.com',
```

## Local Development
```bash
npm install
npm start
```
Then open `http://localhost:8000`