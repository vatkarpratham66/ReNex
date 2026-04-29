# Needo

Needo is a full-stack surplus donation platform that connects donors, NGOs, and admins.

## Project Structure

- `backend/`
  - Express API
  - MongoDB + Mongoose models
  - Auth, donation, acceptance, profile, stats, and admin routes
- `frontend/`
  - React + Vite app
  - Role-based dashboards for donor, NGO, and admin

## Core Flows

- Donors can register, manage profiles, create donations, upload photos, edit/delete available donations, and track accepted/completed items.
- NGOs can complete their organization profile, upload verification documents, browse available donations, accept them, and update pickup status.
- Admins can manage users, verify NGOs, manage donations, and review platform stats.

## Main Models

- `User`
- `Donor`
- `NGO`
- `Accept`

## Local Development

Backend:

```bash
cd backend
npm install
node server.js
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Deployment

Recommended split:

- `frontend/` -> Vercel
- `backend/` -> Render web service
- database -> MongoDB Atlas
- file storage -> Cloudinary

### Backend env

Set these on your backend host:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-strong-secret
GOOGLE_CLIENT_ID=your-google-client-id
APP_BASE_URL=https://your-frontend-domain

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=Needo <your_email@gmail.com>
SMTP_TLS_REJECT_UNAUTHORIZED=true
SMTP_TLS_SERVERNAME=
```

Backend deploy commands:

```bash
npm install
npm start
```

### Frontend env

Set these on your frontend host:

```env
VITE_API_URL=https://your-backend-domain/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Frontend build command:

```bash
npm install
npm run build
```

### Important Notes

- New donation photos and NGO certificates now upload to Cloudinary when Cloudinary env values are set.
- Existing old local files in `backend/uploads/` are not auto-migrated to Cloudinary.
- `frontend/vercel.json` is included so React Router routes work correctly on Vercel refresh/direct links.
- For Google login, add both your local and deployed frontend URLs in Google OAuth authorized origins.

## Email Notifications

Needo can send email notifications for:

- donor donation created confirmation
- verified NGOs when a matching new donation is posted
- donor when an NGO accepts a donation
- donor when NGO delivery status changes
- NGO verification approved/rejected
- user blocked/unblocked by admin

Copy `backend/.env.example` to `backend/.env` and fill in your SMTP values.

For Gmail, use an App Password instead of your normal login password.

If you see `self-signed certificate in certificate chain` during local testing, add this in `backend/.env` only for development:

```env
SMTP_TLS_REJECT_UNAUTHORIZED=false
```

If your provider requires a specific TLS server name, set:

```env
SMTP_TLS_SERVERNAME=your.smtp.host
```

## Notes

- Uploaded files are served from `backend/uploads/`
- Authentication uses JWT
- Google sign-in is supported through the frontend and backend auth flow
