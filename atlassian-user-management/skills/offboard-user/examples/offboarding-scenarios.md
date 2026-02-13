# Offboarding Template Examples

Complete YAML templates for different offboarding scenarios.

## Template Structure

```yaml
process_name: Display name for this offboarding type
description: When to use this template
ownership_transfer:
  jira_issues:
    assigned: strategy (transfer_to_manager | transfer_to_specific | close_all)
    watching: strategy (keep_subscriptions | remove_all)
    reported: strategy (keep_reporter | transfer)
  confluence:
    owned_pages: strategy (transfer_to_manager | transfer_to_team | archive)
    space_admin: strategy (transfer_to_team_lead | remove_only)
  filters_dashboards:
    private: strategy (delete | archive)
    shared: strategy (transfer_ownership | make_system_owned)
documentation:
  create_transition_page: true | false
  confluence_space: SPACE_KEY
  include:
    - open_issues
    - recent_pages
    - key_contributions
    - contact_info
access_removal:
  remove_groups: all | specific_list
  revoke_projects: all | specific_list
  deactivate_account: true | false
  timing: immediate | scheduled | manual
  retention_period: days
notification:
  notify_manager: true | false
  notify_team: true | false
  channels:
    - email
    - slack
  message_template: template_name
```

## Example 1: Standard Planned Departure

**File**: `.claude/atlassian/offboarding/standard-departure.yml`

```yaml
process_name: Standard Employee Departure
description: Employee leaving on good terms with 2+ weeks notice

ownership_transfer:
  jira_issues:
    assigned: transfer_to_manager
    watching: keep_subscriptions
    reported: keep_reporter
  confluence:
    owned_pages: transfer_to_manager
    space_admin: transfer_to_team_lead
  filters_dashboards:
    private: archive
    shared: transfer_ownership

documentation:
  create_transition_page: true
  confluence_space: TEAM
  page_title: "Transition: {{employee_name}}"
  include:
    - open_issues
    - recent_pages
    - key_contributions
    - ongoing_projects
    - contact_info
  template: |
    # Transition Document: {{employee_name}}

    **Status**: Departed
    **Last Day**: {{last_day}}
    **Manager**: {{manager_name}}
    **New Contact**: {{new_contact}}

    ## Work Transfer Summary

    ### Open Jira Issues
    {{jira_issues_transferred}}

    ### Confluence Pages
    {{confluence_pages_transferred}}

    ### Key Ongoing Projects
    {{ongoing_projects}}

    ## Knowledge Transfer Notes
    {{knowledge_transfer_notes}}

access_removal:
  remove_groups: all
  revoke_projects: all
  deactivate_account: true
  timing: scheduled  # On last_day
  retention_period: 90  # Keep account suspended for 90 days

notification:
  notify_manager: true
  notify_team: true
  channels:
    - email
    - slack
  slack_channel: "{{team_channel}}"
  message_template: standard-goodbye
  message: |
    {{employee_name}} has left the team as of {{last_day}}.

    Their work has been transferred to {{manager_name}}.
    Transition document: {{transition_doc_link}}

    Questions? Contact {{manager_name}} or {{new_contact}}.
```

## Example 2: Immediate Termination

**File**: `.claude/atlassian/offboarding/immediate-termination.yml`

```yaml
process_name: Immediate Termination
description: Urgent access removal required immediately

ownership_transfer:
  jira_issues:
    assigned: transfer_to_manager
    watching: remove_all
    reported: keep_reporter
  confluence:
    owned_pages: transfer_to_manager
    space_admin: transfer_to_team_lead
  filters_dashboards:
    private: delete
    shared: transfer_ownership

documentation:
  create_transition_page: true
  confluence_space: TEAM-INTERNAL  # Restricted space
  page_permissions: managers_only
  include:
    - open_issues
    - critical_work_only
  note: "Minimal documentation for immediate termination"

access_removal:
  remove_groups: all
  revoke_projects: all
  deactivate_account: true
  timing: immediate  # Execute immediately
  retention_period: 0  # No retention, immediate deactivation

notification:
  notify_manager: true
  notify_team: false  # Manager handles team communication
  notify_hr: true
  channels:
    - email
  message_template: confidential-offboarding

audit:
  log_all_actions: true
  create_audit_report: true
  notify_security: true
```

## Example 3: Contractor End-of-Contract

**File**: `.claude/atlassian/offboarding/contractor-end.yml`

```yaml
process_name: Contractor End of Contract
description: Limited access removal for external contractors

ownership_transfer:
  jira_issues:
    assigned: transfer_to_specific  # Specify project manager
    watching: remove_all
    reported: keep_reporter
  confluence:
    owned_pages: transfer_to_team
    space_admin: not_applicable
  filters_dashboards:
    private: delete
    shared: not_applicable

documentation:
  create_transition_page: true
  confluence_space: CONTRACTOR-DOCS
  include:
    - open_issues
    - completed_work
    - deliverables
  export_user_content: true  # Export for records

access_removal:
  remove_groups:
    - external-contractors
    - contractor-project-team
  revoke_projects:
    - CONTRACTOR-PROJ
  deactivate_account: false  # Keep account for potential return
  mark_as_inactive: true
  timing: end_of_contract_date

notification:
  notify_manager: true
  notify_contractor: true
  channels:
    - email
  message_template: contractor-completion
  message: |
    Thank you for your work on {{project_name}}.

    Your Atlassian access has been adjusted:
    - Project access removed: {{projects_removed}}
    - Account status: Inactive (can be reactivated if needed)

    Deliverables summary: {{transition_doc_link}}
```

## Example 4: Role Change (Internal Transfer)

**File**: `.claude/atlassian/offboarding/role-change.yml`

```yaml
process_name: Internal Role Change
description: Employee moving to different team/role within company

ownership_transfer:
  jira_issues:
    assigned: transfer_to_team_lead
    watching: keep_subscriptions
    reported: keep_reporter
  confluence:
    owned_pages: transfer_to_team
    space_admin: transfer_to_replacement
  filters_dashboards:
    private: keep  # User keeps their filters
    shared: transfer_ownership

documentation:
  create_transition_page: true
  confluence_space: TEAM
  include:
    - open_issues
    - ongoing_projects
    - knowledge_transfer
    - new_role_info
  message: |
    {{employee_name}} is moving to {{new_team}} as {{new_role}}.
    Transition effective: {{effective_date}}

access_removal:
  remove_groups:
    - old-team-specific-groups
  revoke_projects:
    - OLD-TEAM-PROJECT
  keep_base_access: true  # Keep jira-users, confluence-users
  deactivate_account: false

  add_new_access:
    groups:
      - new-team-groups
    projects:
      - NEW-TEAM-PROJECT

notification:
  notify_old_manager: true
  notify_new_manager: true
  notify_both_teams: true
  channels:
    - email
    - slack
  message_template: internal-transfer
```

## Example 5: Extended Leave (Temporary)

**File**: `.claude/atlassian/offboarding/extended-leave.yml`

```yaml
process_name: Extended Leave (Temporary)
description: Employee on extended leave (parental, medical, sabbatical)

ownership_transfer:
  jira_issues:
    assigned: transfer_to_coverage
    watching: keep_subscriptions
    reported: keep_reporter
  confluence:
    owned_pages: add_co_owner  # Don't transfer, add backup owner
    space_admin: add_co_admin
  filters_dashboards:
    private: keep
    shared: keep

documentation:
  create_transition_page: true
  confluence_space: TEAM
  page_title: "Coverage Plan: {{employee_name}}"
  include:
    - open_issues
    - ongoing_projects
    - coverage_person
    - return_date
  template: |
    # Coverage Plan: {{employee_name}}

    **Status**: On Leave
    **Leave Start**: {{leave_start}}
    **Expected Return**: {{return_date}}
    **Coverage**: {{coverage_person}}

    ## Work Coverage
    {{coverage_details}}

    ## Contact Policy
    {{contact_instructions}}

access_removal:
  suspend_account: true  # Temporarily suspend
  remove_groups: none
  revoke_projects: none
  timing: scheduled
  restore_date: "{{return_date}}"  # Auto-restore on return

notification:
  notify_manager: true
  notify_team: true
  notify_coverage: true
  channels:
    - email
    - slack
  message_template: extended-leave
  message: |
    {{employee_name}} is on leave from {{leave_start}} to {{return_date}}.

    Coverage: {{coverage_person}}
    Work transition: {{transition_doc_link}}

    Please direct questions to {{coverage_person}}.
```

## Customization Guide

### Transfer Strategies

**For Jira Issues:**
- `transfer_to_manager` - Assigns all to direct manager
- `transfer_to_specific` - Prompts for specific recipient
- `distribute_by_component` - Distributes by component owner
- `close_all` - Closes all open issues (with reason)

**For Confluence Pages:**
- `transfer_to_manager` - Manager becomes owner
- `transfer_to_team` - Team lead becomes owner
- `archive` - Moves to archive space
- `add_co_owner` - Adds owner without removing original

### Timing Options

```yaml
timing: immediate           # Execute right now
timing: scheduled           # Execute on specific date/time
timing: manual              # Prepare but wait for manual trigger
timing: business_hours      # Wait until next business hours
```

### Notification Templates

Create custom templates in `.claude/atlassian/notification-templates/`:

```yaml
# goodbye-message.yml
subject: "{{employee_name}} Departure"
body: |
  Team,

  {{employee_name}} has left the team as of {{last_day}}.
  {{transition_summary}}

  {{custom_message}}

  Questions? Contact {{manager_name}}.
```

## Safety Checks

Before executing, Claude validates:

✓ Transfer recipient exists and has necessary permissions
✓ Critical open issues are addressed
✓ Confluence pages have new owners
✓ Timing is appropriate (not middle of night, etc.)
✓ Required approvals obtained (for terminations)

## Usage Examples

### Standard departure:
```
User: "Offboard David Lee, last day is January 31st, manager is Emily Park"
Claude: [Loads standard-departure.yml] "I'll offboard David Lee using the standard process. Transfer work to Emily Park, create transition document, remove access on Jan 31. Confirm?"
User: "Yes"
Claude: "✓ Offboarding configured. Will execute on January 31, 2026. Transition document: [link]"
```

### Immediate termination:
```
User: "Need to immediately offboard user john.smith@company.com - urgent"
Claude: [Loads immediate-termination.yml] "This is an immediate termination. I'll deactivate the account now and transfer critical work to their manager. This is irreversible - confirm?"
User: "Confirmed"
Claude: [Executes immediately] "✓ Account deactivated. 8 issues transferred, 12 pages transferred. Audit report: [link]"
```

### Internal transfer:
```
User: "Maria is moving from Engineering to Product team next month"
Claude: [Loads role-change.yml] "I'll transition Maria's access from Engineering to Product. Keep her existing account, transfer current work to eng team, add Product access. Confirm?"
User: "Yes, and make sure she keeps access to DOCS project"
Claude: "Got it - added DOCS project to 'keep' list. Ready to execute on transition date."
```
