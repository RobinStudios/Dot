output "cognito_identity_pool_id" {
  description = "Cognito Identity Pool ID"
  value       = aws_cognito_identity_pool.ai_designer_pool.id
}

output "s3_bucket_name" {
  description = "S3 bucket name for design assets"
  value       = aws_s3_bucket.design_assets.id
}

output "iam_role_arn" {
  description = "IAM role ARN for unauthenticated users"
  value       = aws_iam_role.cognito_unauth_role.arn
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}