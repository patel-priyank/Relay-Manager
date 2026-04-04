import express from 'express';

import randomController from '../controllers/random.controller';

const router = express.Router();

router.get('/', randomController.getAliases);
router.post('/', randomController.createAlias);
router.get('/:id', randomController.getAlias);
router.patch('/:id', randomController.updateAlias);
router.delete('/:id', randomController.deleteAlias);

export default router;
