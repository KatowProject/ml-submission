const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();

const predictionsCollection = db.collection('predictions');

async function storePrediction(id, data) {
    return predictionsCollection.doc(id).set(data);
}

async function getPredictions() {
    const predictions = [];

    const snapshot = await predictionsCollection.get();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        predictions.push({
            id: doc.id,
            history: {
                result: data.result,
                createdAt: data.createdAt,
                suggestion: data.suggestion,
                id: data.id,
            },
        });
    }

    return predictions;
}

module.exports = {
    storePrediction,
    getPredictions,
};