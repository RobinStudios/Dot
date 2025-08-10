terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
}

# Cognito Identity Pool
resource "aws_cognito_identity_pool" "ai_designer_pool" {
  identity_pool_name               = "ai-graphic-designer-pool"
  allow_unauthenticated_identities = true
  allow_classic_flow               = false

  tags = {
    Name        = "AI Graphic Designer Identity Pool"
    Environment = var.environment
  }
}

# IAM Role for Unauthenticated Users
resource "aws_iam_role" "cognito_unauth_role" {
  name = "Cognito_AIDesignerPoolUnauth_Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.ai_designer_pool.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "unauthenticated"
          }
        }
      }
    ]
  })
}

# IAM Policy for Bedrock Access
resource "aws_iam_role_policy" "bedrock_access" {
  name = "BedrockAccess"
  role = aws_iam_role.cognito_unauth_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = [
          "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
          "arn:aws:bedrock:${var.aws_region}::foundation-model/stability.stable-diffusion-xl-v1"
        ]
      }
    ]
  })
}

# Attach Role to Identity Pool
resource "aws_cognito_identity_pool_roles_attachment" "ai_designer_roles" {
  identity_pool_id = aws_cognito_identity_pool.ai_designer_pool.id

  roles = {
    "unauthenticated" = aws_iam_role.cognito_unauth_role.arn
  }
}

# S3 Bucket for Design Assets
resource "aws_s3_bucket" "design_assets" {
  bucket = "ai-graphic-designer-assets-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "AI Designer Assets"
    Environment = var.environment
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_public_access_block" "design_assets_pab" {
  bucket = aws_s3_bucket.design_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}