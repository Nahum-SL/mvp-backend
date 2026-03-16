import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/categoy.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('blog/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  //
  @Get()
  // Este es público para que el formulario y el blog puedan leerlo
  findAll() {
    return this.categoryService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt')) // Solo admin puede crear categorías
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }
}
