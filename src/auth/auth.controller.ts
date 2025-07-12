/* eslint-disable */
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto): Promise<{ access_token: string }> {
    const user = await this.authService.register(
      body.email,
      body.password,
      body.role,
    );
    return {
      access_token: await this.authService['jwtService'].signAsync({
        email: user.email,
        sub: user.id,
        role: user.role,
      }),
    };
  }

  @Post('login')
  async login(@Body() body: LoginDto): Promise<{ access_token: string }> {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return {
      access_token: await this.authService['jwtService'].signAsync({
        email: user.email,
        sub: user.id,
        role: user.role,
      }),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req: { user: any }): any {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return { message: 'Logged out' };
  }
}
