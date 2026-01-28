import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['http://localhost:5173', 'http://localhost:3000'];

    app.enableCors({
        origin: corsOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Validation
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Compression
    app.use(compression());

    const port = process.env.PORT || 8000;
    await app.listen(port);
    console.log(`Backend running on port ${port}`);
}
bootstrap();
