# Twitter Clone Server

Backend API server for Twitter clone application built with Express, Prisma, and TypeScript.

## Features

- Authentication with Supabase
- User management (profiles, following)
- Tweet creation, media uploads
- Like functionality
- Prisma ORM for database operations

## Setup

### Prerequisites

- Node.js (v14+)
- npm or pnpm
- A Supabase account with project setup

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd twitter-server
npm install
# or with pnpm
pnpm install
```

3. Install type definitions for multer:

```bash
npm install --save-dev @types/multer
# or with pnpm
pnpm add -D @types/multer
```

4. Create a `.env` file in the project root with the following variables:

```
DATABASE_URL="your-prisma-db-connection-string"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
PORT=5000
```

5. Run Prisma migrations:

```bash
npx prisma migrate dev
```

### Running the server

Development mode:

```bash
npm run dev
# or with pnpm
pnpm dev
```

Production build:

```bash
npm run build
npm start
# or with pnpm
pnpm build
pnpm start
```

## Deployment

### Standard Deployment

To deploy the application:

1. Build the TypeScript code:

```bash
npm run build
# or
pnpm build
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Make sure your production environment has the necessary environment variables set.

4. Start the server:

```bash
npm start
# or
pnpm start
```

For platforms like Heroku or Railway, make sure to:

- Set all environment variables in the platform's dashboard
- Add a Procfile or ensure the start script is correctly configured
- Configure the database connection string for production

### Docker Deployment

This project includes a Dockerfile for containerized deployment:

1. Build the Docker image:

```bash
docker build -t twitter-server .
```

2. Run the container:

```bash
docker run -p 5000:5000 --env-file .env twitter-server
```

For production environments:

```bash
# Build the image
docker build -t twitter-server:production .

# Run with environment variables
docker run -d -p 5000:5000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXT_PUBLIC_SUPABASE_URL="your-supabase-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key" \
  twitter-server:production
```

## API Endpoints

- **Authentication**

  - POST `/api/auth/user` - Create or get user after Supabase auth
  - GET `/api/auth/me` - Get current user info (protected)

- **Users**

  - GET `/api/users/:username` - Get user profile
  - PUT `/api/users/profile` - Update user profile (protected)
  - POST `/api/users/follow/:userId` - Follow a user (protected)
  - PUT `/api/users/profile-picture` - Update profile picture (protected)

- **Tweets**
  - GET `/api/tweets` - Get tweet feed
  - GET `/api/tweets/user/:username` - Get user tweets
  - POST `/api/tweets` - Create a tweet (protected)
  - POST `/api/tweets/:id/like` - Like/unlike a tweet (protected)
