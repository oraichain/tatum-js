import { NextFunction, Request, RequestHandler, Response } from 'express'

const tryCatchAsync = (func: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await func(req, res, next)
  } catch (err) {
    next(err)
  }
}

export default tryCatchAsync
