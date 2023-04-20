import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Res,
  Body,
  HttpStatus,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { CreateAuthDto } from './dto/create-auth.dto'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/users/users.service'
import { Response, Request as Req } from 'express'

@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor (
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: CreateAuthDto })
  @Post('login')
  async login (@Request() req: Req) {
    return this.authService.login(req.body)
  }

  @Post('register')
  async create (@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    const encryptedPassword = await bcrypt.hash(
      createUserDto.password,
      parseInt(process.env.bycrypt_salt),
    )
    const pass = createUserDto.password
    createUserDto.password = encryptedPassword
    const _user = await this.usersService.create(createUserDto)

    if (!_user)
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ error: 'Bad Request', message: ['User already exists'] })

    console.log(_user, pass)
    const token = await this.authService.login({
      username: _user.username,
      password: pass,
    })
    const user = JSON.parse(JSON.stringify(_user))
    return res.status(HttpStatus.OK).json({ ...user, ...token })
  }
}
