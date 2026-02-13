#!/usr/bin/env node

/**
 * Atlassian Admin API MCP Server
 *
 * Extends the Atlassian MCP connector with Admin API capabilities for user management.
 * Provides tools for creating users, managing groups, granting access, and handling offboarding.
 */

const { MCPServer } = require('@anthropic-ai/mcp-framework');
const axios = require('axios');

// Configuration from environment variables
const ATLASSIAN_API_EMAIL = process.env.ATLASSIAN_API_EMAIL;
const ATLASSIAN_API_TOKEN = process.env.ATLASSIAN_API_TOKEN;
const ATLASSIAN_CLOUD_ID = process.env.ATLASSIAN_CLOUD_ID;

if (!ATLASSIAN_API_EMAIL || !ATLASSIAN_API_TOKEN || !ATLASSIAN_CLOUD_ID) {
  console.error('Missing required environment variables: ATLASSIAN_API_EMAIL, ATLASSIAN_API_TOKEN, ATLASSIAN_CLOUD_ID');
  process.exit(1);
}

// Create Axios instance with authentication
const atlassianClient = axios.create({
  headers: {
    'Authorization': `Basic ${Buffer.from(`${ATLASSIAN_API_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString('base64')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Initialize MCP server
const server = new MCPServer({
  name: 'atlassian-admin',
  version: '1.0.0',
  description: 'Atlassian Admin API for user management operations'
});

/**
 * Tool: Create User
 * Creates a new Atlassian user account
 */
server.addTool({
  name: 'atlassian_admin_create_user',
  description: 'Create a new Atlassian user account',
  parameters: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'User email address'
      },
      displayName: {
        type: 'string',
        description: 'User display name'
      },
      products: {
        type: 'array',
        items: { type: 'string' },
        description: 'Products to grant access to (e.g., ["jira-software", "confluence"])'
      }
    },
    required: ['email', 'displayName']
  },
  handler: async ({ email, displayName, products = ['jira-software', 'confluence'] }) => {
    try {
      const response = await atlassianClient.post(
        'https://api.atlassian.com/users',
        {
          email,
          display_name: displayName,
          products
        }
      );

      return {
        success: true,
        accountId: response.data.account_id,
        email: response.data.email,
        displayName: response.data.display_name,
        message: `User ${displayName} created successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message
      };
    }
  }
});

/**
 * Tool: Add User to Group
 * Adds a user to an Atlassian group
 */
server.addTool({
  name: 'atlassian_admin_add_to_group',
  description: 'Add a user to an Atlassian group',
  parameters: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'User account ID'
      },
      groupName: {
        type: 'string',
        description: 'Name of the group to add user to'
      }
    },
    required: ['accountId', 'groupName']
  },
  handler: async ({ accountId, groupName }) => {
    try {
      await atlassianClient.post(
        `https://api.atlassian.com/rest/api/3/group/user?groupname=${encodeURIComponent(groupName)}`,
        { accountId }
      );

      return {
        success: true,
        message: `User added to group ${groupName}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message
      };
    }
  }
});

/**
 * Tool: Grant Project Access
 * Grants a user access to a Jira project with a specific role
 */
server.addTool({
  name: 'atlassian_admin_grant_project_access',
  description: 'Grant a user access to a Jira project with a specific role',
  parameters: {
    type: 'object',
    properties: {
      projectKey: {
        type: 'string',
        description: 'Project key (e.g., "ENG")'
      },
      accountId: {
        type: 'string',
        description: 'User account ID'
      },
      role: {
        type: 'string',
        enum: ['Administrator', 'Developer', 'Viewer'],
        description: 'Role to assign to the user'
      }
    },
    required: ['projectKey', 'accountId', 'role']
  },
  handler: async ({ projectKey, accountId, role }) => {
    try {
      // Map role names to role IDs
      const roleMap = {
        'Administrator': '10002',
        'Developer': '10001',
        'Viewer': '10000'
      };

      const roleId = roleMap[role];

      await atlassianClient.post(
        `https://api.atlassian.com/ex/jira/${ATLASSIAN_CLOUD_ID}/rest/api/3/project/${projectKey}/role/${roleId}`,
        {
          user: [accountId]
        }
      );

      return {
        success: true,
        message: `Granted ${role} access to project ${projectKey}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message
      };
    }
  }
});

/**
 * Tool: Set Confluence Permissions
 * Sets permissions for a user on a Confluence space
 */
server.addTool({
  name: 'atlassian_admin_set_confluence_permissions',
  description: 'Set permissions for a user on a Confluence space',
  parameters: {
    type: 'object',
    properties: {
      spaceKey: {
        type: 'string',
        description: 'Confluence space key'
      },
      accountId: {
        type: 'string',
        description: 'User account ID'
      },
      permissions: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['read', 'write', 'admin']
        },
        description: 'Permissions to grant (read, write, admin)'
      }
    },
    required: ['spaceKey', 'accountId', 'permissions']
  },
  handler: async ({ spaceKey, accountId, permissions }) => {
    try {
      const results = [];

      for (const permission of permissions) {
        await atlassianClient.post(
          `https://api.atlassian.com/ex/confluence/${ATLASSIAN_CLOUD_ID}/wiki/rest/api/space/${spaceKey}/permission`,
          {
            subject: {
              type: 'user',
              identifier: accountId
            },
            operation: {
              key: permission,
              target: 'space'
            }
          }
        );

        results.push(`${permission} permission granted`);
      }

      return {
        success: true,
        message: `Set ${permissions.join(', ')} permissions on space ${spaceKey}`,
        details: results
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
});

/**
 * Tool: Remove User from Group
 * Removes a user from an Atlassian group
 */
server.addTool({
  name: 'atlassian_admin_remove_from_group',
  description: 'Remove a user from an Atlassian group',
  parameters: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'User account ID'
      },
      groupName: {
        type: 'string',
        description: 'Name of the group to remove user from'
      }
    },
    required: ['accountId', 'groupName']
  },
  handler: async ({ accountId, groupName }) => {
    try {
      await atlassianClient.delete(
        `https://api.atlassian.com/rest/api/3/group/user?groupname=${encodeURIComponent(groupName)}&accountId=${accountId}`
      );

      return {
        success: true,
        message: `User removed from group ${groupName}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message
      };
    }
  }
});

/**
 * Tool: Deactivate User
 * Deactivates an Atlassian user account
 */
server.addTool({
  name: 'atlassian_admin_deactivate_user',
  description: 'Deactivate an Atlassian user account',
  parameters: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'User account ID to deactivate'
      }
    },
    required: ['accountId']
  },
  handler: async ({ accountId }) => {
    try {
      await atlassianClient.delete(
        `https://api.atlassian.com/users/${accountId}/manage/profile`
      );

      return {
        success: true,
        message: 'User account deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message
      };
    }
  }
});

/**
 * Tool: List User Groups
 * Lists all groups a user belongs to
 */
server.addTool({
  name: 'atlassian_admin_list_user_groups',
  description: 'List all groups a user belongs to',
  parameters: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'User account ID'
      }
    },
    required: ['accountId']
  },
  handler: async ({ accountId }) => {
    try {
      const response = await atlassianClient.get(
        `https://api.atlassian.com/rest/api/3/user/groups?accountId=${accountId}`
      );

      return {
        success: true,
        groups: response.data.map(g => g.name),
        count: response.data.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message
      };
    }
  }
});

/**
 * Tool: Transfer Issue Ownership
 * Transfers Jira issue assignments from one user to another
 */
server.addTool({
  name: 'atlassian_admin_transfer_issues',
  description: 'Transfer Jira issue assignments from one user to another',
  parameters: {
    type: 'object',
    properties: {
      fromAccountId: {
        type: 'string',
        description: 'Source user account ID'
      },
      toAccountId: {
        type: 'string',
        description: 'Target user account ID'
      },
      projectKey: {
        type: 'string',
        description: 'Optional: limit to specific project'
      }
    },
    required: ['fromAccountId', 'toAccountId']
  },
  handler: async ({ fromAccountId, toAccountId, projectKey }) => {
    try {
      // Search for issues assigned to the source user
      let jql = `assignee = ${fromAccountId} AND resolution = Unresolved`;
      if (projectKey) {
        jql += ` AND project = ${projectKey}`;
      }

      const searchResponse = await atlassianClient.get(
        `https://api.atlassian.com/ex/jira/${ATLASSIAN_CLOUD_ID}/rest/api/3/search?jql=${encodeURIComponent(jql)}`
      );

      const issues = searchResponse.data.issues;
      const transferred = [];

      // Transfer each issue
      for (const issue of issues) {
        await atlassianClient.put(
          `https://api.atlassian.com/ex/jira/${ATLASSIAN_CLOUD_ID}/rest/api/3/issue/${issue.key}`,
          {
            fields: {
              assignee: { accountId: toAccountId }
            }
          }
        );

        transferred.push(issue.key);
      }

      return {
        success: true,
        transferred: transferred.length,
        issues: transferred,
        message: `Transferred ${transferred.length} issues`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message
      };
    }
  }
});

// Start the server
server.start().catch(error => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
