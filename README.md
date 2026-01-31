# Rust Backend API with SQLite

A RESTful API built with Rust, Actix-web, and SQLite featuring JWT authentication, CRUD operations, image upload, and search functionality.

## Project Structure

```
my-project/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── main.rs
│   │   ├── db.rs
│   │   ├── models/
│   │   ├── handlers/
│   │   └── auth/
│   ├── migrations/
│   ├── Cargo.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
└── data/
    ├── db/
    └── images/
```

## Features

- **JWT Authentication**: Secure token-based authentication
- **Three Main Entities**:
  - Agents: User accounts with authentication
  - Pages: Content pages with sections and localization
  - Contents: Rich content with image support
- **Image Management**: Upload, preview, and delete images
- **Search**: Full-text search across all entities
- **CRUD Operations**: Complete Create, Read, Update, Delete for all tables

## Database Schema

### Agents Table
- `id`: Auto-increment primary key
- `agent_number`: Unique 6-character identifier
- `password_hash`: Bcrypt hashed password
- `is_active`: Boolean status flag

### Pages Table
- `id`: Auto-increment primary key
- `page_name`: Page identifier (varchar 20)
- `section_name`: Section name (varchar 10)
- `lang`: Language code (char 2, e.g., "en", "mm")
- `content_type`: Content type (varchar 3, e.g., "h1", "h2", "p")
- `visible`: Visibility flag
- `display_order`: Sort order
- `attributes`: JSON attributes (optional)

### Contents Table
- `id`: Auto-increment primary key
- `ref_id`: Foreign key to pages table
- `short_desc`: Short description (varchar 150)
- `long_desc`: Long description (TEXT/LONGTEXT)
- `image_path`: Relative path to image (varchar 100)
- `title`: Content title (varchar 50)

## API Endpoints

### Authentication (Public)

#### Register Agent
```http
POST /api/auth/register
Content-Type: application/json

{
  "agent_number": "AGT001",
  "password": "password123",
  "is_active": true
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "agent_number": "AGT001",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1...",
  "agent": {
    "id": 1,
    "agent_number": "AGT001",
    "is_active": true
  }
}
```

### Agents (Protected)

All agent endpoints require `Authorization: Bearer <token>` header.

#### Get All Agents
```http
GET /api/agents
```

#### Get Current Agent
```http
GET /api/agents/me
```

#### Get Agent by ID
```http
GET /api/agents/{id}
```

#### Update Agent Status
```http
PUT /api/agents/{id}
Content-Type: application/json

{
  "is_active": false
}
```

#### Delete Agent
```http
DELETE /api/agents/{id}
```

### Pages (Protected)

#### Create Page
```http
POST /api/pages
Content-Type: application/json
Authorization: Bearer <token>

{
  "page_name": "home",
  "section_name": "hero",
  "lang": "en",
  "content_type": "h1",
  "visible": true,
  "display_order": 1,
  "attributes": "{\"style\": \"dark\"}"
}
```

#### Get All Pages
```http
GET /api/pages
```

#### Get Page by ID
```http
GET /api/pages/{id}
```

#### Update Page
```http
PUT /api/pages/{id}
Content-Type: application/json

{
  "page_name": "home-updated",
  "visible": false
}
```

#### Delete Page
```http
DELETE /api/pages/{id}
```

### Contents (Protected)

#### Create Content
```http
POST /api/contents
Content-Type: application/json
Authorization: Bearer <token>

{
  "ref_id": 1,
  "short_desc": "Welcome message",
  "long_desc": "This is a detailed welcome message...",
  "title": "Welcome",
  "image_path": "uuid_timestamp.jpg"
}
```

#### Get All Contents
```http
GET /api/contents
```

#### Get Content by ID
```http
GET /api/contents/{id}
```

#### Get Contents by Page Reference
```http
GET /api/contents/ref/{ref_id}
```

#### Update Content
```http
PUT /api/contents/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "short_desc": "Updated description"
}
```

**Note**: When updating `image_path`, the old image will be automatically deleted.

#### Delete Content
```http
DELETE /api/contents/{id}
```

**Note**: Deleting content will also delete the associated image file.

### Images (Protected)

#### Upload Image
```http
POST /api/images/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary image data>

Response:
{
  "filename": "uuid_timestamp.jpg",
  "path": "/images/uuid_timestamp.jpg",
  "message": "Image uploaded successfully"
}
```

#### Get Image (Public)
```http
GET /api/images/{filename}
```

Returns the image file with appropriate content-type header.

#### Delete Image
```http
DELETE /api/images/{filename}
Authorization: Bearer <token>
```

### Search (Protected)

#### Search All Tables
```http
GET /api/search?q=keyword
Authorization: Bearer <token>

Response:
{
  "agents": [...],
  "pages": [...],
  "contents": [...]
}
```

#### Search Pages Only
```http
GET /api/search/pages?q=keyword
```

#### Search Contents Only
```http
GET /api/search/contents?q=keyword
```

## Setup and Running

### Using Docker Compose (Recommended)

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Edit `.env` and set your JWT secret:
```env
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRATION=86400
```

3. Start all services:
```bash
docker-compose up -d
```

4. Check logs:
```bash
docker-compose logs -f backend
```

### Local Development

1. Install Rust (if not installed):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Navigate to backend directory:
```bash
cd backend
```

3. Copy and configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Create data directories:
```bash
mkdir -p ../data/db ../data/images
```

5. Run the application:
```bash
cargo run
```

The API will be available at `http://localhost:8080`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | SQLite database path | `sqlite:../data/db/database.db` |
| JWT_SECRET | Secret key for JWT signing | Required |
| JWT_EXPIRATION | Token expiration in seconds | `86400` (24 hours) |
| SERVER_HOST | Server bind address | `0.0.0.0` |
| SERVER_PORT | Server port | `8080` |
| UPLOAD_DIR | Directory for uploaded images | `../data/images` |
| RUST_LOG | Logging level | `info` |

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Protected routes require valid JWT token
- CORS enabled for frontend integration
- SQL injection protection via parameterized queries
- Image filename sanitization

## Image Upload Details

- Supported formats: JPG, JPEG, PNG, GIF, WEBP
- Files are stored with UUID + timestamp naming
- Old images are automatically deleted when updated
- Images are deleted when parent content is removed
- Files are sanitized to prevent directory traversal

## Search Functionality

Search queries perform LIKE matching across:

**Agents**: agent_number

**Pages**: page_name, section_name, lang, content_type, attributes

**Contents**: short_desc, long_desc, title, image_path

## Testing with cURL

### Register and Login
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"agent_number":"AGT001","password":"test123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"agent_number":"AGT001","password":"test123"}'
```

### Create Page (with token)
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:8080/api/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "page_name":"home",
    "section_name":"hero",
    "lang":"en",
    "content_type":"h1",
    "visible":true,
    "display_order":1
  }'
```

### Upload Image
```bash
curl -X POST http://localhost:8080/api/images/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Search
```bash
curl "http://localhost:8080/api/search?q=home" \
  -H "Authorization: Bearer $TOKEN"
```

## Building for Production

```bash
cd backend
cargo build --release
```

The optimized binary will be at `target/release/backend`

## Troubleshooting

### Database locked error
- Make sure only one instance is accessing the database
- Check file permissions on the data directory

### Image upload fails
- Verify the upload directory exists and is writable
- Check available disk space

### JWT token invalid
- Ensure the JWT_SECRET matches between login and protected routes
- Check if the token has expired

## License

MIT
