import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
    
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    offset?: number;

    
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    @Min(0)
    limit?: number;
}