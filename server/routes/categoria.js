const express = require('express');

let { verificarToken, verificarAdmin_Role } = require('../middleware/autenticacion');

let app = express();
const _ = require('underscore');

const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');

/*=============================================
=            Crear nueva categoria            =
=============================================*/
app.post('/categoria', verificarToken, (req, res) => {

    let body = req.body;
    let usuario = req.usuario._id;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: usuario,
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


//regresa nueva categoria
//req.usuario._id

/*=============================================
=     Mostrar todas las categorias           =
=============================================*/
app.get('/categoria', verificarToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });

        });
});


/*=============================================
=     Mostrar una categoria por ID            =
=============================================*/
app.get('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID noes correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria
        });
    });
});




/*=============================================
=          Actualizar categoria               =
=============================================*/
app.put('/categoria/:id', verificarToken, (req, res) => {
    //Categoria.findById()
    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);
    console.log(id);
    console.log(body);
    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/*=============================================
=          Borrar categoria               =
=============================================*/
app.delete('/categoria/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    //Categoria.findById()
    //solo un administrador puede borrar categoria
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }


        res.json({
            ok: true,
            usuario: categoriaBorrada
        });


    });
});





module.exports = app;