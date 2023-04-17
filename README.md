<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API
1. Clonar el repositorio
2. ```bash
    $ npm install
    # or
    $ yarn install
    ```
3. Renombrar el archivo `.env.example` a `.env`
4. Cambiar los valores de las variables de entorno
5. Levantar la base de datos con 
   ```bash
    $ docker-compose up -d
    ```
6. Levantar en modo desarrollo con 
   ```bash
    $ npm run start:dev
    # or
    $ yarn start:dev
    ```

## Servicios

`products`
Este servicio se encarga de manejar la logica de los productos, como crear, actualizar, eliminar, listar, etc.

Metodos de `products service`:

- `createProduct`: Recibe un objeto de tipo __CreateProductDto__ y crea un producto en la base de datos.
- `findAll`: Puede recibir un limite y un offset, y devuelve una lista de productos.
- `findOne`: Recibe un termino de busqueda y devuelve un producto que coincida con el termino.
- `update`: Recibe un id y un objeto de tipo __UpdateProductDto__ y actualiza el producto con el id especificado.
- `remove`: Recibe un id y elimina el producto con el id especificado.



