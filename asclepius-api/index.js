require('dotenv').config();

const express = require('express');
const Multer = require('multer');
const cors = require('cors');

const { loadModel, predict } = require('./model');
const { getPredictions } = require('./firestore');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 1000000,
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image/)) {
            return cb(new Multer.MulterError('LIMIT_FILE_TYPE'));
        } else {
            cb(null, true);
        }
    },
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

            res.status(201).json({
                status: "success",
                message: "Model is predicted successfully",
                data: prediction
            });
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

        res.json({
            status: "success",
            data: predictions
        })
    });

    app.use((error, req, res, next) => {
        if (error instanceof Multer.MulterError) {
            switch (error.code) {
                case 'LIMIT_FILE_SIZE':
                    return res.status(413).send({
                        status: "fail",
                        message: "Payload content length greater than maximum allowed: 1000000"
                    });

                case 'LIMIT_FILE_TYPE':
                    return res.status(415).send({
                        status: "fail",
                        message: "Invalid file type. Only images are allowed."
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