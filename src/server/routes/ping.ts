import express from 'express'

import pingController from '../app/controllers/ping.controller'

const router = express.Router()

router.get('/health', pingController.ping)

export default router
