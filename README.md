# 🎬 Streamline (Social-Api) — Full-Stack Video & Community Platform

A full-stack, production-grade video sharing and community platform built with **React**, **TypeScript**, **Node.js**, **Express**, and **MongoDB**. Features end-to-end authentication, Cloudinary media processing, advanced aggregation pipelines, a creator studio, tweet/community notes, playlists, and a modern responsive user interface.

---

## 🌟 Key Features

### 💻 Modern Frontend (React + TypeScript + Tailwind CSS)
- **Video Feed & Explore**: Discovery feeds with search query filtering, sorting, and pagination.
- **Video Watch Experience**: Video player, real-time view tracking, video likes, comment management, and playlist integration.
- **Channel Profiles**: Detailed creator channels showcasing published videos, tweets, playlists, and subscriber counts.
- **Creator Studio**:
  - **Dashboard**: Channel metrics (total subscribers, views, video count, likes).
  - **Video Upload**: Multi-file media upload (video & thumbnail) with drag-and-drop and progress tracking.
  - **Video Management**: Edit metadata, update thumbnails, toggle publish/unpublish status, and delete videos.
- **Community Tweets**: Create, edit, delete, and bulk-delete tweets with character limit validation.
- **Personal Library**:
  - **Subscriptions**: Network list of subscribed channels with direct unsubscribe actions.
  - **Watch History**: Chronological view of watched videos.
  - **Liked Videos**: Curated list of all liked content.
  - **Playlists**: Create custom playlists, add/remove videos, and edit playlist details.
- **User Settings & Profile**: Update avatar, cover photo, account details, and password.
- **Responsive UI/UX**: Collapsible desktop sidebar, top navigation with search, and mobile bottom navigation.

---

### ⚙️ Robust Backend (Node.js + Express + MongoDB)
- **Authentication & Security**:
  - Register with avatar & cover image processing (Multer → Cloudinary).
  - JWT authentication with access and refresh token rotation.
  - Secure httpOnly cookie support and password hashing via `bcrypt`.
- **Media Pipeline**: Direct video and image upload, storage, and optimization with Cloudinary.
- **MongoDB Aggregation Pipelines**: High-performance queries with `$lookup`, `$group`, and `$project` for analytics, channel stats, and paginated comments/videos.
- **RESTful Architecture**: Modular MVC structure with centralized error handling (`ApiError`) and standard responses (`ApiResponse`).
- **Interactive Documentation**: OpenAPI/Swagger UI integration.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend** | React 19 | Core UI Library |
| | TypeScript | Type Safety |
| | Vite | Build Tool & Fast HMR |
| | Tailwind CSS | Utility-first Styling |
| | React Router | Client-side Routing |
| | Axios | HTTP Client with Interceptors |
| | Lucide React | Modern UI Icons |
| **Backend** | Node.js | Server Runtime |
| | Express.js v5 | Web Framework |
| | MongoDB + Mongoose | Database & ODM |
| | JWT (jsonwebtoken) | Token-based Auth |
| | Multer | Multipart Form/File Handling |
| | Cloudinary | Cloud Media Hosting & Optimization |
| | Swagger UI | API Documentation |
| **Monorepo / Dev** | Concurrently | Single-command Full-Stack Development |

---

## 📁 Project Structure

```
social-api/
├── backend/
│   ├── public/             # Static temporary storage
│   └── src/
│       ├── config/         # Environment variables & OpenAPI spec
│       ├── controllers/    # API business logic
│       ├── db/             # MongoDB connection setup
│       ├── middlewares/    # Auth (JWT) & Multer upload middlewares
│       ├── models/         # Mongoose models (User, Video, Tweet, etc.)
│       ├── routes/         # Express API routers
│       ├── utils/          # Cloudinary helpers, ApiError, ApiResponse
│       ├── app.js          # Express app configuration & middleware
│       └── index.js        # Server entry point
│
├── frontend/
│   ├── public/             # Public assets
│   └── src/
│       ├── api/            # Axios API service layer
│       ├── components/     # Reusable UI & feature components
│       │   ├── channel/    # Channel headers, tabs, cards
│       │   ├── comments/   # Comment sections & inputs
│       │   ├── layout/     # AppShell, Navbar, Sidebar
│       │   ├── playlist/   # Playlist modals & lists
│       │   ├── studio/     # Creator Studio cards & tools
│       │   ├── tweet/      # Tweet composer & lists
│       │   ├── ui/         # Base UI elements (Button, Modal, etc.)
│       │   └── video/      # Video player, grids, cards
│       ├── context/        # Auth context & state management
│       ├── pages/          # Application views / routes
│       ├── router/         # React Router configuration & Protected Routes
│       ├── types/          # TypeScript interface definitions
│       └── utils/          # Storage & error formatting helpers
│
├── package.json            # Root configuration for concurrent execution
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)
- [Cloudinary](https://cloudinary.com/) account for media storage

---

### 1. Clone the Repository

```bash
git clone https://github.com/abmdevx/social-api.git
cd social-api
```

---

### 2. Configure Environment Variables

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

### 3. Install Dependencies

You can install all dependencies from the root directory:

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

---

### 4. Run the Application

Run both frontend and backend concurrently with a single command from the root directory:

```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api/v1`
- **Swagger Documentation**: `http://localhost:8000/api-docs`

---

## 📬 API Endpoints Overview

Base URL: `http://localhost:8000/api/v1`

### 👤 Users & Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/users/register` | ❌ | Register user with avatar & cover image |
| POST | `/users/login` | ❌ | Authenticate user & issue tokens |
| POST | `/users/refresh-token` | ❌ | Refresh access token using refresh token |
| POST | `/users/logout` | ✅ | Log out current user & clear tokens |
| POST | `/users/change-password` | ✅ | Change current account password |
| GET | `/users/get-current-user` | ✅ | Fetch authenticated user data |
| PATCH | `/users/update-account` | ✅ | Update user profile information |
| PATCH | `/users/change-avatar` | ✅ | Update profile avatar |
| PATCH | `/users/change-cover-image` | ✅ | Update channel cover image |
| GET | `/users/c/:username` | ✅ | Get full channel profile |
| GET | `/users/history` | ✅ | Get user watch history |

### 🎥 Videos
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/videos/upload-video` | ✅ | Upload video file and thumbnail |
| GET | `/videos/get-all-videos` | ✅ | Get paginated video feed with filters |
| GET | `/videos/v/:videoId` | ✅ | Fetch single video details & track views |
| PATCH | `/videos/v/:videoId` | ✅ | Update video title & description |
| PATCH | `/videos/v/:videoId/thumbnail` | ✅ | Update video thumbnail |
| PATCH | `/videos/v/:videoId/publish` | ✅ | Toggle video publish status |
| DELETE | `/videos/delete-videos` | ✅ | Delete selected videos |

### 🐦 Tweets (Community Notes)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/tweets/create-tweet` | ✅ | Post a new tweet |
| GET | `/tweets/get-tweets` | ✅ | Fetch tweets for feed |
| PATCH | `/tweets/t/:tweetId` | ✅ | Edit tweet content |
| DELETE | `/tweets/t/:tweetId` | ✅ | Delete a tweet |
| DELETE | `/tweets/delete-bulk-tweets` | ✅ | Bulk delete selected tweets |

### 🗨️ Comments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/comments/c/:videoId` | ✅ | Get paginated comments for a video |
| POST | `/comments/c/:videoId/add-comment` | ✅ | Post a comment on a video |
| PATCH | `/comments/c/:commentId/v/:videoId/update-comment` | ✅ | Edit an existing comment |
| DELETE | `/comments/c/:commentId/v/:videoId/delete-comment` | ✅ | Delete a comment |

### ❤️ Likes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/likes/l/:videoId` | ✅ | Toggle like on a video |
| POST | `/likes/c/:commentId` | ✅ | Toggle like on a comment |
| POST | `/likes/t/:tweetId` | ✅ | Toggle like on a tweet |
| GET | `/likes/get-liked-videos` | ✅ | Get all videos liked by current user |

### 📂 Playlists
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/playlists/create-playlist` | ✅ | Create a new playlist |
| GET | `/playlists/p/:playlistId` | ✅ | Get playlist by ID with videos |
| PATCH | `/playlists/p/:playlistId` | ✅ | Update playlist name & description |
| DELETE | `/playlists/p/:playlistId` | ✅ | Delete a playlist |
| GET | `/playlists/users/:userId/playlists` | ✅ | Get all playlists belonging to a user |
| PUT | `/playlists/p/:playlistId/v/:videoId` | ✅ | Add video to a playlist |
| DELETE | `/playlists/p/:playlistId/v/:videoId` | ✅ | Remove video from a playlist |

### 🔔 Subscriptions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/subscriptions/c/:channelId` | ✅ | Toggle subscribe/unsubscribe to channel |
| GET | `/subscriptions/c/:channelId` | ✅ | Get all subscribers of a channel |
| GET | `/subscriptions/u/:subscriberId` | ✅ | Get all channels a user has subscribed to |

### 📊 Dashboard & Studio
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | ✅ | Get creator metrics (subs, views, videos, likes) |
| GET | `/dashboard/videos` | ✅ | Get creator studio videos |

> ✅ = Requires Bearer Token &nbsp;&nbsp;|&nbsp;&nbsp; ❌ = Public Route

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
