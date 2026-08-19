import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-categoy.dto';
import { Role } from '@prisma/client';
// Guards
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
// Decorator
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('blog/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  //
  @Get()
  // Este es público para que el formulario y el blog puedan leerlo
  findAll() {
    return this.categoryService.findAll();
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard) // Solo admin puede crear categorías
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }
}
