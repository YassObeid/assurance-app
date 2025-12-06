
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as pkg from '../package.json';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Petit endpoint de test
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  //  Endpoint de health-check pour Docker / monitoring
  @Get('health')
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  //  Endpoint version pour savoir quel build tourne
  @Get('version')
  version() {
    return {
      name: (pkg as any).name,
      version: (pkg as any).version,
      env: process.env.NODE_ENV || 'development',
    };
  }
}
