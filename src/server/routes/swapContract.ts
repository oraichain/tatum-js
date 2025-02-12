import express from 'express'

import swapContractController from '../app/controllers/swapContract.controller'

const router = express.Router()

router.put('/swap', swapContractController.swap)

export default router
