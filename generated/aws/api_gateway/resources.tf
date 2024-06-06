resource "aws_api_gateway_gateway_response" "tfer--3nfq1o8esj-002F-DEFAULT_4XX" {
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_type = "DEFAULT_4XX"
  rest_api_id   = "3nfq1o8esj"
}

resource "aws_api_gateway_gateway_response" "tfer--3nfq1o8esj-002F-DEFAULT_5XX" {
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_type = "DEFAULT_5XX"
  rest_api_id   = "3nfq1o8esj"
}

resource "aws_api_gateway_integration" "tfer--3nfq1o8esj-002F-0hihjm-002F-GET" {
  cache_namespace         = "0hihjm"
  connection_type         = "INTERNET"
  content_handling        = "CONVERT_TO_TEXT"
  http_method             = "GET"
  integration_http_method = "POST"
  passthrough_behavior    = "WHEN_NO_MATCH"
  resource_id             = "0hihjm"
  rest_api_id             = "3nfq1o8esj"
  timeout_milliseconds    = "29000"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-northeast-1:339712851438:function:trackVisitors/invocations"
}

resource "aws_api_gateway_integration" "tfer--3nfq1o8esj-002F-0hihjm-002F-OPTIONS" {
  cache_namespace      = "0hihjm"
  connection_type      = "INTERNET"
  http_method          = "OPTIONS"
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  resource_id          = "0hihjm"
  rest_api_id          = "3nfq1o8esj"
  timeout_milliseconds = "29000"
  type                 = "MOCK"
}

resource "aws_api_gateway_integration" "tfer--3nfq1o8esj-002F-vn8ef9-002F-OPTIONS" {
  cache_namespace      = "vn8ef9"
  connection_type      = "INTERNET"
  http_method          = "OPTIONS"
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  resource_id          = "vn8ef9"
  rest_api_id          = "3nfq1o8esj"
  timeout_milliseconds = "29000"
  type                 = "MOCK"
}

resource "aws_api_gateway_integration" "tfer--3nfq1o8esj-002F-vn8ef9-002F-POST" {
  cache_namespace         = "vn8ef9"
  connection_type         = "INTERNET"
  content_handling        = "CONVERT_TO_TEXT"
  http_method             = "POST"
  integration_http_method = "POST"
  passthrough_behavior    = "WHEN_NO_MATCH"
  resource_id             = "vn8ef9"
  rest_api_id             = "3nfq1o8esj"
  timeout_milliseconds    = "29000"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-northeast-1:339712851438:function:sendMessage/invocations"
}

resource "aws_api_gateway_integration_response" "tfer--3nfq1o8esj-002F-0hihjm-002F-GET-002F-200" {
  http_method = "GET"
  resource_id = "0hihjm"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  rest_api_id = "3nfq1o8esj"
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "tfer--3nfq1o8esj-002F-0hihjm-002F-OPTIONS-002F-200" {
  http_method = "OPTIONS"
  resource_id = "0hihjm"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  rest_api_id = "3nfq1o8esj"
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "tfer--3nfq1o8esj-002F-vn8ef9-002F-OPTIONS-002F-200" {
  http_method = "OPTIONS"
  resource_id = "vn8ef9"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  rest_api_id = "3nfq1o8esj"
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "tfer--3nfq1o8esj-002F-vn8ef9-002F-POST-002F-200" {
  http_method = "POST"
  resource_id = "vn8ef9"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  rest_api_id = "3nfq1o8esj"
  status_code = "200"
}

resource "aws_api_gateway_method" "tfer--3nfq1o8esj-002F-0hihjm-002F-GET" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "GET"

  request_parameters = {
    "method.request.querystring.visitorId" = "true"
  }

  request_validator_id = "k1c8gg"
  resource_id          = "0hihjm"
  rest_api_id          = "3nfq1o8esj"
}

resource "aws_api_gateway_method" "tfer--3nfq1o8esj-002F-0hihjm-002F-OPTIONS" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "OPTIONS"
  resource_id      = "0hihjm"
  rest_api_id      = "3nfq1o8esj"
}

resource "aws_api_gateway_method" "tfer--3nfq1o8esj-002F-vn8ef9-002F-OPTIONS" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "OPTIONS"
  resource_id      = "vn8ef9"
  rest_api_id      = "3nfq1o8esj"
}

resource "aws_api_gateway_method" "tfer--3nfq1o8esj-002F-vn8ef9-002F-POST" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "POST"

  request_parameters = {
    "method.request.querystring.uuid" = "true"
  }

  request_validator_id = "k1c8gg"
  resource_id          = "vn8ef9"
  rest_api_id          = "3nfq1o8esj"
}

resource "aws_api_gateway_method_response" "tfer--3nfq1o8esj-002F-0hihjm-002F-GET-002F-200" {
  http_method = "GET"
  resource_id = "0hihjm"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "false"
  }

  rest_api_id = "3nfq1o8esj"
  status_code = "200"
}

resource "aws_api_gateway_method_response" "tfer--3nfq1o8esj-002F-0hihjm-002F-OPTIONS-002F-200" {
  http_method = "OPTIONS"
  resource_id = "0hihjm"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "false"
    "method.response.header.Access-Control-Allow-Methods" = "false"
    "method.response.header.Access-Control-Allow-Origin"  = "false"
  }

  rest_api_id = "3nfq1o8esj"
  status_code = "200"
}

resource "aws_api_gateway_method_response" "tfer--3nfq1o8esj-002F-vn8ef9-002F-OPTIONS-002F-200" {
  http_method = "OPTIONS"
  resource_id = "vn8ef9"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "false"
    "method.response.header.Access-Control-Allow-Methods" = "false"
    "method.response.header.Access-Control-Allow-Origin"  = "false"
  }

  rest_api_id = "3nfq1o8esj"
  status_code = "200"
}

resource "aws_api_gateway_method_response" "tfer--3nfq1o8esj-002F-vn8ef9-002F-POST-002F-200" {
  http_method = "POST"
  resource_id = "vn8ef9"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "false"
  }

  rest_api_id = "3nfq1o8esj"
  status_code = "200"
}

resource "aws_api_gateway_model" "tfer--ay6utx" {
  content_type = "application/json"
  description  = "This is a default empty schema model"
  name         = "Empty"
  rest_api_id  = "3nfq1o8esj"
  schema       = "{\n  \"$schema\": \"http://json-schema.org/draft-04/schema#\",\n  \"title\" : \"Empty Schema\",\n  \"type\" : \"object\"\n}"
}

resource "aws_api_gateway_model" "tfer--yh6w2n" {
  content_type = "application/json"
  description  = "This is a default error schema model"
  name         = "Error"
  rest_api_id  = "3nfq1o8esj"
  schema       = "{\n  \"$schema\" : \"http://json-schema.org/draft-04/schema#\",\n  \"title\" : \"Error Schema\",\n  \"type\" : \"object\",\n  \"properties\" : {\n    \"message\" : { \"type\" : \"string\" }\n  }\n}"
}

resource "aws_api_gateway_resource" "tfer--0hihjm" {
  parent_id   = "1e1dkkytsg"
  path_part   = "visitors"
  rest_api_id = "3nfq1o8esj"
}

resource "aws_api_gateway_resource" "tfer--1e1dkkytsg" {
  parent_id   = ""
  path_part   = ""
  rest_api_id = "3nfq1o8esj"
}

resource "aws_api_gateway_resource" "tfer--vn8ef9" {
  parent_id   = "1e1dkkytsg"
  path_part   = "contact"
  rest_api_id = "3nfq1o8esj"
}

resource "aws_api_gateway_rest_api" "tfer--3nfq1o8esj_CloudResume_API" {
  api_key_source               = "AUTHORIZER"
  description                  = "MultiPurpose API for CloudResume Site"
  disable_execute_api_endpoint = "true"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  name = "CloudResume_API"
}

resource "aws_api_gateway_stage" "tfer--3nfq1o8esj-002F-v1" {
  cache_cluster_enabled = "false"
  deployment_id         = "c51dkf"
  rest_api_id           = "3nfq1o8esj"
  stage_name            = "v1"
  xray_tracing_enabled  = "true"
}
