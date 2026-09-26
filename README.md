# Spotify API

A REST API for user and artist authentication, music uploads, and album management. The API is built with Node.js, Express, and MongoDB. Uploaded audio is stored through ImageKit.

## Features

- Register and log in as a user or artist
- Authenticate requests with a JWT stored in an HTTP cookie
- Upload music as an artist
- Create albums as an artist
- Browse music and albums as a user

## Requirements

- Node.js and npm
- A MongoDB database
- An ImageKit account and private API key

## Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/spotify
   JWT_SECRET=replace-with-a-long-random-secret
   IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
   ```

   Use your own MongoDB connection string and ImageKit private key. Keep `.env` private; it is excluded from Git.

3. Start the development server:

   ```bash
   npm run dev
   ```

   The API listens on `http://localhost:3000`. For a regular start, use `npm start`.

## API

All request and response bodies use JSON, except music uploads, which use `multipart/form-data`. Authentication endpoints set or clear the `token` cookie. Send that cookie with protected requests.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create a user or artist account |
| `POST` | `/api/auth/login` | Public | Log in and set the auth cookie |
| `POST` | `/api/auth/logout` | Public | Clear the auth cookie |
| `POST` | `/api/music/upload` | Artist | Upload a music file |
| `POST` | `/api/music/album` | Artist | Create an album |
| `GET` | `/api/music` | User | Fetch music records |
| `GET` | `/api/music/album` | User | Fetch albums |
| `GET` | `/api/music/album/:albumId` | User | Fetch one album and its music |

### Register

Set `role` to `artist` to create an artist account. If omitted, it defaults to `user`.

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "artist-one",
  "email": "artist@example.com",
  "password": "choose-a-password",
  "role": "artist"
}
```

Successful registration and login responses set a `token` cookie. Keep and send this cookie when calling protected endpoints.

### Log in

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "artist-one",
  "password": "choose-a-password"
}
```

The login controller also accepts an `email` instead of `username`.

### Upload music

Send the file as the `music` form field and provide a `title` text field. This endpoint requires an artist cookie.

```bash
curl -X POST http://localhost:3000/api/music/upload \
  -b cookies.txt \
  -F "title=First Track" \
  -F "music=@./track.mp3"
```

### Create an album

Send an array of existing music document IDs in `musicId`. This endpoint requires an artist cookie.

```http
POST /api/music/album
Content-Type: application/json
Cookie: token=<jwt>

{
  "title": "First Album",
  "musicId": ["<music-id>"]
}
```

### Browse music and albums

These routes require a user-role cookie:

```http
GET /api/music
GET /api/music/album
GET /api/music/album/<album-id>
Cookie: token=<jwt>
```

The music list currently returns records after skipping the first 10, with a maximum of 10 records per request. Album listing and detail routes do not currently expose pagination.

## Project structure

```text
.
├── server.js                 # Loads environment, connects to MongoDB, starts the server
├── src/
│   ├── app.js                 # Express app and API route registration
│   ├── controllers/           # Authentication and music request handlers
│   ├── db/                    # MongoDB connection
│   ├── middlewares/           # Role-based JWT authentication
│   ├── models/                # User, music, and album schemas
│   ├── routes/                # Authentication and music routes
│   └── services/              # ImageKit storage integration
└── Music_Files/               # Local music files (not used by the upload route)
```

## Scripts

- `npm run dev` starts the server with nodemon.
- `npm start` starts the server with Node.js.
- `npm test` is currently a placeholder and does not run a test suite.

## Notes

- Registration accepts only the `user` and `artist` roles.
- Music files are uploaded to ImageKit under the `Spotify/music` folder.
- The server currently uses port `3000` directly in `server.js`.