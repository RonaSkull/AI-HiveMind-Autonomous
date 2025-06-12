// Simple test to check environment variables
console.log('Environment Test');
console.log('----------------');
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '***' + process.env.HUGGINGFACE_API_KEY.slice(-4) : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('----------------');
