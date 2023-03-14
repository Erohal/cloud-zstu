import { Controller } from '@nestjs/common';
import { Get, UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { IUser } from 'src/auth/typings/typings';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Get('deactivate')
  deactivate(@CurrentUser() user: IUser) {
    this.userService.deactivate(user)
  }

  @Get('info')
  info(@CurrentUser() user: IUser) {
    return this.userService.info(user)
  }
}
