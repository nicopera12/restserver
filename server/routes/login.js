const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');

const app = express()

app.post('/login', (req, res) => {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }
        let token = jwt.sign({
            usuario
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario,
            token
        })

    })
})

//Configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,

    }

}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUsr = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            })
        });
    Usuario.findOne({ email: googleUsr.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (usuario) {
            if (!usuario.google) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticacion manual'
                    }
                })
            } else {
                let token = jwt.sign({
                    usuario
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario,
                    token
                })
            }
        } else {
            //Si el usuario no existre en nuestra BD
            let usuarioNew = new Usuario();
            usuarioNew.nombre = googleUsr.nombre;
            usuarioNew.email = googleUsr.email;
            usuarioNew.img = googleUsr.img;
            usuarioNew.google = true;
            usuarioNew.password = ':)';

            usuarioNew.save((err, usuarioDb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    usuario
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario,
                    token
                })
            })
        }
    })

})

module.exports = app;