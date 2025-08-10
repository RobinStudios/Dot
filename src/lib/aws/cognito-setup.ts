import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

export const cognitoConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || 'us-east-1:your-identity-pool-id',
};

export const getCognitoCredentials = () => {
  return fromCognitoIdentityPool({
    clientConfig: { region: cognitoConfig.region },
    identityPoolId: cognitoConfig.identityPoolId,
  });
};

export const cognitoClient = new CognitoIdentityClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});