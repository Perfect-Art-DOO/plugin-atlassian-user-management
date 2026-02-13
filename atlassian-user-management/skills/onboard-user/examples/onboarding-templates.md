# Onboarding Template Examples

Complete YAML templates for common roles in your organization.

## Template Structure

Every onboarding template should include:

```yaml
role: Display name for this role
description: Brief explanation of what this role does
groups:
  - list-of-group-names
projects:
  - key: PROJECT_KEY
    role: Role name (Developer, Viewer, Administrator)
confluence_spaces:
  - key: SPACE_KEY
    permission: read | write | admin
notification:
  send: true | false
  template: template-name
  channels:
    - email
    - slack
```

## Example 1: Software Engineer

**File**: `.claude/atlassian/onboarding/engineer.yml`

```yaml
role: Software Engineer
description: Full-stack developer with access to engineering projects and documentation

groups:
  - jira-software-users
  - confluence-users
  - developers
  - engineering-team

projects:
  - key: ENG
    role: Developer
    description: Main engineering project
  - key: INFRA
    role: Developer
    description: Infrastructure and DevOps
  - key: DOCS
    role: Contributor
    description: Technical documentation

confluence_spaces:
  - key: TEAM
    permission: write
    description: Team wiki and meeting notes
  - key: DOCS
    permission: write
    description: Technical documentation
  - key: ONBOARD
    permission: read
    description: Onboarding materials

notification:
  send: true
  template: welcome-engineer
  channels:
    - email
    - slack
  slack_channel: "#engineering-announcements"
  message: |
    Welcome {{name}} to the Engineering team! 🎉

    Your Atlassian accounts are ready:
    - Jira: Access to ENG, INFRA projects
    - Confluence: Write access to Team and Docs spaces

    Next steps:
    1. Complete security training
    2. Set up development environment
    3. Review the onboarding checklist in Confluence
```

## Example 2: Product Designer

**File**: `.claude/atlassian/onboarding/designer.yml`

```yaml
role: Product Designer
description: UI/UX designer with access to design and product projects

groups:
  - jira-software-users
  - confluence-users
  - design-team
  - product-team

projects:
  - key: DESIGN
    role: Administrator
    description: Design system and component library
  - key: PRODUCT
    role: Contributor
    description: Product requirements and roadmap
  - key: ENG
    role: Viewer
    description: View engineering tickets (no edit)

confluence_spaces:
  - key: DESIGN
    permission: admin
    description: Design documentation and guidelines
  - key: PRODUCT
    permission: write
    description: Product specs and user research
  - key: TEAM
    permission: write
    description: Team wiki

notification:
  send: true
  template: welcome-designer
  channels:
    - email
    - slack
  slack_channel: "#design-team"
```

## Example 3: Engineering Manager

**File**: `.claude/atlassian/onboarding/engineering-manager.yml`

```yaml
role: Engineering Manager
description: Manager with admin access to engineering projects and team spaces

groups:
  - jira-software-users
  - confluence-users
  - engineering-managers
  - project-admins

projects:
  - key: ENG
    role: Administrator
    description: Full admin access to engineering project
  - key: INFRA
    role: Administrator
    description: Infrastructure management
  - key: PRODUCT
    role: Contributor
    description: Input on product direction

confluence_spaces:
  - key: TEAM
    permission: admin
    description: Manage team space
  - key: LEADERSHIP
    permission: write
    description: Leadership documentation
  - key: DOCS
    permission: admin
    description: Technical documentation oversight

notification:
  send: true
  template: welcome-manager
  channels:
    - email
    - slack
  slack_channel: "#engineering-managers"
```

## Example 4: Contractor (Limited Access)

**File**: `.claude/atlassian/onboarding/contractor.yml`

```yaml
role: External Contractor
description: Limited access for external contractors on specific projects

groups:
  - jira-software-users
  - external-contractors

projects:
  - key: CONTRACTOR-PROJ
    role: Developer
    description: Dedicated contractor project

confluence_spaces:
  - key: CONTRACTOR-DOCS
    permission: read
    description: Project-specific documentation only

notification:
  send: true
  template: welcome-contractor
  channels:
    - email
  message: |
    Welcome to the project!

    Your access is limited to:
    - Jira project: CONTRACTOR-PROJ
    - Confluence space: CONTRACTOR-DOCS (read-only)

    Contact your project manager for questions.
```

## Example 5: Sales Team Member

**File**: `.claude/atlassian/onboarding/sales.yml`

```yaml
role: Sales Representative
description: Access to CRM integration and customer-facing documentation

groups:
  - jira-service-desk-users
  - confluence-users
  - sales-team

projects:
  - key: SALES
    role: Contributor
    description: Sales pipeline and opportunities
  - key: SUPPORT
    role: Viewer
    description: View customer support tickets

confluence_spaces:
  - key: SALES
    permission: write
    description: Sales playbooks and materials
  - key: PRODUCT
    permission: read
    description: Product information for demos
  - key: CUSTOMER
    permission: write
    description: Customer success stories

notification:
  send: true
  template: welcome-sales
  channels:
    - email
    - slack
  slack_channel: "#sales-team"
```

## Customization Guide

### Adding Custom Fields

You can extend templates with custom fields:

```yaml
custom_settings:
  default_dashboard: engineering-dashboard
  notification_preferences:
    email_digest: weekly
    mention_alerts: immediate
  integrations:
    slack_handle: "@jane.doe"
    github_username: "janedoe"
```

### Conditional Access

Use comments to document conditional logic:

```yaml
# Only grant INFRA access if engineer is on platform team
projects:
  - key: INFRA
    role: Developer
    condition: team == "platform"  # Interpreted by Claude during execution
```

### Template Variables

Use `{{variable}}` syntax for dynamic values:

```yaml
notification:
  message: |
    Welcome {{name}} to {{team_name}}!
    Your manager is {{manager_name}}.
    Start date: {{start_date}}
```

## Template Validation

Claude validates templates before execution:

- ✓ All required fields present
- ✓ Valid project keys and space keys
- ✓ Recognized group names
- ✓ Valid role names (Developer, Viewer, Administrator)
- ✓ Valid permission levels (read, write, admin)

If validation fails, Claude reports specific issues and asks for corrections.

## Usage Examples

### Standard onboarding:
```
User: "Onboard Alex Kim as a software engineer, email alex.kim@company.com"
Claude: [Loads engineer.yml template] "I'll onboard Alex as a Software Engineer with access to ENG, INFRA, and DOCS projects, plus write access to Team and Docs spaces. Proceed?"
User: "Yes"
Claude: [Executes onboarding] "✓ Alex Kim onboarded successfully. Account created, added to 4 groups, granted access to 3 projects and 3 Confluence spaces."
```

### Custom modifications:
```
User: "Onboard Maria as an engineer, but also give her admin access to the DESIGN project"
Claude: [Loads engineer.yml, notes customization] "I'll use the engineer template and also grant Administrator role on the DESIGN project. Confirm?"
User: "Yes"
Claude: [Executes with modification] "✓ Done. Maria has standard engineer access plus DESIGN admin."
```

### No template available:
```
User: "Onboard Chris as a data scientist"
Claude: "I don't have a template for 'data scientist'. I'll ask you about groups and projects. What groups should Chris be added to?"
User: "jira-users, confluence-users, and data-science-team"
Claude: "Got it. What projects?"
[Interactive flow continues]
Claude: "Would you like me to save this as a 'data-scientist.yml' template for future use?"
```
