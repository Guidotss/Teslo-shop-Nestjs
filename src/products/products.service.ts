import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from 'uuid';
import { UpdateProductDto, CreateProductDto } from './dto';
import { PaginationDto } from '../common/dtos';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });

      await this.productRepository.save(product);
      return {
        ...product,
        images,
      };
    } catch (err) {
      this.handlerDBExeptions(err);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const product = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    return product.flatMap(({ images, ...rest }) => ({
      ...rest,
      images: images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder('product');
      product = await query
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }

    if (!product)
      throw new NotFoundException('Product not found', {
        description: `Product with term ${term} not found`,
      });

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`, {
        description: `Product with id ${id} not found`,
      });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }else{
        product.images = await this.productImageRepository.findBy({ product: { id } })
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return product;

      //await this.productRepository.save(product);
    } catch (err) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handlerDBExeptions(err);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    try {
      await this.productRepository.remove(product);
      return `Product with id ${id} deleted`;
    } catch (err) {
      this.handlerDBExeptions(err);
    }
  }

  private handlerDBExeptions(err: any) {
    if (err.code === '23505') throw new BadRequestException(err.detail);

    this.logger.error(err);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try{
      return await query
                  .delete()
                  .where({})
                  .execute();


    }catch(err){
      this.handlerDBExeptions(err);
    }
  }
}
