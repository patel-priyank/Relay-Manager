import express from 'express';

import domainController from '../controllers/domain.controller';

const router = express.Router();

router.get('/', domainController.getAliases);
router.post('/', domainController.createAlias);
router.get('/:id', domainController.getAlias);
router.patch('/:id', domainController.updateAlias);
router.delete('/:id', domainController.deleteAlias);

export default router;
