import { Request, Response } from 'express';

import { handleRelayRequest } from '../utils/relay';

const getAliases = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, 'relayaddresses/');
};

const createAlias = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, 'relayaddresses/');
};

const getAlias = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, `relayaddresses/${req.params.id}/`);
};

const updateAlias = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, `relayaddresses/${req.params.id}/`);
};

const deleteAlias = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, `relayaddresses/${req.params.id}/`);
};

export default {
  getAliases,
  createAlias,
  getAlias,
  updateAlias,
  deleteAlias
};
