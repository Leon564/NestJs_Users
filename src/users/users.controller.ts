import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { HasAdmin } from 'src/auth/HasAdmin.decorator';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    const encryptedPassword = await bcrypt.hash(
      createUserDto.password,
      parseInt(process.env.bycrypt_salt),
    );
    createUserDto.password = encryptedPassword;
    const user = await this.usersService.create(createUserDto);
    if (!user)
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ error: 'Bad Request', message: ['El usuario ya existe.'] });
    return res.status(HttpStatus.OK).json(user);

    //return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @HasAdmin()
  @Get()
  async findAll(@Res() res: Response) {
    const users = await this.usersService.findAll();
    if (!users)
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Bad Request',
        message: ['No se encontraron usuarios.'],
      });
    return res.status(HttpStatus.OK).json(users);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @HasAdmin()
  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user)
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Bad Request',
        message: ['No se encontro el usuario.'],
      });
    return res.status(HttpStatus.OK).json(user);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @HasAdmin()
  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    if (!user)
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Bad Request',
        message: ['No se encontro el usuario.'],
      });
    return res.status(HttpStatus.OK).json(user);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @HasAdmin()
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    const user = await this.usersService.remove(id);
    if (!user)
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Bad Request',
        message: ['No se encontro el usuario.'],
      });
    return res.status(HttpStatus.OK).json(user);
  }
}
