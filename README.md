# 🎄 Noel Backend

Backend API for the Noel Christmas Game, built with NestJS, MongoDB, and Redis.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```
MONGODB_URI=mongodb://localhost:27017/noel
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
```

3. Make sure MongoDB and Redis are running:
- MongoDB: `mongod` or use MongoDB Atlas
- Redis: `redis-server`

4. Run development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /auth/login` - Login with UUID
- `POST /auth/logout` - Logout

### Members
- `GET /members/me` - Get current member info
- `GET /members/all` - Get all members (admin only)

### Tasks
- `GET /tasks` - Get open tasks
- `GET /tasks/:id` - Get task details
- `POST /tasks/random` - Get random task by card type

### Results
- `GET /results/:id` - Get result details
- `POST /results/random` - Get random result

### Admin
- `POST /admin/mark-task-completed` - Mark task as completed (admin only)

## Database Collections

- **Members**: User information and game state
- **Tasks**: Available challenges
- **Results**: Rewards/gifts

