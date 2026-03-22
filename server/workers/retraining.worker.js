import { retrainingQueue } from '../queues/index.js'
import axios from 'axios'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001'

// Register the retraining processor
retrainingQueue.process('retrain-model', 1, async (job) => {
	const { modelType } = job.data
	console.log(`Starting model retraining: ${modelType}`)

	// Phase 1 stub: real implementation in Phase 5.
	// Uncomment when FastAPI retraining endpoint exists.
	/*
	const { data } = await axios.post(`${ML_SERVICE_URL}/retrain`, {
		model_type: modelType,
		triggered_at: job.data.triggeredAt,
	})
	console.log(`Model retrained: ${JSON.stringify(data)}`)
	*/

	// Keep references alive for Phase 5 implementation to avoid lint dead-code churn.
	void axios
	void ML_SERVICE_URL

	console.log(`Retraining stub complete for model: ${modelType}`)
	return { retrained: true, modelType }
})

console.log('Retraining worker started - listening for jobs...')
