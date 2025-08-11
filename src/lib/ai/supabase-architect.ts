import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getCognitoCredentials, cognitoConfig } from '../aws/cognito-setup';

const client = new BedrockRuntimeClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});

interface SupabaseArchitecture {
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      constraints?: string[];
    }>;
    relationships?: Array<{
      table: string;
      type: 'one-to-many' | 'many-to-many';
    }>;
  }>;
  policies: Array<{
    table: string;
    policy: string;
    sql: string;
  }>;
  functions: Array<{
    name: string;
    sql: string;
  }>;
}

export class SupabaseArchitect {
  async generateSchema(appDescription: string, templateCode: string): Promise<SupabaseArchitecture> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Analyze this app and generate a complete Supabase backend architecture:

App Description: ${appDescription}

Template Code:
${templateCode}

Generate a comprehensive backend with:
1. Database tables with proper relationships
2. Row Level Security (RLS) policies
3. Database functions for complex operations
4. Authentication setup

Return JSON with this structure:
{
  "tables": [
    {
      "name": "users",
      "columns": [
        {"name": "id", "type": "uuid", "constraints": ["PRIMARY KEY", "DEFAULT gen_random_uuid()"]},
        {"name": "email", "type": "text", "constraints": ["UNIQUE", "NOT NULL"]},
        {"name": "created_at", "type": "timestamp", "constraints": ["DEFAULT now()"]}
      ]
    }
  ],
  "policies": [
    {
      "table": "users",
      "policy": "Users can view own profile",
      "sql": "CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);"
    }
  ],
  "functions": [
    {
      "name": "get_user_stats",
      "sql": "CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid) RETURNS json AS $$ ... $$"
    }
  ]
}`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    try {
      return JSON.parse(result.content[0].text);
    } catch {
      return this.getDefaultSchema();
    }
  }

  async deployToSupabase(architecture: SupabaseArchitecture, supabaseUrl: string, supabaseKey: string): Promise<boolean> {
    try {
      // Generate SQL migration
      const migrationSQL = this.generateMigrationSQL(architecture);
      
      // Execute via Supabase REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: migrationSQL })
      });

      return response.ok;
    } catch (error) {
      console.error('Supabase deployment failed:', error);
      return false;
    }
  }

  private generateMigrationSQL(architecture: SupabaseArchitecture): string {
    let sql = '-- Auto-generated Supabase schema\n\n';

    // Create tables
    architecture.tables.forEach(table => {
      sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
      sql += table.columns.map(col => 
        `  ${col.name} ${col.type}${col.constraints ? ' ' + col.constraints.join(' ') : ''}`
      ).join(',\n');
      sql += '\n);\n\n';

      // Enable RLS
      sql += `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n\n`;
    });

    // Create policies
    architecture.policies.forEach(policy => {
      sql += `-- ${policy.policy}\n`;
      sql += `${policy.sql}\n\n`;
    });

    // Create functions
    architecture.functions.forEach(func => {
      sql += `-- Function: ${func.name}\n`;
      sql += `${func.sql}\n\n`;
    });

    return sql;
  }

  private getDefaultSchema(): SupabaseArchitecture {
    return {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'] },
            { name: 'email', type: 'text', constraints: ['UNIQUE', 'NOT NULL'] },
            { name: 'name', type: 'text' },
            { name: 'created_at', type: 'timestamp', constraints: ['DEFAULT now()'] }
          ]
        },
        {
          name: 'projects',
          columns: [
            { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'] },
            { name: 'user_id', type: 'uuid', constraints: ['REFERENCES users(id)'] },
            { name: 'name', type: 'text', constraints: ['NOT NULL'] },
            { name: 'data', type: 'jsonb' },
            { name: 'created_at', type: 'timestamp', constraints: ['DEFAULT now()'] }
          ]
        }
      ],
      policies: [
        {
          table: 'users',
          policy: 'Users can view own profile',
          sql: 'CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);'
        },
        {
          table: 'projects',
          policy: 'Users can manage own projects',
          sql: 'CREATE POLICY projects_all ON projects FOR ALL USING (auth.uid() = user_id);'
        }
      ],
      functions: [
        {
          name: 'get_user_projects',
          sql: `CREATE OR REPLACE FUNCTION get_user_projects(user_id uuid)
RETURNS TABLE(id uuid, name text, created_at timestamp)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT p.id, p.name, p.created_at
  FROM projects p
  WHERE p.user_id = get_user_projects.user_id
  ORDER BY p.created_at DESC;
$$;`
        }
      ]
    };
  }
}

export const supabaseArchitect = new SupabaseArchitect();