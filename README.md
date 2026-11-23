# SwiftDrive

A full-stack personal cloud file manager built with React, TypeScript, Express, MongoDB Atlas and Cloudinary.

## Included
- Email/password registration and login with HTTP-only access/refresh cookies
- User-scoped file listing, upload, download and delete
- 100 MB maximum per file
- Cloudinary image delivery optimization (`f_auto,q_auto`) while preserving the original uploaded asset
- MongoDB stores file metadata; Cloudinary stores file content
- Responsive dashboard

## Requirements
- Node.js 20.19+ or 22.12+
- npm 10+
- MongoDB Atlas database
- Cloudinary account

## Setup (Windows / VS Code)
1. Extract this ZIP to a new folder, for example `C:\PROJECTS\swiftdrive`.
2. Open that folder in VS Code.
3. In the root terminal run:
   ```bash
   npm install
   ```
4. Create the two environment files:
   - Copy `server/.env.example` to `server/.env`, then fill in your MongoDB Atlas and Cloudinary values.
   - Copy `client/.env.example` to `client/.env`. Leave `VITE_API_URL=http://localhost:5000/api` for local development.
5. Generate two different secrets (PowerShell):
   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Put one output in `JWT_ACCESS_SECRET` and a different output in `JWT_REFRESH_SECRET` in `server/.env`.
6. Start both apps from the root:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:5173`.

## Environment files
`server/.env` must contain `PORT`, `CLIENT_URL`, `MONGODB_URI`, both JWT secrets and all three Cloudinary credentials. `client/.env` needs `VITE_API_URL`.

## Production build
```bash
npm run build
npm start
```
For production, deploy the frontend and backend over HTTPS. Set `CLIENT_URL` to the exact frontend origin. Configure a same-site deployment or update cookie/CSRF policy before deploying frontend and API on unrelated sites. Set `NODE_ENV=production`. Never expose Cloudinary API secret or JWT secrets in frontend variables.

## Upload and optimization notes
- The API accepts files up to 100 MB each.
- Cloudinary is configured to store images, videos and raw files using automatic resource detection.
- Image delivery URLs request automatic format and quality optimization. The original asset remains in Cloudinary; the optimization is applied at delivery, not destructive client-side recompression.
- This starter uses server-mediated uploads (the server temporarily buffers the file in memory). For high-traffic production workloads, move to signed direct-to-Cloudinary uploads and/or streaming/chunked uploads.

## Security notes
- Passwords are hashed with bcrypt.
- Access and refresh tokens are stored in HTTP-only cookies; refresh tokens are hashed in MongoDB.
- Authenticated file queries are scoped by the signed-in user's ID.
- CORS is restricted to `CLIENT_URL`, and Helmet and rate limiting are enabled.
- Before public production launch, add CSRF protection appropriate to your deployment topology, malware scanning/content policy, monitoring, backups, and tested account recovery. This project is a functional starter, not a security-audited service.
"# swiftdrive" 
"# swiftDrive" 
