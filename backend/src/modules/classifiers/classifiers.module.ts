import { Module } from '@nestjs/common';
import { ClassifiersController } from './classifiers.controller';
import { ClassifiersService } from './classifiers.service';

@Module({
    controllers: [ClassifiersController],
    providers: [ClassifiersService],
})
export class ClassifiersModule { }
