/**
 * Standalone OpenAPI spec export script.
 *
 * Boots the NestJS application context (no HTTP listener), generates the
 * Swagger document, and writes it to app/frontend/openapi.json.
 *
 * Usage:
 *   cd app/backend
 *   DATABASE_URL=file:./prisma/dev.db npm run spec:export
 *
 * The output file is committed to source control so the frontend can run
 * `pnpm generate:api` without a running backend, and CI can diff it to
 * detect contract drift.
 */

import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { buildSwaggerConfig } from '../src/swagger.config';

async function exportSpec() {
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());

  const outPath = join(__dirname, '..', '..', 'frontend', 'openapi.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2));

  await app.close();

  console.log(`✅  OpenAPI spec written to ${outPath}`);
}

void exportSpec();
