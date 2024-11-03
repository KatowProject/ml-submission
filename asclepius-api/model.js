const tf = require('@tensorflow/tfjs-node');

function loadModel() {
    return tf.loadLayersModel('file://model/model.json');
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