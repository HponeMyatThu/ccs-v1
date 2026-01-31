# API Quick Reference

Base URL: `http://localhost:8080/api`

## Authentication

### Register
```bash
POST /api/auth/register
{
  "agent_number": "AGT001",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
{
  "agent_number": "AGT001",
  "password": "password123"
}
→ Returns: { "token": "...", "agent": {...} }
```

## Protected Endpoints
Add header: `Authorization: Bearer <token>`

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/me` - Get current agent
- `GET /api/agents/{id}` - Get agent by ID
- `PUT /api/agents/{id}` - Update agent status
- `DELETE /api/agents/{id}` - Delete agent

### Pages
- `POST /api/pages` - Create page
- `GET /api/pages` - List all pages
- `GET /api/pages/{id}` - Get page by ID
- `PUT /api/pages/{id}` - Update page
- `DELETE /api/pages/{id}` - Delete page

### Contents
- `POST /api/contents` - Create content
- `GET /api/contents` - List all contents
- `GET /api/contents/{id}` - Get content by ID
- `GET /api/contents/ref/{ref_id}` - Get contents by page reference
- `PUT /api/contents/{id}` - Update content (auto-deletes old image)
- `DELETE /api/contents/{id}` - Delete content (deletes image too)

### Images
- `POST /api/images/upload` - Upload image (multipart/form-data)
- `GET /api/images/{filename}` - Get image (public)
- `DELETE /api/images/{filename}` - Delete image

### Search
- `GET /api/search?q=keyword` - Search all tables
- `GET /api/search/pages?q=keyword` - Search pages only
- `GET /api/search/contents?q=keyword` - Search contents only

## Example Requests

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"agent_number":"AGT001","password":"test123"}' \
  | jq -r '.token')

# Create page
curl -X POST http://localhost:8080/api/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "page_name": "home",
    "section_name": "hero",
    "lang": "en",
    "content_type": "h1",
    "visible": true,
    "display_order": 1
  }'

# Upload image
curl -X POST http://localhost:8080/api/images/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@image.jpg"

# Create content
curl -X POST http://localhost:8080/api/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ref_id": 1,
    "title": "Welcome",
    "short_desc": "Welcome message",
    "long_desc": "Detailed welcome...",
    "image_path": "uuid_timestamp.jpg"
  }'

# Search
curl "http://localhost:8080/api/search?q=welcome" \
  -H "Authorization: Bearer $TOKEN"
```

## Notes
- All timestamps are in ISO 8601 format
- Images are auto-deleted when content is updated or deleted
- Search uses LIKE matching (case-insensitive on most systems)
- JWT tokens expire after 24 hours by default
