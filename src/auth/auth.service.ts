import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) { }

  async validateUser(username: string, password: string) {
    const user = await this.userService.login(username, password)
    if (!user) return null
    return user
  }

  async login(payload: { id: number, username: string }) {
    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
