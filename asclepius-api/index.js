require('dotenv').config();

const express = require('express');
const Multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');

const randomUUID = () => crypto.randomUUID();

const { loadModel, predict } = require('./model');
const { getPredictions } = require('./firestore');

const multer = Multer({
    storage: Multer.memoryStorage(), fileFilter: (req, file, cb) => {
        const size = file.size ?? parseInt(req.headers['content-length']);
        console.log(size);
        if (size > 1000000) {
            return cb(new Multer.MulterError('LIMIT_FILE_SIZE'));
        } else if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Multer.MulterError('LIMIT_FILE_TYPE'));
        } else {
            cb(null, true);
        }
    }
});

const start = async () => {
    const model = await loadModel();

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.post('/predict', multer.single('image'), async (req, res) => {
        try {
            const image = req.file;
            const prediction = await predict(model, image);
            res.json(prediction);
        } catch (error) {
            console.error(error);
            res.status(400).send({
                status: "fail",
                message: "Terjadi kesalahan dalam melakukan prediksi"
            });
        }
    });

    app.get('/predict/histories', async (req, res) => {
        const predictions = await getPredictions();

        console.log(predictions);
        res.json({
            status: "success"
        })
    });

    app.use((error, req, res, next) => {
        console.error(error);
        if (error instanceof Multer.MulterError) {
            switch (error.code) {
                case 'LIMIT_FILE_SIZE':
                    return res.status(413).send({
                        status: "fail",
                        message: "Payload content length greater than maximum allowed: 1000000"
                    });
                default:
                    return res.status(400).send({
                        status: "fail",
                        message: error.message
                    });
            }
        }
    });

    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
};

start().catch(console.error);