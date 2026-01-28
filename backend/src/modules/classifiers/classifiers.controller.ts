import { Controller, Get, Query } from '@nestjs/common';
import { ClassifiersService } from './classifiers.service';

@Controller('classifiers')
export class ClassifiersController {
    constructor(private readonly service: ClassifiersService) { }

    @Get()
    async findAll(
        @Query('q') q: string,
        @Query('lang') lang: string,
        @Query('limit') limit: string,
        @Query('offset') offset: string
    ) {
        return this.service.findAll(
            q,
            lang,
            limit ? parseInt(limit) : 100,
            offset ? parseInt(offset) : 0
        );
    }
}
