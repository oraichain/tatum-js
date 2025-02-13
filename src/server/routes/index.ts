import express from 'express'

import parser from './parser'
import ping from './ping'
import swapContract from './swapContract'

const router = express.Router()

const defaultRoutes: Array<{
  path: string
  route: express.Router
}> = [
  {
    path: '/ping',
    route: ping,
  },
  {
    path: '/swap-contract',
    route: swapContract,
  },
  {
    path: '/parser',
    route: parser,
  },
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
