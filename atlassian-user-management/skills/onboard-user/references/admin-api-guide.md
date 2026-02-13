# Atlassian Admin API Reference

Complete guide to using Atlassian's Admin API for user management operations.

## API Endpoints

### Base URL
```
https://api.atlassian.com
```

All Admin API requests require:
- `Authorization: Bearer {API_TOKEN}` header
- `Accept: application/json` header
- `Content-Type: application/json` header

## User Management Endpoints

### 1. Create User

**Endpoint**: `POST /users`

**Request Body**:
```json
{
  "email": "user@company.com",
  "display_name": "Jane Doe",
  "products": ["jira-software", "confluence"]
}
```

**Response** (201 Created):
```json
{
  "account_id": "5b10ac8d82e05b22cc7d4ef5",
  "email": "user@company.com",
  "display_name": "Jane Doe",
  "active": true
}
```

**MCP Tool Call**:
```javascript
await mcp.callTool("atlassian_admin_create_user", {
  email: "user@company.com",
  displayName: "Jane Doe",
  products: ["jira-software", "confluence"]
});
```

### 2. Add User to Group

**Endpoint**: `POST /admin/v1/orgs/{cloudId}/users/{accountId}/groups`

**Request Body**:
```json
{
  "group_id": "f8e9d7c6-b5a4-3210-9876-fedcba098765"
}
```

**MCP Tool Call**:
```javascript
await mcp.callTool("atlassian_admin_add_to_group", {
  cloudId: process.env.ATLASSIAN_CLOUD_ID,
  accountId: "5b10ac8d82e05b22cc7d4ef5",
  groupName: "jira-software-users"
});
```

### 3. Grant Project Access

**Endpoint**: `POST /rest/api/3/project/{projectIdOrKey}/role/{roleId}`

**Request Body**:
```json
{
  "user": ["5b10ac8d82e05b22cc7d4ef5"]
}
```

**Available Roles**:
- `10002` - Administrator
- `10001` - Developer
- `10000` - Viewer

**MCP Tool Call**:
```javascript
await mcp.callTool("atlassian_admin_grant_project_access", {
  cloudId: process.env.ATLASSIAN_CLOUD_ID,
  projectKey: "ENG",
  accountId: "5b10ac8d82e05b22cc7d4ef5",
  roleId: "10001" // Developer
});
```

### 4. Set Confluence Space Permissions

**Endpoint**: `POST /wiki/rest/api/space/{spaceKey}/permission`

**Request Body**:
```json
{
  "subject": {
    "type": "user",
    "identifier": "5b10ac8d82e05b22cc7d4ef5"
  },
  "operation": {
    "key": "read",
    "target": "space"
  }
}
```

**Permission Operations**:
- `read` - View space content
- `write` - Create/edit pages
- `admin` - Manage space settings

**MCP Tool Call**:
```javascript
await mcp.callTool("atlassian_admin_set_confluence_permissions", {
  cloudId: process.env.ATLASSIAN_CLOUD_ID,
  spaceKey: "TEAM",
  accountId: "5b10ac8d82e05b22cc7d4ef5",
  permissions: ["read", "write"]
});
```

## Error Handling

### Common Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| 400 | Bad Request | Validate input parameters |
| 401 | Unauthorized | Check API token and email |
| 403 | Forbidden | User lacks admin permissions |
| 404 | Not Found | Verify cloud ID, project key, or space key |
| 409 | Conflict | User already exists or already has access |
| 429 | Rate Limited | Implement exponential backoff |

### Error Response Format

```json
{
  "errorMessages": ["User with email user@company.com already exists"],
  "errors": {}
}
```

## Rate Limits

- **User creation**: 60 requests per hour
- **Group operations**: 600 requests per hour
- **Project/space permissions**: 300 requests per hour

**Best Practice**: Batch operations when possible and implement retry logic with exponential backoff.

## Implementation Pattern

When implementing onboarding:

1. **Validate template** - Check all required fields exist
2. **Check for existing user** - Search by email before creating
3. **Create user account** - Use Admin API
4. **Wait for account activation** - Poll status endpoint (usually instant)
5. **Add to groups** - Iterate through template groups
6. **Grant project access** - For each project in template
7. **Set Confluence permissions** - For each space in template
8. **Send notification** - Email or Slack message
9. **Log results** - Record what was done for audit trail

## Security Best Practices

1. **Use environment variables** for credentials, never hardcode
2. **Validate all inputs** before making API calls
3. **Use HTTPS** for all requests
4. **Rotate API tokens** regularly (every 90 days recommended)
5. **Implement least-privilege access** - only grant necessary permissions
6. **Audit regularly** - Review who has admin API access

## Testing

Use Atlassian's sandbox environments for testing:
- Create a test cloud instance
- Generate separate API tokens for dev/staging/prod
- Test all error scenarios before production use
