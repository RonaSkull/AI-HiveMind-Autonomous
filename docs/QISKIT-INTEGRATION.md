# Qiskit Code Assistant Integration

This document explains how to set up and use the Qiskit Code Assistant with the AI HiveMind Autonomous system.

## Prerequisites

1. Install [Ollama](https://ollama.ai/) on your system
   - Download the Windows installer
   - Run the installer and select your D: drive as the installation directory (e.g., `D:\Ollama`)
   - Make sure to add Ollama to your system PATH during installation

2. Set up environment variables for custom model location:
   ```cmd
   # Set the Ollama models directory to your D: drive
   setx OLLAMA_MODELS "D:\path\to\ollama\models"
   ```

3. Node.js 16+ and npm/yarn

## Setup

1. Install the required dependencies:
   ```bash
   npm install
   ```

2. Open a new terminal (to load the new environment variables) and pull the Qiskit model:
   ```cmd
   # This will download several GB of data to D:\path\to\ollama\models
   npm run ollama:pull-model
   ```

3. Start the Ollama server in a separate terminal:
   ```cmd
   # Make sure to set the OLLAMA_MODELS environment variable
   set OLLAMA_MODELS=D:\path\to\ollama\models
   npm run ollama:serve
   ```
   
   Note: Keep this terminal open while working with the Qiskit Code Assistant

4. Create a `.env` file in the project root with the following variables:
   ```env
   # Ollama configuration
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_IS_LOCAL=true
   
   # IBM Quantum API (optional, for execution)
   IBM_QUANTUM_API_KEY=your_api_key_here
   IBM_QUANTUM_INSTANCE=your_instance_here
   ```

## Usage

### Running the Example

Run the example script to see the Qiskit Code Assistant in action:

```bash
npm run qiskit:example
```

This will:
1. Initialize the Qiskit Code Assistant
2. Generate a quantum circuit from a natural language description
3. Optimize the circuit
4. (If IBM Quantum API key is provided) Execute the circuit on IBM Quantum

### Using in Your Code

```typescript
import { qiskitCodeAssistant } from './agents/QiskitCodeAssistant';

// Initialize the assistant
await qiskitCodeAssistant.initialize();

// Generate quantum code from a description
const { code, metadata } = await qiskitCodeAssistant.generateCode(
  'Create a 2-qubit quantum circuit that creates a Bell state',
  {
    language: 'python',
    optimizationLevel: 1,
    targetBackend: 'ibmq_qasm_simulator'
  }
);

console.log('Generated code:', code);

// Optimize an existing circuit
const optimizationResult = await qiskitCodeAssistant.optimizeCircuit(
  `from qiskit import QuantumCircuit
   qc = QuantumCircuit(2)
   qc.h(0)
   qc.cx(0, 1)
   qc.measure_all()`,
  2 // Optimization level
);

console.log('Optimized code:', optimizationResult.optimizedCode);

// Execute a circuit (requires IBM Quantum API key)
try {
  const result = await qiskitCodeAssistant.executeCircuit(
    optimizationResult.optimizedCode,
    {
      shots: 1000,
      backend: 'ibmq_qasm_simulator',
      useHardware: false
    }
  );
  console.log('Execution result:', result);
} catch (error) {
  console.error('Execution failed:', error);
}
```

## Troubleshooting

### Ollama Connection Issues

If you see connection errors:
1. Make sure Ollama is running (`ps aux | grep ollama` on Unix-like systems)
2. Check that the `OLLAMA_BASE_URL` in your `.env` file is correct
3. Try accessing `http://localhost:11434/api/tags` in your browser or with `curl`

### Model Not Found

If you see "model not found" errors:
1. Make sure you've pulled the model: `npm run ollama:pull-model`
2. Check available models with: `ollama list`

### IBM Quantum API

To execute circuits on real quantum hardware or simulators:
1. Get an API key from [IBM Quantum Experience](https://quantum-computing.ibm.com/)
2. Add it to your `.env` file
3. Set the correct instance if needed

## License

This integration is part of the AI HiveMind Autonomous project. See the main LICENSE file for details.
