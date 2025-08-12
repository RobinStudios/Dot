import { ddbDocClient } from './dynamodb-client';
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function getItem(params) {
  return ddbDocClient.send(new GetCommand(params));
}

export async function putItem(params) {
  return ddbDocClient.send(new PutCommand(params));
}

export async function updateItem(params) {
  return ddbDocClient.send(new UpdateCommand(params));
}

export async function deleteItem(params) {
  return ddbDocClient.send(new DeleteCommand(params));
}

export async function queryItems(params) {
  return ddbDocClient.send(new QueryCommand(params));
}
