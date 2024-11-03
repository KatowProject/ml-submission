const Firestore = require('@google-cloud/firestore');

const db = new Firestore();

const predictionsCollection = db.collection('predictions');

function storePrediction(id, data) {
    return predictionsCollection.doc(id).set(data);
}
function getPredictions() {
    return predictionsCollection.get();
}

module.exports = {
    storePrediction,
    getPredictions,
};