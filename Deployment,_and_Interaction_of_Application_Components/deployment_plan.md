# 1. Hosting Plan of Application Components

## Host Site

### Frontend (React Application)
**Hosted on:** Vercel  

**Reason:**
- Optimized for static React builds  
- Fast CDN delivery  
- Easy CI/CD integration  

### Backend (Node.js + Express Server)
**Hosted on:** Render  

**Reason:**
- Supports persistent server processes  
- Easy API hosting  
- Environment variable management  

### Database (MongoDB)
**Hosted on:** MongoDB Atlas  

**Reason:**
- Cloud managed DB  
- High availability  
- Automatic backups & scaling  

---

# Deployment Strategy

## Step by Step Deployment Process

### Frontend Deployment
- Develop React app locally  
- Run production build:

```bash
npm run build
```

- Deploy build folder to Vercel  
- Obtain public URL  

---

### Backend Deployment
- Deploy Node.js server to Render  
- Configure runtime:
  - Node.js version  
  - Port configuration  

---

### Environment Configuration
Set environment variables:

```env
MONGO_URI = MongoDB Atlas connection string
JWT_SECRET = Secret key for authentication
```

---

### API Communication Setup
Enable CORS in backend:

```javascript
const cors = require("cors");
app.use(cors());
```

- Configure frontend API URLs  

---

### Database Integration
- Connect backend ↔ MongoDB Atlas cluster  
- Validate CRUD operations  

---

# Security Measures

### HTTPS Enabled
- Encrypts client server communication  
- Prevents man-in-the-middle attacks  

### JWT Authentication
- Secure session management  
- Stateless authentication  

### Password Hashing
- bcrypt used  
- Protects user credentials  

### Database Security
- MongoDB Atlas IP Whitelisting  

### Secrets Management
- Environment variables instead of hardcoding
