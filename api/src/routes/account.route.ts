import express from 'express';

import accountController from '../controllers/account.controller';

const router = express.Router();

router.get('/profile', accountController.getProfile);
router.get('/user', accountController.getUser);

export default router;
