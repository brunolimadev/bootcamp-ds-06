import multer from 'multer';
import path from 'path';

const directory = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory,
  storage: multer.diskStorage({
    destination: directory,
    filename(request, file, callback) {
      const fileName = `import_template.csv`;
      return callback(null, fileName);
    },
  }),
};
