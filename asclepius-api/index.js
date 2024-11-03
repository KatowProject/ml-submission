const express = require('express');
const Multer = require('multer');
const cors = require('cors');
const { loadModel } = require('./model');

const multer = Multer({
    storage: Multer.memoryStorage(), fileFilter: (req, file, cb) => {
        if (file.size > 1000000) {
            return cb(new Error('File size exceeds limit'));
        } else if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File type is not supported'));
        } else {
            cb(null, true);
        }
    }
});

const app = express();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
    console.log('Middleware');
    try {
        if (!req.model) {
            req.model = await loadModel();
            console.log('Model loaded');
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred');
    }
});

app.post('/predict', multer.single('image'), async (req, res) => {

});

app.use((err, req, res, next) => {
    if (err instanceof Multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(413).json({
                    status: "fail",
                    message: "Payload content length greater than maximum allowed: 1000000"
                });
            default:
                return res.status(400).send('An error occurred');
        }
    }
})


app.listen(process.env.PORT || 8080, () => console.log('App listening on port 8080'));
