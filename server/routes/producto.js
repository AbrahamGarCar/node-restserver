const express = require('express');
const { verificarToken, verificarAdmin_Role } = require('../middleware/autenticacion');

const app = express();
let Producto = require('../models/producto');
let Categoria = require('../models/categoria');

const _ = require('underscore');

//app.use( fileUpload({ useTempFiles: true }) );
/*=============================================
=               Crear producto                =
=============================================*/
app.post('/productos', verificarToken, async(req, res) => {
    let body = req.body;
    // let categoria = body.categoria;
    // let categoriaId = await Categoria.findOne({ descripcion: categoria }, "_id").then(id => {
    //     if (id.length == 0) {
    //         return res.status(400).json({
    //             ok: false,
    //             message: 'Categoria no existe en base de datos'
    //         });
    //     }
    //     return id;
    // });

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });


    producto.save((err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });
});


/*=============================================
=                 Buscar productos            =
=============================================*/

app.get('/productos/buscar/:termino', verificarToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});


/*=============================================
=                Obtener productos            =
=============================================*/
app.get('/productos/', verificarToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    console.log(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec(
            (err, productosDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if (!productosDB) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'ID no existe'
                        }
                    });
                }

                res.json({
                    ok: true,
                    productosDB
                });

            });

    //todos los productos
    //populate: usuario categoria
    //paginado

});

/*=============================================
=           Obtener producto por ID          =
=============================================*/
app.get('/productos/:id', (req, res) => {

    id = req.params.id;
    console.log(id);
    Producto.findById(id).populate('usuario', 'nombre email').populate('categoria', 'nombre')
        .exec(
            (err, productoDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    producto: productoDB
                });

            });

    //todos los productos
    //populate: usuario categoria
    //paginado
    //Producto.findOne()
});




/*=============================================
=          Actualizar producto                =
=============================================*/
app.put('/productos/:id', async(req, res) => {
    let id = req.params.id;
    let body = req.body;


    // if (producto.categoria) {
    //     let categoria = producto.categoria;
    //     let categoriaId = await Categoria.findOne({ descripcion: producto.categoria }, "_id").then(id => {
    //         if (id == null) {
    //             return res.status(400).json({
    //                 ok: false,
    //                 message: 'Categoria no existe en base de datos'
    //             });
    //         }
    //         return id;
    //     });
    //     producto.categoria = categoriaId;
    // }

    let producto = _.pick(body, ['categoria', 'nombre', 'precio', 'descripcion']);

    producto.precio = Number(producto.precio);


    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            productoDB,
        });

    });
    //grabar usuario
    //grabar una categoria

});

/*=============================================
=          Borrar producto                   =
=============================================*/
app.delete('/productos/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    id = req.params.id;
    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }
        res.json({
            ok: true,
            productoDB,
            message: 'Producto borrado'
        });
    });
    //grabar usuario
    //grabar una categoria
    //cambiar disponible pase a false

});






module.exports = app;