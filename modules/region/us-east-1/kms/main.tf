resource "aws_kms_alias" "crc-alias-002F-cloudresume_dnssec" {
  name          = "alias/cloudresume_dnssec"
  target_key_id = "0fca1ad8-81ef-4b82-9662-205c52643235"
}

resource "aws_kms_key" "crc-0fca1ad8-81ef-4b82-9662-205c52643235" {
  customer_master_key_spec = "ECC_NIST_P256"
  description              = "Keys used for the purpose of signing DNSSEC"
  enable_key_rotation      = "false"
  is_enabled               = "true"
  key_usage                = "SIGN_VERIFY"
  multi_region             = "false"
  policy                   = "{\"Id\":\"key-consolepolicy-3\",\"Statement\":[{\"Action\":\"kms:*\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::339712851438:root\"},\"Resource\":\"*\",\"Sid\":\"Enable IAM User Permissions\"},{\"Action\":[\"kms:Create*\",\"kms:Describe*\",\"kms:Enable*\",\"kms:List*\",\"kms:Put*\",\"kms:Update*\",\"kms:Revoke*\",\"kms:Disable*\",\"kms:Get*\",\"kms:Delete*\",\"kms:TagResource\",\"kms:UntagResource\",\"kms:ScheduleKeyDeletion\",\"kms:CancelKeyDeletion\"],\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"AROAU6GDWXXXGJELQFKUD\"},\"Resource\":\"*\",\"Sid\":\"Allow access for Key Administrators\"},{\"Action\":[\"kms:DescribeKey\",\"kms:GetPublicKey\",\"kms:Sign\"],\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"dnssec-route53.amazonaws.com\"},\"Resource\":\"*\",\"Sid\":\"Allow Route 53 DNSSEC Service\"},{\"Action\":\"kms:CreateGrant\",\"Condition\":{\"Bool\":{\"kms:GrantIsForAWSResource\":\"true\"}},\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"dnssec-route53.amazonaws.com\"},\"Resource\":\"*\",\"Sid\":\"Allow Route 53 DNSSEC to CreateGrant\"}],\"Version\":\"2012-10-17\"}"

  tags = {
    Name    = "DNSSEC"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "DNSSEC"
    Project = "CloudResume"
  }
}
