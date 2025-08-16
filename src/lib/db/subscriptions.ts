import { ddbDocClient } from '../aws/dynamodb-client';
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const SUBSCRIPTIONS_TABLE = process.env.AWS_SUBSCRIPTIONS_TABLE || 'ai-designer-subscriptions';

export async function getSubscription(userId: string) {
  const params = {
    TableName: SUBSCRIPTIONS_TABLE,
    Key: { user_id: userId },
  };
  const result = await ddbDocClient.send(new GetCommand(params));
  return result.Item || null;
}

export async function setSubscription(userId: string, plan: string, status: string, designsRemaining: number, exportsRemaining: number, features: string[]) {
  const subscription = {
    user_id: userId,
    plan,
    status,
    designs_remaining: designsRemaining,
    exports_remaining: exportsRemaining,
    features,
    updated_at: new Date().toISOString(),
  };
  await ddbDocClient.send(new PutCommand({ TableName: SUBSCRIPTIONS_TABLE, Item: subscription }));
  return subscription;
}

export async function updateSubscription(userId: string, updates: Partial<{ plan: string; status: string; designs_remaining: number; exports_remaining: number; features: string[] }>) {
  const updateExpr = [];
  const exprAttrNames: Record<string, string> = {};
  const exprAttrValues: Record<string, any> = {};
  Object.entries(updates).forEach(([key, value]) => {
    updateExpr.push(`#${key} = :${key}`);
    exprAttrNames[`#${key}`] = key;
    exprAttrValues[`:${key}`] = value;
  });
  updateExpr.push('#updated_at = :updated_at');
  exprAttrNames['#updated_at'] = 'updated_at';
  exprAttrValues[':updated_at'] = new Date().toISOString();
  const params = {
    TableName: SUBSCRIPTIONS_TABLE,
    Key: { user_id: userId },
    UpdateExpression: 'set ' + updateExpr.join(', '),
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: 'ALL_NEW' as any,
  };
  const result = await ddbDocClient.send(new UpdateCommand(params));
  return result.Attributes;
}
