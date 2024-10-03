import { ObjectID } from 'mongodb';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import { contentType } from 'mime-types';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.users.findOne({ _id: ObjectID(userId) });
    const {
      name, type, data, parentId, isPublic,
    } = req.body;
    const acceptedTypes = ['folder', 'file', 'image'];

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !acceptedTypes.includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });
    if (parentId) {
      const file = await dbClient.files.findOne({ _id: ObjectID(parentId) });
      if (!file) return res.status(400).json({ error: 'Parent not found' });
      console.log(file);
      if (file.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const newFile = {
      userId: user._id, name, type, parentId: parentId || '0', isPublic: isPublic || false,
    };

    if (type === 'folder') {
      await dbClient.files.insertOne(newFile);
      return res.status(201).json({
        id: newFile._id,
        userId: newFile.userId,
        name: newFile.name,
        type: newFile.type,
        isPublic: newFile.isPublic,
        parentId: newFile.parentId,
      });
    }

    if (!fs.existsSync(folderPath)) {
      await fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        return true;
      });
    }
    const filePath = `${folderPath}/${uuid()}`;
    const buff = Buffer.from(data, 'base64');
    await fs.writeFile(filePath, buff, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      return true;
    });
    newFile.localPath = filePath;
    await dbClient.files.insertOne(newFile);

    return res.status(201).json({
      id: newFile._id,
      userId: newFile.userId,
      name: newFile.name,
      type: newFile.type,
      isPublic: newFile.isPublic,
      parentId: newFile.parentId,
    });
  }

  static async getShow(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.users.findOne({ _id: ObjectID(userId) });
    const { id } = req.params;

    const file = await dbClient.files.findOne({ _id: ObjectID(id), userId: user._id });
    if (!file) return res.status(404).json({ error: 'Not found' });

    return res.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.users.findOne({ _id: ObjectID(userId) });
    const { parentId = '0', page = 0 } = req.query;

    const filesPerPage = 20;
    const skip = filesPerPage * page;

    const pipeline = [
      { $match: { userId: user._id, parentId } },
      { $skip: skip },
      { $limit: filesPerPage },
    ];

    const files = await dbClient.files.aggregate(pipeline).toArray();
    for (const file of files) {
      file.id = file._id;
      delete file._id;
      delete file.localPath;
    }

    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.users.findOne({ _id: ObjectID(userId) });
    const { id } = req.params;

    const file = await dbClient.files.findOne({ _id: ObjectID(id), userId: user._id });
    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.files.updateOne({ _id: file._id }, { $set: { isPublic: true } });

    return res.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: true,
      parentId: file.parentId,
    });
  }

  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.users.findOne({ _id: ObjectID(userId) });
    const { id } = req.params;

    const file = await dbClient.files.findOne({ _id: ObjectID(id), userId: user._id });
    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.files.updateOne({ _id: file._id }, { $set: { isPublic: false } });

    return res.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: false,
      parentId: file.parentId,
    });
  }

  static async getFile(req, res) {
    const { id } = req.params;

    const file = await dbClient.files.findOne({ _id: ObjectID(id) });
    if (!file) return res.status(404).json({ error: 'Not found' });
    if (!file.isPublic) {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(404).json({ error: 'Not found' });

      const user = await dbClient.users.findOne({ _id: ObjectID(userId) });
      if (file.userId.toString() !== user._id.toString()) {
        return res.status(404).json({ error: 'Not found' });
      }
    }

    if (file.type === 'folder') return res.status(400).json({ error: 'A folder doesn\'t have content' });

    if (!fs.existsSync(file.localPath)) return res.status(404).json({ error: 'Not found' });

    const mimeType = contentType(file.name);
    console.log(mimeType);
    res.setHeader('Content-Type', mimeType);
    const fileContent = await fs.readFileSync(file.localPath);
    return res.status(200).send(fileContent);
  }
}
export default FilesController;
