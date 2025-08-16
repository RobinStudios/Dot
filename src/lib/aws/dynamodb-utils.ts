import { ddbDocClient } from './dynamodb-client';
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function getItem(params: any) {
  return ddbDocClient.send(new GetCommand(params));
}

export async function putItem(params: any) {
  return ddbDocClient.send(new PutCommand(params));
}

export async function updateItem(params: any) {
  return ddbDocClient.send(new UpdateCommand(params));
}

export async function deleteItem(params: any) {
  return ddbDocClient.send(new DeleteCommand(params));
}

export async function queryItems(params: any) {
  return ddbDocClient.send(new QueryCommand(params));
}
