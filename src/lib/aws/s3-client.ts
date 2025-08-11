import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ 
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' 
    }),
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID!,
  }),
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET || 'ai-graphic-designer-assets';

export async function uploadDesignAsset(
  file: File, 
  designId: string
): Promise<string> {
  const key = `designs/${designId}/${file.name}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.type,
  });

  await s3Client.send(command);
  
  return `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
}

export async function uploadGeneratedImage(
  imageData: string, 
  designId: string
): Promise<string> {
  const key = `generated/${designId}/${Date.now()}.png`;
  const buffer = Buffer.from(imageData.split(',')[1], 'base64');
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
  });

  await s3Client.send(command);
  
  return `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
}