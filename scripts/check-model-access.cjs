// Script to check model access and permissions (CommonJS version)
const https = require('https');
require('dotenv').config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const MODEL_ID = 'qiskit/Qiskit-7B-QA';

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

async function checkModelAccess() {
  console.log(`🔍 Checking access to model: ${MODEL_ID}`);
  
  try {
    // First, check if the model exists and is accessible
    console.log('\n🔎 Checking model availability...');
    await checkModelStatus();
    
    // Then check if we have permission to use it
    console.log('\n🔑 Checking model permissions...');
    await checkModelPermissions();
    
  } catch (error) {
    console.error('\n❌ Error checking model access:', error.message);
    
    if (error.response) {
      console.error('Status Code:', error.response.status);
      if (error.response.data) {
        console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    // Provide specific guidance based on common issues
    if (error.message.includes('404')) {
      console.log('\n💡 This model might not exist or the ID might be incorrect.');
      console.log('   Please verify the model ID or check if it requires special access.');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n🔒 You might not have permission to access this model.');
      console.log('   - Check if you need to accept the model terms at: https://huggingface.co/' + MODEL_ID);
      console.log('   - Verify your API key has the necessary permissions');
    }
  }
}

async function checkModelStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'huggingface.co',
      path: `/api/models/${MODEL_ID}`,
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
          
          if (res.statusCode === 200) {
            console.log('✅ Model exists and is accessible');
            console.log('   - Model ID:', result.modelId);
            console.log('   - Private:', result.private || false);
            console.log('   - Downloads:', result.downloads || 'N/A');
            console.log('   - Tags:', result.tags?.join(', ') || 'None');
            console.log('   - Last Modified:', result.lastModified || 'N/A');
            resolve(result);
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${data}`);
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

async function checkModelPermissions() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'huggingface.co',
      path: `/api/models/${MODEL_ID}/permissions`,
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
          
          if (res.statusCode === 200) {
            console.log('✅ Model permissions:');
            console.log('   - Can read:', result.canRead || false);
            console.log('   - Can write:', result.canWrite || false);
            console.log('   - Can delete:', result.canDelete || false);
            console.log('   - Can edit:', result.canEdit || false);
            console.log('   - Can discuss:', result.canDiscuss || false);
            resolve(result);
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${data}`);
            error.response = { status: res.statusCode, data };
            reject(error);
          }
        } catch (e) {
          reject(new Error(`Failed to parse permissions: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Permissions check failed: ${error.message}`));
    });

    req.end();
  });
}

// Run the check
checkModelAccess()
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
