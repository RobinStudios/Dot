import { ddbDocClient } from '../aws/dynamodb-client';
import { PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const AGENTS_TABLE = process.env.AWS_AGENTS_TABLE || 'ai-designer-agents';

export async function registerAgent(agent: any) {
  await ddbDocClient.send(new PutCommand({ TableName: AGENTS_TABLE, Item: agent }));
}

export async function getAllAgents() {
  const params = {
    TableName: AGENTS_TABLE,
  };
  const result = await ddbDocClient.send(new QueryCommand(params));
  return result.Items || [];
}

export async function deleteAgent(agentId: string) {
  await ddbDocClient.send(new DeleteCommand({
    TableName: AGENTS_TABLE,
    Key: { id: agentId },
  }));
}
