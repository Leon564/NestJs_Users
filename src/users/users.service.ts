import { Injectable, NotAcceptableException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserDocument } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor (@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create (createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      lower_username: createUserDto.username.toLocaleLowerCase(),
    })
    if (existingUser) return null
    createUserDto.isAdmin = false
    createUserDto.lower_username = createUserDto.username.toLocaleLowerCase()
    //createUserDto.email = createUserDto.email.toLocaleLowerCase();
    const createdUser = new this.userModel(createUserDto)
    return await createdUser.save()
  }

  async findAll () {
    const users = await this.userModel.find().exec()
    return users
  }

  async findOne (id: string) {
    //const user = await this.userModel.findById(id).exec();
    //find user by id, username or email
    if (mongoose.Types.ObjectId.isValid(id)) {
      const user = await this.userModel.findById(id)
      if (user) return user
    }
    const q = id.toLocaleLowerCase()
    const user = await this.userModel.findOne({
      lower_username: q,
    })
    if (user) return user
    return null
  }

  async findOneByUsername (username: string) {
    const q = username.toLocaleLowerCase()
    const user = await this.userModel.findOne({
      $or: [{ email: q }, { username: q }],
    })
    return user
  }

  async update (id: string, updateUserDto: UpdateUserDto) {
    updateUserDto.lower_username = updateUserDto.username.toLocaleLowerCase()
    //updateUserDto.email = updateUserDto.email.toLocaleLowerCase();
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      {
        new: true,
        projection: { password: 0 },
      },
    )

    return updatedUser
  }

  async remove (id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id)
    return deletedUser
  }
}
