resource "aws_dynamodb_table" "crc-visitor-count" {
  attribute {
    name = "id"
    type = "S"
  }

  billing_mode                = "PROVISIONED"
  deletion_protection_enabled = "true"
  hash_key                    = "id"
  name                        = "crc-visitor-count"

  point_in_time_recovery {
    enabled = "false"
  }

  read_capacity  = "1"
  stream_enabled = "false"
  table_class    = "STANDARD"

  tags = {
    Name    = "Visitor Counter"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "Visitor Counter"
    Project = "CloudResume"
  }

  write_capacity = "1"
}

resource "aws_dynamodb_table" "crc-visitor-record" {
  attribute {
    name = "id"
    type = "S"
  }

  billing_mode                = "PROVISIONED"
  deletion_protection_enabled = "true"
  hash_key                    = "id"
  name                        = "crc-visitor-record"

  point_in_time_recovery {
    enabled = "false"
  }

  read_capacity  = "1"
  stream_enabled = "false"
  table_class    = "STANDARD"

  tags = {
    Name    = "Visitor Records"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "Visitor Records"
    Project = "CloudResume"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = "true"
  }

  write_capacity = "1"
}
