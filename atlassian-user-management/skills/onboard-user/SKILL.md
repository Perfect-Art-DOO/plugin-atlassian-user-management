---
name: onboard-user
description: Automate new employee onboarding in Atlassian by creating user accounts, assigning to groups and projects, and provisioning access based on YAML workflow templates. Use this skill when the user says "onboard a new user", "set up new employee", "add new team member", "provision user access", "create Atlassian account", or when a new hire needs Jira/Confluence access. Handles role-based templates (engineer, designer, manager) stored in .claude/atlassian/ directory.
---

# Onboard User - Atlassian User Management

Automates the complete onboarding process for new Atlassian users using configurable YAML templates.

## What This Skill Does

When onboarding a new team member to Atlassian:

1. **Reads workflow templates** from `.claude/atlassian/onboarding/*.yml`
2. **Creates the user account** using Atlassian Admin API
3. **Assigns to groups** (e.g., jira-users, confluence-users, team-engineering)
4. **Grants project access** with appropriate roles
5. **Sets default permissions** for Confluence spaces
6. **Sends welcome notification** via email or Slack

## Template-Driven Workflow

Templates are stored in `.claude/atlassian/onboarding/` and define everything needed for a role:

```yaml
# Example: engineer.yml
role: Software Engineer
groups:
  - jira-software-users
  - confluence-users
  - developers
projects:
  - key: ENG
    role: Developer
  - key: DOCS
    role: Contributor
confluence_spaces:
  - key: TEAM
    permission: write
  - key: DOCS
    permission: write
notification:
  send: true
  template: welcome-engineer
```

## Usage Flow

1. **User request**: "Onboard Sarah Chen as a software engineer, email sarah.chen@company.com"

2. **Claude actions**:
   - Checks for `.claude/atlassian/onboarding/engineer.yml` template
   - If template exists: loads configuration and confirms with user
   - If no template: uses interactive mode to ask about groups, projects, permissions
   - Calls Atlassian Admin API to create user
   - Iterates through groups and adds user to each
   - Grants project access with specified roles
   - Sets Confluence space permissions
   - Sends welcome notification

3. **Output**: Confirmation summary with account details and access granted

## Required Setup

### MCP Server Configuration

This skill requires the Atlassian MCP server to be extended with Admin API capabilities. The plugin includes an `.mcp.json` configuration that adds these tools:

- `atlassian_admin_create_user` - Create new user accounts
- `atlassian_admin_add_to_group` - Add users to groups
- `atlassian_admin_grant_project_access` - Assign project roles
- `atlassian_admin_set_confluence_permissions` - Grant space access

### Authentication

Set these environment variables:

```bash
ATLASSIAN_API_EMAIL=your-admin@company.com
ATLASSIAN_API_TOKEN=your-api-token
ATLASSIAN_CLOUD_ID=your-cloud-id
```

Generate an API token at: https://id.atlassian.com/manage-profile/security/api-tokens

### Template Directory

Create the template directory in your project:

```bash
mkdir -p .claude/atlassian/onboarding
```

Add template files for each role (see `examples/` directory for samples).

## Interactive vs Template Mode

**Template Mode** (recommended):
- Fast: one confirmation, then automated execution
- Consistent: same setup for every engineer/designer/etc.
- Auditable: templates in version control

**Interactive Mode** (fallback):
- Used when no template exists for the requested role
- Claude asks about each group, project, and permission
- User can save the configuration as a new template

## Error Handling

Claude handles common scenarios:

- **User already exists**: Offers to update groups/projects instead
- **Missing template**: Falls back to interactive mode
- **Invalid group**: Lists available groups and asks for correction
- **API errors**: Reports the specific issue (auth, permissions, rate limits)

## Security Considerations

- Only Atlassian administrators can create users
- Templates should be reviewed before use
- API tokens should be kept secure (use environment variables)
- Audit logs are maintained by Atlassian automatically

## Examples

See `examples/onboarding-scenarios.md` for:
- Complete YAML templates for different roles
- Step-by-step walkthroughs
- Common customizations
- Troubleshooting guide

## Related Skills

- **offboard-user**: Remove access and transfer ownership when employees leave
- **atlassian:search-company-knowledge**: Find existing onboarding documentation
