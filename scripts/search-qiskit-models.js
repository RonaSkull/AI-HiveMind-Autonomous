// Script to search for Qiskit-related models on Hugging Face
const https = require('https');
require('dotenv').config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const SEARCH_QUERY = 'qiskit';

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

async function searchModels() {
  console.log(`🔍 Searching for Qiskit-related models...`);
  
  try {
    const models = await fetchModels();
    
    if (models.length === 0) {
      console.log('\n❌ No Qiskit-related models found.');
      return;
    }
    
    console.log(`\n✅ Found ${models.length} Qiskit-related models:`);
    
    // Display basic info about each model
    models.forEach((model, index) => {
      console.log(`\n${index + 1}. ${model.modelId}`);
      console.log(`   - Downloads: ${model.downloads || 'N/A'}`);
      console.log(`   - Likes: ${model.likes || 0}`);
      console.log(`   - Private: ${model.private ? 'Yes' : 'No'}`);
      console.log(`   - Tags: ${model.tags?.join(', ') || 'None'}`);
      console.log(`   - URL: https://huggingface.co/${model.modelId}`);
    });
    
    // If we found models, check if any are suitable for quantum code generation
    const codeGenModels = models.filter(model => 
      model.tags?.some(tag => 
        ['text-generation', 'qiskit', 'quantum'].includes(tag.toLowerCase())
      )
    );
    
    if (codeGenModels.length > 0) {
      console.log('\n🚀 Potential models for quantum code generation:');
      codeGenModels.forEach(model => {
        console.log(`   - ${model.modelId} (${model.tags?.join(', ')})`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error searching for models:', error.message);
    
    if (error.response) {
      console.error('Status Code:', error.response.status);
      if (error.response.data) {
        console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

async function fetchModels() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'huggingface.co',
      path: `/api/models?search=${encodeURIComponent(SEARCH_QUERY)}&sort=downloads&direction=-1`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (Array.isArray(result)) {
            resolve(result);
          } else {
            const error = new Error('Unexpected response format');
            error.response = { status: res.statusCode, data };
            reject(error);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.end();
  });
}

// Run the search
searchModels()
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
