import express from 'express';
import * as user from '../controllers/userController.js'; 

const router = express.Router();

router.post('/login', user.login);

export default (app) => {
    app.use('/', router);
};
