# PureLiving Local Development

## Start MongoDB (Docker)
```bash
docker compose up -d mongo
```

## Start Backend
```bash
cd backend
npm install
npm run dev
```

## Start Frontend
```bash
cd frontend
npm install
npm start
```

## Environment
1. Copy `.env.example` to `.env`
2. Ensure `MONGO_URI=mongodb://127.0.0.1:27017/pureliving`
