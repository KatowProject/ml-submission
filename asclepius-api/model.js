const { Storage } = require('@google-cloud/storage');
const tf = require('@tensorflow/tfjs-node');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const randomUUID = () => crypto.randomUUID();

const { storePrediction } = require('./firestore');

const MODEL_DIR = path.join(__dirname, 'model');
const MODEL_PATH = path.join(MODEL_DIR, 'model.json');
const BUCKET_NAME = process.env.BUCKET_NAME;

const storage = new Storage();

async function downloadModel() {
    if (!fs.existsSync(MODEL_DIR)) {
        fs.mkdirSync(MODEL_DIR);
    }

    const bucket = storage.bucket(BUCKET_NAME);

    const [files] = await bucket.getFiles();

    // save all files
    await Promise.all(
        files.map(async file => {
            const destination = path.join(MODEL_DIR, file.name);
            await file.download({ destination });
        })
    );
}

/**
 * loadModel loads the model from the MODEL_URL environment variable.
 * @returns {Promise<tf.GraphModel>}
 */
async function loadModel() {
    if (!fs.existsSync(MODEL_PATH)) await downloadModel();

    console.log('Loading model...');

    const model = await tf.loadGraphModel(`file://${MODEL_PATH}`);

    return model;
}

/**
 * 
 * @param {tf.GraphModel} model 
 * @param {Express.Multer.File} image 
 */
async function predict(model, image) {
    const tensor = tf.node
        .decodeJpeg(image.buffer, 3)
        .resizeNearestNeighbor([224, 224])
        .expandDims()
        .toFloat();

    const predictions = model.predict(tensor);
    const score = await predictions.data();
    const confidences = Math.max(...score) * 100;

    const probRes = score[0];
    const classLabel = ['Cancer', 'Non-cancer'];
    const label = classLabel[probRes > 0.5 ? 0 : 1];

    const suggestion = label === 'Cancer' ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.';

    if (confidences > 1 && label == 'Non-cancer') {
        throw new Error('Terjadi kesalahan dalam melakukan prediksi');
    }

    const predictResult = {
        id: randomUUID(),
        result: label,
        suggestion,
        createdAt: new Date().toISOString()
    }

    await storePrediction(predictResult.id, predictResult);

    return predictResult;
}

module.exports = {
    loadModel,
    predict,
};