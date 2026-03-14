import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { sseController } from '../controllers/sse.controller';

const router = Router();

router.post('/',        jobController.createJob);
router.get('/',         jobController.getAllJobs);
router.get('/:id',      jobController.getJob);
router.delete('/:id',   jobController.deleteJob);
router.get('/:id/events', sseController.streamJob);

export default router;