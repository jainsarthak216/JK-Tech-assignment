import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles/roles.guard';
import { Roles } from '../common/roles/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto/update-role.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  getAllUsers(): any {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles('admin')
  updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): any {
    return this.usersService.updateRole(id, updateRoleDto.role);
  }

  @Get('by-email/:email')
  @Roles('admin')
  getUserByEmail(@Param('email') email: string): any {
    return this.usersService.findByEmail(email);
  }
}
