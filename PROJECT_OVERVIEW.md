# Project Overview

## Rust Backend with SQLite - Complete Implementation

This project provides a full-featured REST API backend built with Rust, Actix-web framework, and SQLite database.

## What's Included

### ✅ Three Database Entities

1. **Agents** - User accounts with secure authentication
   - 6-character agent numbers
   - Bcrypt password hashing
   - Active/inactive status management

2. **Pages** - Multi-language content pages
   - Page and section names
   - Language support (e.g., en, mm)
   - Content types (h1, h2, h3, p, div, etc.)
   - Visibility and display order controls
   - Optional JSON attributes

3. **Contents** - Rich content with image support
   - Linked to pages via foreign key
   - Short and long descriptions
   - Image file references
   - Auto-deletion of images on update/delete

### ✅ Authentication & Security

- JWT token-based authentication
- Bcrypt password hashing
- Protected API routes
- Token expiration (configurable, default 24h)
- CORS support for frontend integration

### ✅ Complete CRUD Operations

All entities support:
- Create (POST)
- Read (GET) - single and list
- Update (PUT)
- Delete (DELETE)

### ✅ Image Management

- Upload images (multipart/form-data)
- Preview images (public endpoint)
- Delete images
- Auto-deletion when content is updated/deleted
- UUID-based filenames for uniqueness
- Filename sanitization for security

### ✅ Search Functionality

- Search across all three tables simultaneously
- Individual table searches
- LIKE-based matching on all text fields
- Single query parameter: `?q=keyword`

### ✅ Docker Support

- Complete docker-compose setup
- Backend Dockerfile with multi-stage build
- Volume mounts for persistent data
- Environment variable configuration

## Project Structure

```
backend/
├── src/
│   ├── main.rs              # Application entry point, routes
│   ├── db.rs                # Database initialization
│   ├── models/              # Data structures
│   │   ├── mod.rs
│   │   ├── agent.rs         # Agent entity
│   │   ├── page.rs          # Page entity
│   │   └── content.rs       # Content entity
│   ├── handlers/            # Request handlers
│   │   ├── mod.rs
│   │   ├── auth.rs          # Login & register
│   │   ├── agent.rs         # Agent CRUD
│   │   ├── page.rs          # Page CRUD
│   │   ├── content.rs       # Content CRUD
│   │   ├── image.rs         # Image upload/delete
│   │   └── search.rs        # Search functionality
│   └── auth/                # Authentication
│       ├── mod.rs
│       ├── jwt.rs           # Token generation/validation
│       └── middleware.rs    # Auth middleware
├── migrations/
│   └── 001_init.sql         # Database schema
├── Cargo.toml               # Dependencies
├── Dockerfile               # Container build
└── .env                     # Configuration
```

## Technology Stack

- **Language**: Rust 1.75+
- **Web Framework**: Actix-web 4.4
- **Database**: SQLite with SQLx
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Async Runtime**: Tokio
- **Serialization**: Serde

## Key Dependencies

```toml
actix-web = "4.4"           # Web framework
actix-multipart = "0.6"     # File uploads
actix-cors = "0.7"          # CORS support
sqlx = "0.7"                # SQL toolkit
jsonwebtoken = "9.2"        # JWT handling
bcrypt = "0.15"             # Password hashing
uuid = "1.6"                # Unique IDs
sanitize-filename = "0.5"   # Security
```

## API Endpoints Summary

### Public Endpoints
- `POST /api/auth/register` - Register new agent
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/images/{filename}` - View images

### Protected Endpoints (Require JWT)
- `/api/agents/*` - Agent management (5 endpoints)
- `/api/pages/*` - Page CRUD (5 endpoints)
- `/api/contents/*` - Content CRUD (6 endpoints)
- `/api/images/*` - Image upload/delete (2 endpoints)
- `/api/search/*` - Search functionality (3 endpoints)

**Total: 23 API endpoints**

## Database Features

- Auto-incrementing primary keys
- Foreign key constraints with CASCADE delete
- Timestamps (created_at, updated_at)
- Indexes on frequently queried fields
- Automatic schema initialization
- Support for SQLite JSON functions

## Security Features

✓ Password hashing with bcrypt
✓ JWT token authentication
✓ Protected API routes
✓ SQL injection prevention (parameterized queries)
✓ Filename sanitization
✓ CORS configuration
✓ Environment-based secrets

## Quick Start

```bash
# 1. Setup
./setup.sh

# 2. Run with Docker
docker-compose up -d

# 3. Test the API
./test_api.sh
```

## Development Workflow

```bash
# Local development
cd backend
cargo run

# Watch mode (with cargo-watch)
cargo watch -x run

# Build release
cargo build --release

# Run tests
cargo test
```

## File Organization

- **Models**: Data structures and validation
- **Handlers**: Business logic and request handling
- **Auth**: JWT and authentication middleware
- **Migrations**: SQL schema definitions
- **Separate modules**: Clean, maintainable code structure

## Image Upload Flow

1. Client sends multipart/form-data
2. Backend generates UUID + timestamp filename
3. File saved to `data/images/` directory
4. Returns filename and path to client
5. Client stores path in content record
6. On update/delete, old images auto-removed

## Search Capabilities

Search query: `GET /api/search?q=keyword`

**Agents**: Searches in agent_number

**Pages**: Searches in page_name, section_name, lang, content_type, attributes

**Contents**: Searches in short_desc, long_desc, title, image_path

Returns all matching records grouped by entity type.

## Environment Configuration

All settings configurable via `.env`:
- Database path
- JWT secret and expiration
- Server host and port
- Upload directory
- Logging level

## Production Considerations

1. **Change JWT_SECRET** to a long random string
2. Consider using PostgreSQL for production (easy SQLx migration)
3. Add rate limiting middleware
4. Implement proper logging and monitoring
5. Use HTTPS/TLS for API endpoint
6. Add request validation middleware
7. Consider adding API versioning

## Testing

Included test script (`test_api.sh`) covers:
- Agent registration
- Login and token retrieval
- Page creation
- Content creation
- Search functionality
- Update operations

## Documentation

- `README.md` - Comprehensive guide
- `API_QUICK_REFERENCE.md` - Quick API reference
- `PROJECT_OVERVIEW.md` - This file
- Code comments in complex sections

## Next Steps for Frontend Integration

1. Use the JWT token from login response
2. Add `Authorization: Bearer <token>` header to all protected requests
3. Handle 401 responses (token expired/invalid)
4. Implement image preview using `/api/images/{filename}`
5. Use search endpoint for filtering

## Maintenance

- Database auto-initializes on first run
- Images stored in persistent volume
- SQLite file persists in `data/db/`
- Easy backup: copy `data/` directory

## Performance Notes

- SQLite is file-based (single connection recommended)
- Indexes on frequently queried fields
- Efficient LIKE queries for search
- Async/await throughout for concurrency
- Multi-stage Docker build for smaller images

## License

MIT
