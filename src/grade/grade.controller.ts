import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { IUser } from 'src/auth/typings/typings';
import { GradeService } from './grade.service';

@Controller('grade')
@UseGuards(AuthGuard('jwt'))
export class GradeController {
  constructor(
    private readonly gradeService: GradeService
  ) { }

  @Get('sync_grades')
  syncGrades(@CurrentUser() user: IUser) {
    return this.gradeService.syncGrades(user)
  }

  @Get('all_grades')
  allGrades(@CurrentUser() user: IUser) {
    return this.gradeService.allGrades(user)
  }

  @Get('gpa')
  gpa(@CurrentUser() user: IUser, @Query('xn') xn?: string, @Query('xq') xq?: string) {
    return this.gradeService.gpa(user, xn ? + xn : undefined, xq ? +xq : undefined)
  }
}
