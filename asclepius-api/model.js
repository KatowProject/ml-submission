const tf = require('@tensorflow/tfjs-node');
const Storage = require('@google-cloud/storage');
const fs = require('fs');

async function loadModel() {
    const storage = new Storage();
    const bucket = await storage.bucket('asclepius-kato-storage');

    // get all files from the bucket
    const [files] = await bucket.getFiles();

    // download all include bin



}

function predict(model, data) {
    const tensor = tf.tensor(data);
    const prediction = model.predict(tensor);
    return prediction.dataSync();
}

module.exports = {
    loadModel,
    predict,
};