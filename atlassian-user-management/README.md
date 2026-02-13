# Atlassian User Management Plugin

Automate Atlassian user onboarding and offboarding with YAML-based workflow templates for Jira and Confluence.

## Overview

This plugin extends Claude Cowork with skills to handle complete user lifecycle management in Atlassian:

- **Onboard new employees** - Create accounts, assign groups, grant project access
- **Offboard departing employees** - Transfer work, revoke access, deactivate accounts
- **Template-driven workflows** - YAML templates for consistent, role-based provisioning
- **Admin API integration** - Direct integration with Atlassian's Admin APIs

## Features

### Onboarding Skill

Automates new employee setup:
- Creates Atlassian user accounts
- Adds users to appropriate groups (developers, designers, etc.)
- Grants Jira project access with role-based permissions
- Sets Confluence space permissions
- Sends welcome notifications

### Offboarding Skill

Handles employee departures:
- Transfers Jira issue assignments
- Transfers Confluence page ownership
- Removes from all groups and projects
- Deactivates accounts (immediate or scheduled)
- Creates transition documentation
- Supports different scenarios (standard departure, immediate termination, contractors, role changes)

### Template System

Store reusable workflows in `.claude/atlassian/`:
- **Onboarding templates** - Define standard access for each role (engineer, designer, manager, etc.)
- **Offboarding templates** - Different processes for various departure scenarios
- **Consistent provisioning** - Same setup every time
- **Version controlled** - Track changes to access policies

## Installation

### 1. Install the Plugin

Download `atlassian-user-management.plugin` and open it in Claude Cowork. The plugin will install automatically.

### 2. Set Up Environment Variables

Create or update `.env` file with your Atlassian credentials:

```bash
# Atlassian Admin API credentials
ATLASSIAN_API_EMAIL=your-admin@company.com
ATLASSIAN_API_TOKEN=your-api-token
ATLASSIAN_CLOUD_ID=your-cloud-id
```

**How to get these values:**

- **API Token**: Generate at https://id.atlassian.com/manage-profile/security/api-tokens
- **Cloud ID**: Find in your Atlassian URL (https://YOUR-DOMAIN.atlassian.net → cloud ID is in admin settings)
- **API Email**: Your admin account email

> **Important**: You must be an Atlassian administrator to use these APIs.

### 3. Install MCP Server Dependencies

```bash
cd ~/.claude/plugins/atlassian-user-management/mcp-server
npm install
```

### 4. Create Template Directory

```bash
mkdir -p .claude/atlassian/{onboarding,offboarding}
```

### 5. Add Template Files

Copy example templates from `skills/*/examples/` to your `.claude/atlassian/` directory, or create your own based on the examples.

**Minimal onboarding template** (`.claude/atlassian/onboarding/engineer.yml`):

```yaml
role: Software Engineer
groups:
  - jira-software-users
  - confluence-users
  - developers
projects:
  - key: ENG
    role: Developer
confluence_spaces:
  - key: TEAM
    permission: write
notification:
  send: true
  channels:
    - email
```

## Usage

### Onboarding a New Employee

```
User: "Onboard Sarah Chen as a software engineer, email sarah.chen@company.com"
```

Claude will:
1. Load the `engineer.yml` template
2. Show you what access will be granted
3. Ask for confirmation
4. Create the account and grant all access
5. Send welcome notification

### Offboarding an Employee

```
User: "Offboard John Smith, manager is Emily Park, last day is January 31st"
```

Claude will:
1. Load the offboarding template
2. Find all John's Jira issues and Confluence pages
3. Transfer ownership to Emily Park
4. Create a transition document
5. Remove all access on January 31st

### Custom Modifications

You can customize on the fly:

```
User: "Onboard Alex as an engineer, but also give them admin access to the DESIGN project"
```

Claude applies the engineer template plus your customization.

## Template Examples

See detailed examples in:
- `skills/onboard-user/examples/onboarding-templates.md`
- `skills/offboard-user/examples/offboarding-scenarios.md`

## Security Considerations

### API Token Security

- Store tokens in environment variables, never commit to version control
- Use separate tokens for dev/staging/prod environments
- Rotate tokens every 90 days
- Only grant admin access to trusted users

### Permission Validation

Claude validates:
- Transfer recipients exist and have necessary permissions
- Critical work is assigned before deactivation
- Appropriate approvals for terminations

### Audit Trail

All actions are logged:
- Atlassian maintains automatic audit logs for all Admin API calls
- Transition documents record what was transferred and when
- Notification emails provide paper trail

## Troubleshooting

### "Missing environment variables" error

Ensure `.env` file contains all three required variables and is in the correct location.

### "User already exists" error

The user account already exists. Claude can offer to update their groups/projects instead.

### "Invalid group" error

The group name doesn't exist. Claude will list available groups for correction.

### "Permission denied" error

Your API token doesn't have admin permissions. Verify you're using an admin account.

### MCP server won't start

```bash
# Check Node.js version (must be 18+)
node --version

# Reinstall dependencies
cd ~/.claude/plugins/atlassian-user-management/mcp-server
rm -rf node_modules package-lock.json
npm install
```

## Advanced Configuration

### Custom Notification Templates

Create `.claude/atlassian/notification-templates/` with custom message templates:

```yaml
# welcome-engineer.yml
subject: "Welcome to Engineering!"
body: |
  Hi {{name}},

  Your Atlassian accounts are ready.
  {{access_summary}}

  Next steps: {{onboarding_checklist_link}}
```

### Integration with HR Systems

Trigger onboarding automatically from HRIS webhooks:
1. Set up webhook in your HRIS
2. Create a hook in this plugin that listens for new hire events
3. Automatically execute onboarding when someone starts

### Slack Integration

Connect with Slack MCP server to:
- Post welcome messages to team channels
- Send notifications about departures
- Create reminder tasks for managers

## API Reference

See `skills/onboard-user/references/admin-api-guide.md` for complete Atlassian Admin API documentation.

## Support

### Issues and Questions

- Review example templates in `skills/*/examples/`
- Check troubleshooting section above
- Consult Atlassian Admin API docs: https://developer.atlassian.com/cloud/admin/

### Customization

Need custom workflows? Create new templates or modify existing ones in `.claude/atlassian/`.

## License

Created for Perfect Art internal use.

## Version History

### 0.1.0 (Initial Release)
- Onboarding skill with YAML templates
- Offboarding skill with multiple scenarios
- Atlassian Admin API MCP server
- Example templates for common roles
