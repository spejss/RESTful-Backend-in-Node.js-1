const passport = require('passport');
const express = require('express');
const router = express.Router();
const {
    User
} = require('../db/index');
const isAdmin = require('../middlewares/isAdmin');

const userController = require('../controllers/userController');

/**
 * @api {get} /users All users
 * @apiName Get list of all users
 * @apiGroup Users
 * 
 * @apiSuccess {Array} array of user id's. 
 * 
 * 
 */
router.get('/users', isAdmin, userController.getAllUsers);

/**
 * @api {get} /users/:id User data
 * @apiName Get user data
 * @apiGroup Users
 * 
 * @apiParam {Number} id Users unique ID.
 * 
 * @apiSuccess {User} JSON object containing user data. 
 * 
 * 
 */
router.get('/users/:id', async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id);
        // res.status(200).json(user);
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

/**
 * @api {post} /users
 * @apiName Create user
 * @apiGroup Users
 * 
 * @apiSuccess {User} JSON object containing user data. 
 * 
 * @apiParamExample {json} Request-Example:
 *[
     {
        "email": 'test@test.com',
        "username": 'testUser',
        "password": "testpassword",
        "firstName": "Max",
        "lastName": "Mustermann",
        "address": "Musterstr. 39, 44227 Dortmund",
        "status": "member",
        "emailNotifications": true,
    }
]
 */
router.post('/users', [passport.authenticate('jwt', {
    session: false
}), isAdmin], async (req, res, next) => {
    try {
        let users = await User.insertMany(req.body);
        if (!users) {
            res.status(500).send('Internal server error');
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

/**
 * @api {post} /users/:id Update user
 * @apiName Update user data
 * @apiGroup Users
 * 
 * @apiParam {Number} id Users unique ID.
 * 
 * @apiSuccess {User} JSON object containing user data. 
 * 
 * 
 */
router.post('/users/:id', passport.authenticate('jwt', {
    session: false
}), async (req, res, next) => {
    // admin or that user
    try {
        if (req.user) {
            // permission check TODO: add permissions
            if (req.user.status === 'admin' || req.user._id === req.params.id) {
                let user = await User.findOneAndUpdate({
                    '_id': req.params.id
                }, req.body.user, {
                    upsert: true
                });

                if (!user) {
                    res.status(401).send('Unauthorized.');
                }

                res.status(200).json(user);
            }
        } else {
            res.status(401).json('Unauthorized.');
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

/**
 * @api {delete} /users/:id Delete user
 * @apiName Delete user
 * @apiGroup Users
 * 
 * @apiParam {Number} id Users unique ID.
 * 
 * @apiSuccess {User} JSON object containing user data. 
 * 
 * @apiExample {curl} Example usage:
 *          curl 
 * 
 */
router.delete('/users/:id', [passport.authenticate('jwt', {
    session: false
}), isAdmin], async (req, res, next) => {
    try {
        let err = await User.remove({
            _id: req.params.id
        });

        if (err) {
            res.status(500).send('Internal server error');
        }

        res.status(200).send('User has been deleted succesfully');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;