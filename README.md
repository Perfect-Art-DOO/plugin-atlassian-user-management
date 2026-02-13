# Atlassian User Management Plugin

A Claude Cowork plugin for automating Atlassian user lifecycle management with YAML-based workflow templates.

## Overview

This repository contains a Claude plugin that automates employee onboarding and offboarding in Atlassian environments (Jira and Confluence). It provides template-driven workflows for consistent user provisioning, access management, and account lifecycle operations.

## Key Features

- **Automated Onboarding** - Create user accounts, assign groups, and grant project access using role-based templates
- **Automated Offboarding** - Transfer work, revoke access, and deactivate accounts with configurable workflows
- **YAML Templates** - Define reusable workflows for different roles and scenarios
- **MCP Server Integration** - Direct integration with Atlassian Admin APIs via Model Context Protocol
- **Audit Trail** - Complete logging of all user management operations

## Repository Structure

```
plugin-atlassian-user-management/
├── atlassian-user-management/     # Main plugin directory
   ├── README.md                  # Complete plugin documentation
   ├── .mcp.json                  # MCP server configuration
   ├── mcp-server/                # Atlassian Admin API MCP server
   ├── skills/                    # Onboarding and offboarding skills
   └── templates/                 # Example YAML templates
```

## Quick Start

1. **Install the Plugin**
   - Download `atlassian-user-management.zip` (or build from source)
   - Open the `.plugin` file in Claude Cowork

2. **Configure Environment Variables**
   ```bash
   ATLASSIAN_API_EMAIL=your-admin@company.com
   ATLASSIAN_API_TOKEN=your-api-token
   ATLASSIAN_CLOUD_ID=your-cloud-id
   ```

3. **Install Dependencies**
   ```bash
   cd atlassian-user-management/mcp-server
   npm install
   ```

For complete installation instructions, usage examples, and template documentation, see the [main plugin README](./atlassian-user-management/README.md).

## Requirements

- **Claude Cowork** - Latest version with plugin support
- **Node.js** - Version 18 or higher
- **Atlassian Admin Access** - Required for API operations
- **Atlassian Cloud** - This plugin works with Atlassian Cloud instances

## Getting API Credentials

- **API Token**: Generate at https://id.atlassian.com/manage-profile/security/api-tokens
- **Cloud ID**: Found in Atlassian admin settings (https://YOUR-DOMAIN.atlassian.net)
- **API Email**: Your Atlassian administrator account email

> **Security Note**: You must be an Atlassian organization administrator to use the Admin APIs.

## Use Cases

### Onboarding
```
"Onboard Sarah Chen as a software engineer, email sarah.chen@company.com"
```
Automatically creates account, assigns to engineering groups, grants project access, and sends welcome notification.

### Offboarding
```
"Offboard John Smith, manager is Emily Park, last day is January 31st"
```
Transfers Jira issues and Confluence pages to manager, schedules access removal, and creates transition documentation.

## Documentation

- **[Plugin Documentation](./atlassian-user-management/README.md)** - Complete usage guide
- **[Onboarding Examples](./atlassian-user-management/skills/onboard-user/examples/)** - Template examples and scenarios
- **[Offboarding Examples](./atlassian-user-management/skills/offboard-user/examples/)** - Departure workflow templates
- **[Atlassian Admin API Reference](https://developer.atlassian.com/cloud/admin/)** - Official API documentation

## Development

### Building the Plugin

The plugin is packaged as a `.zip` file containing all necessary components:

```bash
cd atlassian-user-management
zip -r ../atlassian-user-management.zip .
```

### Project Structure

- **`mcp-server/`** - Node.js MCP server implementing Atlassian Admin API tools
- **`skills/`** - Claude skills for onboarding and offboarding workflows
- **`templates/`** - Example YAML templates for common roles and scenarios
- **`.mcp.json`** - MCP server configuration and environment variable mapping

### Testing

Test the MCP server independently:

```bash
cd atlassian-user-management/mcp-server
node atlassian-admin-server.js
```

## Security Considerations

- **API Tokens** - Store in environment variables, never commit to version control
- **Token Rotation** - Rotate API tokens every 90 days
- **Least Privilege** - Only grant admin access to trusted users
- **Audit Logs** - All operations are logged in Atlassian's audit trail

## Support

For issues, questions, or customization requests:

1. Review the [troubleshooting section](./atlassian-user-management/README.md#troubleshooting) in the main documentation
2. Check the example templates in `skills/*/examples/`
3. Consult the [Atlassian Admin API documentation](https://developer.atlassian.com/cloud/admin/)

## License

Created for Perfect Art internal use.

## Version

**0.1.0** - Initial release with onboarding, offboarding, and template system
