import { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const file = req.body.file;
  console.log(file);
  res.status(200).json({ text: 'Hello' });
}

export default handler
