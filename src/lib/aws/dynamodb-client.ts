import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';

const ddbClient = new DynamoDBClient({ region: REGION });
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
