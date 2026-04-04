import { Request, Response } from 'express';

import { handleRelayRequest } from '../utils/relay';

const getAliases = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, 'domainaddresses/');
};

const createAlias = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, 'domainaddresses/');
};

const getAlias = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, `domainaddresses/${req.params.id}/`);
};

const updateAlias = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, `domainaddresses/${req.params.id}/`);
};

const deleteAlias = async (req: Request, res: Response) => {
  return handleRelayRequest(req, res, `domainaddresses/${req.params.id}/`);
};

export default {
  getAliases,
  createAlias,
  getAlias,
  updateAlias,
  deleteAlias
};
