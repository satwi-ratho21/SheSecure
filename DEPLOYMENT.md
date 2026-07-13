# Vanguard Systems - Enterprise Production Deployment Guide

This guide details the complete configuration, provisioning, and synchronization procedures to transition the **Vanguard Emergency & Safety Mesh** from the local development sandbox to a highly secure, auto-scaling, cloud-native production architecture.

---

## 🛠 Target Production Topology

```
                  ┌──────────────────────────────┐
                  │   Vercel Edge CDN (Client)   │
                  │   - Vite SPA static bundle   │
                  └──────────────┬───────────────┘
                                 │
                     Secure API HTTPS requests
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    Render Web Service (API)  │
                  │    - Express, Socket.io      │
                  └──────┬──────┬──────┬─────────┘
                         │      │      │
          ┌──────────────┘      │      └──────────────┐
          ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  MongoDB Atlas   │  │    Cloudinary    │  │      Twilio      │
│   (Data Store)   │  │   (Secure CDN)   │  │  (SMS Carriers)  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

- **Frontend**: **Vercel** (Static single-page application distribution via global Edge Network).
- **Backend Service & Sockets**: **Render** (Auto-scaling Web Service running the Express/Node.js instance).
- **Durable Database**: **MongoDB Atlas** (Managed MongoDB cloud cluster replacing local simulated JSON files).
- **Secure Image Vault**: **Cloudinary** (Secure media and evidence file uploads).
- **Emergency Comms Gateway**: **Twilio Carrier API** (Low-latency SMS emergency dispatcher).

---

## 🔐 1. Security Hardening Configuration

The Express server has been hardened using the standard security stack:
1. **Helmet**: Configures safe HTTP headers, hides backend system signatures, prevents clickjacking (`X-Frame-Options`), and restricts MIME types.
2. **CORS (Cross-Origin Resource Sharing)**: Locked down to only accept requests originating from your specific production Vercel domain.
3. **Express Rate Limit**: Imposed to prevent Denial-of-Service (DoS) attacks and brute-force authentications by capping requests to 150 per 15-minute window per IP.

### Production Content Security Policy (CSP) Recommendation
When deploying to production, modify the Helmet initialization in `server.ts` to strictly whitelist your assets:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      connectSrc: [
        "'self'", 
        "https://maps.googleapis.com", 
        "https://*.googleapis.com",
        "wss://your-render-backend-url.onrender.com" // Update to your Render domain
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://res.cloudinary.com", 
        "https://maps.gstatic.com", 
        "https://*.googleapis.com"
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
```

---

## 🍃 2. MongoDB Atlas Database Setup

### Step-by-Step Provisioning
1. **Create an Account**: Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register a free cloud account.
2. **Provision Cluster**: Click **"Create a Cluster"**, select the **M0 Shared Tier** (Free), choose a region close to your Render deployment (e.g., AWS us-east-1 or frankfurt), and click **Create**.
3. **Database Credentials**: 
   - Navigate to **Security -> Database Access**.
   - Create a new database user (e.g., `vanguard-app`).
   - Assign the role **Read and Write to any Database**. Securely copy the password.
4. **Network Whitelisting**:
   - Navigate to **Security -> Network Access**.
   - Click **Add IP Address**.
   - For Render server compatibility (since Render dynamic IPs scale and rotate), click **Allow Access from Anywhere** (`0.0.0.0/0`). Alternatively, if using a Render static outbound proxy, specify that IP.
5. **Get Connection String**:
   - On the Cluster dashboard, click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection URI:
     `mongodb+srv://vanguard-app:<password>@cluster0.abc.mongodb.net/vanguard?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password.

### Production Real Integration Pattern
To seamlessly shift from the simulated JSON file stores (`simulated_mongo_db*.json`) to actual MongoDB database instances, replace the simulation classes in `server.ts` with standard `mongoose` models:

```typescript
import mongoose from "mongoose";

// Connection code
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log("[MongoDB Production] Connected successfully to Atlas Cluster."))
  .catch((err) => console.error("[MongoDB Error] Failed to connect:", err));

// Example Mongoose Schema for User
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['USER', 'VOLUNTEER', 'POLICE', 'ADMIN'], default: 'USER' },
  isVerified: { type: Boolean, default: false },
  safetyId: { type: String, unique: true },
  trustCircle: [{ name: String, phone: String, relation: String, isBroadcasting: Boolean }],
  bloodType: String,
  medicalConditions: String,
  hasCompletedOnboarding: { type: Boolean, default: false },
  avatarUrl: String
});

export const User = mongoose.model("User", UserSchema);
```

---

## ☁️ 3. Cloudinary CDN Image Storage Setup

Vanguard uses Cloudinary to host uploaded evidence locker files, trafficking reports, and missing persons images securely on an enterprise content delivery network.

### Step-by-Step Provisioning
1. **Create Account**: Go to [Cloudinary](https://cloudinary.com/) and register for a free account.
2. **Retrieve API Credentials**:
   - Log into the dashboard and navigate to your **Product Environment Settings**.
   - Copy your **Cloud Name**, **API Key**, and **API Secret**.
3. **Configure Environment Variables**:
   Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in your server configuration environment variables.

### Production Real Integration Pattern
Install the official SDK: `npm install cloudinary` and `@types/cloudinary`.
Replace the simulation block in the endpoints (`/api/trafficking/report`, `/api/missing-persons`, and `/api/evidence/upload`) with the active Cloudinary engine:

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Example route controller upload block
const uploadResponse = await cloudinary.uploader.upload(base64Image, {
  folder: "vanguard_evidence",
  resource_type: "auto",
});

const fileUrl = uploadResponse.secure_url;
const cloudinaryId = uploadResponse.public_id;
```

---

## 💬 4. Twilio Gateway SMS Integration

Twilio acts as the underlying telecommunications pipeline, dispatching real-time SMS broadcasts, SOS coordinates, and OTP verify pins.

### Step-by-Step Provisioning
1. **Create Account**: Register a developer account on [Twilio](https://www.twilio.com/).
2. **Buy Phone Number**:
   - Navigate to **Phone Numbers -> Manage -> Buy a Number**.
   - Select a mobile number configured with **SMS capabilities**.
3. **Acquire Credentials**:
   - On the Twilio Console homepage, copy your **Account SID** and **Auth Token**.
4. **Configure Twilio Variables**:
   Provide `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_PHONE` (using standard international formatting: `+1XXXYYYZZZZ`) to your Render server configuration.

---

## 🚀 5. Render Backend & Sockets Deployment

Render hosts the Node.js backend server and maintains sticky client connections for real-time WebSockets synchronization.

### Step-by-Step Deployment
1. **Create Account**: Register at [Render](https://render.com/).
2. **Add New Service**:
   - Click **New +** and select **Web Service**.
   - Connect your GitHub/GitLab repository.
3. **Configure Build Settings**:
   - **Name**: `vanguard-backend`
   - **Environment**: `Node`
   - **Region**: Select a region matching your MongoDB cluster.
   - **Branch**: `master` or `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. **Provide Environment Variables**:
   Click **Advanced -> Add Environment Variables** and populate the variables listed in your `.env.example`:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(Generate a secure 32-character hexadecimal string)*
   - `GEMINI_API_KEY` = *(Your Google Gemini API Key)*
   - `TWILIO_ACCOUNT_SID` = *(Your Twilio SID)*
   - `TWILIO_AUTH_TOKEN` = *(Your Twilio Auth Token)*
   - `TWILIO_FROM_PHONE` = *(Your Twilio Number)*
   - `CORS_ORIGIN` = `https://vanguard-frontend.vercel.app` *(Your production Vercel link)*
   - `MONGODB_URI` = *(Your MongoDB Atlas Connection string)*
   - `CLOUDINARY_CLOUD_NAME` = *(Your Cloudinary Cloud Name)*
   - `CLOUDINARY_API_KEY` = *(Your Cloudinary API Key)*
   - `CLOUDINARY_API_SECRET` = *(Your Cloudinary API Secret)*
5. **Disk Storage (Optional)**:
   If you still want fallback disk persistence, navigate to the **Disks** section in Render, click **Add Disk**, and mount a disk at `/usr/src/app/data` where your backup files will be directed.
6. **Trigger Build**: Click **Create Web Service**. Wait for the live URL (e.g., `https://vanguard-backend.onrender.com`).

---

## 🎨 6. Vercel Frontend Deployment

Vercel will distribute the Vite single-page application.

### Step-by-Step Deployment
1. **Create Account**: Register at [Vercel](https://vercel.com/).
2. **Add New Project**:
   - Connect your GitHub account, find the repository, and click **Import**.
3. **Configure Framework Presets**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Configure Environment Variables**:
   Under the Environment Variables drawer, define public client keys:
   - `VITE_API_URL` = `https://vanguard-backend.onrender.com` *(Set to your Render backend URL)*
   - `VITE_GOOGLE_MAPS_KEY` = *(Your public Google Maps API Key)*
5. **Configuring SPA Router Rewrites**:
   To prevent `404 Not Found` errors when refreshing custom routes on Vercel, create a `vercel.json` file in your root directory containing:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://vanguard-backend.onrender.com/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. **Trigger Deployment**: Click **Deploy**. Vercel will bundle the React frontend, cache static files across global CDN edge nodes, and provide a live secure (`https`) domain.

---

## 🔄 7. Client Socket Endpoint Adjustment

Ensure that your Socket client in components (e.g. `UnifiedNotificationCenter.tsx`, `CommunityRescueNetwork.tsx`, `TrustedCircle.tsx`) connects dynamically to the live Render endpoint rather than the local dev fallback.

For example, update Socket initialization inside components:
```typescript
import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
const socket = io(socketUrl, {
  transports: ["websocket"],
  secure: true
});
```

---

## 🛡️ Production Verification Checklist

- [ ] **SSL (HTTPS)**: Both Vercel and Render endpoints serve files over secure, verified SSL certificates automatically.
- [ ] **Cross-Origin Security**: `CORS` is locked down to Vercel domains only.
- [ ] **Gateway Verification**: Twilio, MongoDB, and Cloudinary pipelines return `200 OK` responses with active handles.
- [ ] **Model Grounding**: Secure Gemini engine functions on the server without key leaks.
