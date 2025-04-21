# Vishal Kale's Portfolio

A full-stack portfolio website showcasing backend development skills and projects.

## Project Structure

```
portfolio-backend/ - Node.js + Express.js backend
portfolio-frontend/ - Vite + React frontend
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd portfolio-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
FRONTEND_URL=http://localhost:5173

# Configure these with your email settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=your-email@gmail.com
ADMIN_EMAIL=your-email@gmail.com
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd portfolio-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Development

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:5173

## Features

- Responsive design with dark/light mode
- Dynamic content management through MongoDB
- Real-time updates using Socket.IO
- Projects showcase with progress tracking
- Professional timeline
- Skills categorization
- Contact form with email notifications

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- TypeScript
- Nodemailer

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router DOM