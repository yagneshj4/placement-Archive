// Import all workers. This registers their process() handlers with Bull.
// Import side effects are enough for Bull to attach queue processors.

import './embedding.worker.js'

console.log('All workers registered and listening')
