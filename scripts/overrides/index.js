module.exports = overrides;

function isDeferenced(filename) {
  return /deref/.test(filename);
}

// Updates the operation ID for a specific operation. Useful if you want to maintain
// the function name in `plugin-rest-endpoint-methods.js` when the operation ID has
// been changed in the OpenAPI specification.
//
// Throws an error if an operation is not found for the specified path and HTTP method.
function rewriteOperationId(schema, path, httpMethod, operationId) {
  if (!schema.paths[path]) {
    throw `Path ${path} found not found in schema`;
  }

  if (!schema.paths[path][httpMethod]) {
    throw `HTTP method ${httpMethod} not found for path ${path} in schema`;
  }

  schema.paths[path][httpMethod].operationId = operationId;
}

// Adds an operation to the OpenAPI specification using JSON data stored in a file.
//
// Throws an error if an operation already exists for the specified path and HTTP method.
function addOperation(schema, path, httpMethod, overridePath) {
  if (schema.paths[path] && schema.paths[path][httpMethod]) {
    throw `Operation \`${httpMethod} ${path}\` already exists`;
  }

  if (!schema.paths[path]) {
    schema.paths[path] = {};
  }

  schema.paths[path][httpMethod] = require(overridePath);
}

// Replaces a given operation using JSON data stored in a file.
//
// Throws an error if an operation is not found for the specified path and HTTP method.
function replaceOperation(schema, path, httpMethod, overridePath) {
  if (!schema.paths[path]) {
    throw `Path ${path} not found in schema`;
  }

  if (!schema.paths[path][httpMethod]) {
    throw `HTTP method ${httpMethod} not found for path ${path} in schema`;
  }

  schema.paths[path][httpMethod] = require(overridePath);
}

function overrides(file, schema) {
  console.log(`Processing file: ${file}`);
  console.log(`With schema: ${schema}`);

  // remove `{ "type": "array", ...}` entries from `requestBody.content["aplication/json"].schema.anyOf
  // Octokit requires the request body to be set to an object in order to derive the variable name
  for (const [path, methods] of Object.entries(schema.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!operation.requestBody) continue;
      if (!operation.requestBody.content['application/json']) continue;

      const requestBodySchema = operation.requestBody.content['application/json'].schema;

      if (requestBodySchema.anyOf) {
        requestBodySchema.anyOf = requestBodySchema.anyOf.filter((item) => !item.type || item.type === 'object');
      }

      if (requestBodySchema.oneOf) {
        requestBodySchema.oneOf = requestBodySchema.oneOf.filter((item) => !item.type || item.type === 'object');
      }
    }
  }

  rewriteOperationId(schema, '/', 'get', 'meta/version');
}
