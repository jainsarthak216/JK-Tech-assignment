import { IsIn } from 'class-validator';

export class UpdateRoleDto {
  @IsIn(['admin', 'editor', 'viewer'])
  role: 'admin' | 'editor' | 'viewer';
}
