# API Generation Guide

This guide explains how to generate Angular API clients from OpenAPI/Swagger specifications using `ng-openapi-gen`.

## Installation

Install the required dependency:

```bash
npm install --save-dev ng-openapi-gen
```

## Configuration

The API generator is configured in `openapi.config.json`:

```json
{
  "input": "https://backend-aquashield-restoration-production.up.railway.app/api/docs-json",
  "output": "./src/app/api",
  "excludeTags": ["auth:2fa"],
  "promises": true,
  "services": true,
  "enumStyle": "alias",
  "ignoreUnusedModels": true,
  "removeStaleFiles": true
}
```

### Configuration Options

- **input**: URL or file path to your OpenAPI/Swagger JSON specification
- **output**: Directory where the generated API client will be saved
- **excludeTags**: Array of tags to exclude from generation (useful for tags with invalid Windows filename characters)
- **promises**: Generate services that return Promises instead of Observables
- **services**: Generate a service per API tag
- **enumStyle**: How to handle enums (`alias`, `upper`, `pascal`, or `ignorecase`)
- **ignoreUnusedModels**: Remove models that are not referenced by any operation
- **removeStaleFiles**: Delete generated files that are no longer in the OpenAPI spec

## Generating the API

### Method 1: Using npm script

```bash
npm run generate:api
```

### Method 2: Using ng-openapi-gen directly

```bash
ng-openapi-gen -c openapi.config.json
```

## Automatic Generation

The API is automatically generated before each build thanks to the `prebuild` script in `package.json`:

```json
"scripts": {
  "prebuild": "npm run generate:api"
}
```

This means running `npm run build` will first regenerate the API client.

## Using the Generated API

After generation, import and use the generated services in your Angular components:

```typescript
import { Component, inject } from '@angular/core';
import { UsersService } from './api/services';

@Component({
  selector: 'app-users',
  standalone: true,
  template: '...'
})
export class UsersComponent {
  private usersService = inject(UsersService);

  async loadUsers() {
    const users = await this.usersService.usersControllerFindAll();
    // Use the data
  }
}
```

## Regenerating the API

Whenever your backend API changes, regenerate the client by running:

```bash
npm run generate:api
```

Or simply build the project:

```bash
npm run build
```

## Troubleshooting

### Invalid Filename Characters

If your OpenAPI spec contains tags with characters invalid for Windows filenames (like colons `:`), use the `excludeTags` option to exclude those tags:

```json
{
  "excludeTags": ["auth:2fa", "other:tag"]
}
```
