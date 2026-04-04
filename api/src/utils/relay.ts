import { Request, Response } from 'express';

export const handleRelayRequest = async (req: Request, res: Response, endpoint: string) => {
  try {
    const url = 'https://relay.firefox.com/api/v1/' + endpoint;

    const headers: Record<string, string> = {
      Authorization: `Token ${req.query.token}`
    };

    const fetchOptions: RequestInit = {
      method: req.method,
      headers
    };

    if (req.method === 'POST' || req.method === 'PATCH') {
      headers['Content-Type'] = 'application/json';

      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);

    if (response.status === 204) {
      return res.status(204).send();
    }

    const json = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: json.detail?.replace(/token/gi, 'API Key') || 'Something went wrong.'
      });
    }

    return res.status(response.status).json(json);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
};
