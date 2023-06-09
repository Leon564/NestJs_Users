import {  IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
    @IsNotEmpty()
    @ApiProperty()
    username: string;
    @IsNotEmpty()
    @ApiProperty()
    password: string;
 
}
