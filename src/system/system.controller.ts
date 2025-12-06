import { Controller, Get } from '@nestjs/common';

@Controller()
export class SystemController {
  private readonly startedAt = Date.now();

  @Get('/health')
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/version')
  version() {
    return {
      name: 'assurance-app',
      version: process.env.APP_VERSION ?? 'dev', // récupère version depuis l'env
      env: process.env.NODE_ENV ?? 'unknown',
      startedAt: new Date(this.startedAt).toISOString(),
    };
  }
}
