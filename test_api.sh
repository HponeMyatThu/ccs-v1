#!/bin/bash

BASE_URL="http://localhost:8080/api"

echo "=== Testing Rust Backend API ==="
echo ""

echo "1. Registering new agent..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_number": "TST001",
    "password": "test12345",
    "is_active": true
  }')
echo "Response: $REGISTER_RESPONSE"
echo ""

echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_number": "TST001",
    "password": "test12345"
  }')
echo "Response: $LOGIN_RESPONSE"
echo ""

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    echo "Failed to get token. Exiting."
    exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

echo "3. Getting current agent info..."
curl -s -X GET "$BASE_URL/agents/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "4. Creating a page..."
PAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/pages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "page_name": "test-page",
    "section_name": "header",
    "lang": "en",
    "content_type": "h1",
    "visible": true,
    "display_order": 1
  }')
echo "Response: $PAGE_RESPONSE"
PAGE_ID=$(echo $PAGE_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*$')
echo ""

echo "5. Getting all pages..."
curl -s -X GET "$BASE_URL/pages" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "6. Creating content..."
CONTENT_RESPONSE=$(curl -s -X POST "$BASE_URL/contents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"ref_id\": $PAGE_ID,
    \"title\": \"Test Content\",
    \"short_desc\": \"This is a test content\",
    \"long_desc\": \"This is a longer description of the test content with more details.\"
  }")
echo "Response: $CONTENT_RESPONSE"
CONTENT_ID=$(echo $CONTENT_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*$')
echo ""

echo "7. Getting all contents..."
curl -s -X GET "$BASE_URL/contents" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "8. Searching for 'test'..."
curl -s -X GET "$BASE_URL/search?q=test" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "9. Updating content..."
curl -s -X PUT "$BASE_URL/contents/$CONTENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Content"
  }' | jq .
echo ""

echo "10. Getting updated content..."
curl -s -X GET "$BASE_URL/contents/$CONTENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== All tests completed! ==="
