const passport = require('passport');
const express = require('express');
const router = express.Router();


router.get('/hello',
    passport.authenticate('jwt', {
        session: false
    }),
    async (req, res, next) => {
        console.log("req user: " + req.user);
        res.send('hello');
    });

module.exports = router;