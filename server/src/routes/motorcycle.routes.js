import { Router } from 'express';
import {
  list,
  getById,
  compare,
  getFilterMeta,
  create,
  update,
  remove,
} from '../controllers/motorcycle.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', list);
router.get('/meta/filters', getFilterMeta);
router.post('/compare', compare);
router.get('/:id', getById);

router.post('/', authRequired, create);
router.put('/:id', authRequired, update);
router.delete('/:id', authRequired, remove);

export default router;
