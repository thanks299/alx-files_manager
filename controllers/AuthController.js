import sha1 from 'sha1';
import { v4 as uuid } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authorization = req.header('Authorization');
    const encodedAuth = authorization.split(' ')[1];
    const decoded = Buffer.from(encodedAuth, 'base64').toString('utf8');
    if (!decoded.includes(':')) return res.status(401).json({ error: 'Unauthorized' });
    const [email, password] = decoded.split(':');

    const user = await dbClient.users.findOne({ email, password: sha1(password) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const token = uuid();
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(`auth_${token}`);

    return res.status(204).end();
  }
}

export default AuthController;
