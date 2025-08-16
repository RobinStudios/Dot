import { ddbDocClient } from '../aws/dynamodb-client';
import { PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const VOTES_TABLE = process.env.AWS_VOTES_TABLE || 'ai-designer-votes';

export async function addVote(teamId: string, mockupId: string, userId: string, userName: string) {
  const vote = {
    team_id: teamId,
    mockup_id: mockupId,
    user_id: userId,
    user_name: userName,
    timestamp: new Date().toISOString(),
  };
  await ddbDocClient.send(new PutCommand({ TableName: VOTES_TABLE, Item: vote }));
}

export async function removeVote(teamId: string, mockupId: string, userId: string) {
  await ddbDocClient.send(new DeleteCommand({
    TableName: VOTES_TABLE,
    Key: {
      team_id: teamId,
      mockup_id: mockupId,
      user_id: userId,
    },
  }));
}

export async function getVotes(teamId: string, mockupId: string) {
  const params = {
    TableName: VOTES_TABLE,
    KeyConditionExpression: 'team_id = :tid and mockup_id = :mid',
    ExpressionAttributeValues: {
      ':tid': teamId,
      ':mid': mockupId,
    },
  };
  const result = await ddbDocClient.send(new QueryCommand(params));
  return result.Items || [];
}
