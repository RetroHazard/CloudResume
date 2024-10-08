var USERNAME = "${STAGINGUSER}";
var PASSWORD = "${STAGINGPASS}";

var response401 = {
  statusCode: 401,
  statusDescription: 'Unauthorized',
  headers: {
    'www-authenticate': {value:'Basic'},
  },
};

function validateBasicAuth(authHeader) {
  var match = authHeader.match(/^Basic (.+)$/);
  if (!match) return false;

  var credentials = String.bytesFrom(match[1], 'base64').split(':', 2);

  return credentials[0] === USERNAME && credentials[1] === PASSWORD;
}

function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var auth = (headers.authorization && headers.authorization.value) || '';

  if (!validateBasicAuth(auth)) return response401;

  return request;
}