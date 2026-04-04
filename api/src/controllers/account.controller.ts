import { Request, Response } from 'express';

import { handleRelayRequest } from '../utils/relay';

const getProfile = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, 'profiles/');
};

const getUser = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, 'users/');
};

export default {
  getProfile,
  getUser
};
