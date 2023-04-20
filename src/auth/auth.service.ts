import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: CreateAuthDto) {
    const _user = await this.usersService.findOne(user.username);
    if (!_user) throw new NotAcceptableException(['Usuario no encontrado.']);
    const isMatch = await bcrypt.compare(user.password, _user.password);
    if (!isMatch) throw new NotAcceptableException(['Contraseña incorrecta.']);
    const payload = {
      username: _user.username,
      sub: _user._id,
      isAdmin: _user.isAdmin,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: { username: _user.username },
    };
  }

  /*
  async register(user: CreateUserDto) {
    const _user = await this.usersService.create(user);
    if (!_user) throw new NotAcceptableException('user already exists');
    console.log('user created', _user); 
    //and login the user to get the token
    const token = await this.login(user);
    return { user: _user, token};
  }
  */
}
