import { DocumentBuilder } from '@nestjs/swagger';

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('ChainForge API')
    .setDescription(
      `API documentation for ChainForge platform - Humanitarian aid and verification system

## API Versioning

This API uses URI-based versioning. The current version is **v1**.

### Version Format
All endpoints are prefixed with the version number: \`/api/v1/...\`

### Supported Versions
| Version | Status | Description |
|---------|--------|-------------|
| v1 | Current | Active version with full support |

### Deprecation Policy
- Deprecated endpoints will be marked with \`@Deprecated\` in the documentation
- Deprecated versions will be supported for at least 6 months after deprecation notice
- Clients will receive deprecation warnings via the \`Sunset\` HTTP header
- Migration guides will be provided for major version changes

### Future Versions
When new versions are released:
- New endpoints will be available at \`/api/v2/...\`, etc.
- Previous versions remain accessible during the deprecation period
- Clients should monitor the API documentation for version updates`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API key for external access',
      },
      'api-key',
    )
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.chainforge.app', 'Staging')
    .addServer('https://api.chainforge.app', 'Production')
    .build();
}
