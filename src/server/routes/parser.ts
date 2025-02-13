import express from 'express'

import parserController from '../app/controllers/parser.controller'

const router = express.Router()

router.put('/parse', parserController.parser)

export default router
