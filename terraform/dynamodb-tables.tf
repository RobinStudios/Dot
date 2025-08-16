# DynamoDB tables for AI Graphic Designer

resource "aws_dynamodb_table" "projects" {
  name           = "ai-designer-projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
  attribute {
    name = "owner_id"
    type = "S"
  }

  global_secondary_index {
    name               = "owner_id-index"
    hash_key           = "owner_id"
    projection_type    = "ALL"
  }
}

resource "aws_dynamodb_table" "designs" {
  name           = "ai-designer-designs"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "project_id"
  range_key      = "id"

  attribute {
    name = "project_id"
    type = "S"
  }
  attribute {
    name = "id"
    type = "S"
  }

  global_secondary_index {
    name               = "id-index"
    hash_key           = "id"
    projection_type    = "ALL"
  }
  global_secondary_index {
    name               = "project_id-index"
    hash_key           = "project_id"
    projection_type    = "ALL"
  }
}

resource "aws_dynamodb_table" "design_versions" {
  name           = "ai-designer-design-versions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "design_id"
  range_key      = "version_number"

  attribute {
    name = "design_id"
    type = "S"
  }
  attribute {
    name = "version_number"
    type = "N"
  }

  global_secondary_index {
    name               = "design_id-index"
    hash_key           = "design_id"
    projection_type    = "ALL"
  }
  global_secondary_index {
    name               = "design_id-version_number-index"
    hash_key           = "design_id"
    range_key          = "version_number"
    projection_type    = "ALL"
  }
}
