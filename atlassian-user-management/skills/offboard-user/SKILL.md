---
name: offboard-user
description: Automate employee offboarding in Atlassian by deactivating accounts, removing from groups/projects, transferring ownership, and documenting work using YAML workflow templates. Use this skill when the user says "offboard a user", "deactivate employee", "remove team member access", "employee leaving", "transfer ownership", or when someone's employment ends and their Atlassian access needs to be revoked.
---

# Offboard User - Atlassian User Management

Automates the complete offboarding process for departing Atlassian users using configurable YAML templates.

## What This Skill Does

When offboarding a team member from Atlassian:

1. **Reads workflow templates** from `.claude/atlassian/offboarding/*.yml`
2. **Transfers ownership** of their Jira issues, Confluence pages, and filters
3. **Documents their work** by creating a transition page/issue
4. **Removes from groups** systematically
5. **Revokes project access** across all projects
6. **Deactivates the account** (or suspends if data retention needed)
7. **Archives user data** according to company policy

## Template-Driven Workflow

Templates are stored in `.claude/atlassian/offboarding/` and define the offboarding process:

```yaml
# Example: standard-offboarding.yml
process_name: Standard Employee Offboarding
ownership_transfer:
  jira_issues:
    assigned: transfer_to_manager
    watching: keep_subscriptions
  confluence:
    owned_pages: transfer_to_manager
    space_admin: transfer_to_team_lead
documentation:
  create_transition_page: true
  confluence_space: TEAM
  include:
    - open_issues
    - recent_pages
    - key_contributions
access_removal:
  remove_groups: all
  revoke_projects: all
  deactivate_account: true
  retention_period: 90_days
notification:
  notify_manager: true
  notify_team: true
  channels:
    - email
    - slack
```

## Usage Flow

1. **User request**: "Offboard John Smith, manager is Sarah Chen, last day is next Friday"

2. **Claude actions**:
   - Loads offboarding template
   - Confirms transfer recipient (manager or specific person)
   - Searches for all user's Jira assignments, Confluence pages, filters
   - Creates transition documentation
   - Transfers ownership of issues and pages
   - Removes from all groups and projects
   - Deactivates account (immediate or scheduled)
   - Sends notifications to manager and team

3. **Output**: Summary report with:
   - Items transferred (X issues, Y pages)
   - Documentation links
   - Access removed (groups, projects)
   - Account status

## Required Setup

### MCP Server Configuration

This skill requires the Atlassian MCP server extended with Admin API capabilities:

- `atlassian_admin_transfer_ownership` - Transfer issues and pages
- `atlassian_admin_remove_from_group` - Remove from groups
- `atlassian_admin_revoke_access` - Remove project access
- `atlassian_admin_deactivate_user` - Deactivate account

### Authentication

Same environment variables as onboarding:

```bash
ATLASSIAN_API_EMAIL=your-admin@company.com
ATLASSIAN_API_TOKEN=your-api-token
ATLASSIAN_CLOUD_ID=your-cloud-id
```

### Template Directory

```bash
mkdir -p .claude/atlassian/offboarding
```

## Safety Features

### Confirmation Required

Before deactivating accounts, Claude:
1. Shows preview of all changes
2. Asks for explicit confirmation
3. Offers to schedule deactivation for future date
4. Confirms transfer recipients

### Reversibility Options

- **Suspend instead of deactivate**: Keeps account for 90 days
- **Export user data**: Download all user content before removal
- **Audit trail**: Records all actions taken

### Validation Checks

Before executing:
- ✓ Transfer recipient exists and has appropriate access
- ✓ All open issues are transferred or closed
- ✓ Critical pages have new owners
- ✓ Admin roles are reassigned

## Offboarding Scenarios

### Standard Departure (Planned)

Employee leaving on good terms with advance notice:
- Transfer all work to manager
- Create comprehensive transition document
- Remove access on last day
- Keep account suspended for 90 days

### Immediate Termination

Urgent access removal:
- Deactivate account immediately
- Transfer critical work only
- Remove all access within minutes
- Document actions taken

### Contractor End-of-Contract

Limited access removal:
- Remove from project-specific groups
- Keep account active if returning
- Export their contributions
- Update status to "inactive contractor"

## Documentation Output

Claude generates a transition document in Confluence:

```markdown
# Transition Document: John Smith

**Status**: Offboarded
**Last Day**: January 15, 2026
**Manager**: Sarah Chen

## Open Work Items

### Jira Issues (15 transferred)
- [ENG-123] API refactoring → Transferred to Sarah Chen
- [ENG-456] Database migration → Transferred to Alex Kim
- ...

### Confluence Pages (23 pages)
- Engineering Standards → Ownership: Sarah Chen
- API Documentation → Ownership: Engineering Team
- ...

## Key Contributions
- Led migration to microservices architecture
- Created developer onboarding guide
- Mentored 3 junior engineers

## Access Removed
- Groups: developers, engineering-team, confluence-users
- Projects: ENG (Developer), INFRA (Viewer)
- Account: Deactivated on 2026-01-15
```

## Error Handling

- **User not found**: Verifies email/account ID before proceeding
- **Transfer recipient unavailable**: Asks for alternative recipient
- **Open critical issues**: Warns and asks how to handle
- **API rate limits**: Implements automatic retry with backoff

## Integration with Other Tools

Works seamlessly with:
- **HR systems**: Can trigger from HRIS webhooks
- **Slack**: Posts notifications and goodbye messages
- **Email**: Sends transition docs to manager
- **GitHub**: Can also remove repository access if configured

## Examples

See `examples/offboarding-scenarios.md` for:
- Complete YAML templates for different scenarios
- Step-by-step walkthroughs
- Transfer ownership patterns
- Compliance considerations

## Related Skills

- **onboard-user**: Set up new employees with Atlassian access
- **atlassian:generate-status-report**: Review user's contribution history
- **atlassian:search-company-knowledge**: Find user's documentation
