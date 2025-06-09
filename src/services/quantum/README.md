# Quantum Computing Integration

This module provides integration with IBM Quantum computing services for the AI HiveMind Autonomous project.

## Features

- Quantum circuit execution on IBM Quantum backends
- Job status tracking and management
- Easy-to-use API for quantum operations
- TypeScript support with strict typing

## Prerequisites

- Node.js 16+
- IBM Quantum API key (set in `.env` file)

## Configuration

Add the following to your `.env` file:

```
IBM_QUANTUM_API_KEY=your_api_key_here
IBM_QUANTUM_INSTANCE=ibm-q/open/main
```

## Usage

```typescript
import { quantumService } from './services/quantum';
import { runQuantumExample } from './services/quantum/examples/QuantumExample';

// Check if quantum service is available
if (quantumService.isAvailable()) {
  // Run a quantum example
  await runQuantumExample();
  
  // Or use the service directly
  const circuit = {
    name: 'bell-state',
    qubits: 2,
    operations: [
      { gate: 'h', qubits: [0] },
      { gate: 'cx', qubits: [0, 1] },
      { gate: 'measure', qubits: [0, 1], cbits: [0, 1] }
    ]
  };
  
  const result = await quantumService.runCircuit(circuit, 1000);
  console.log('Quantum result:', result);
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run quantum service tests only
npm test -- quantum

# Run with coverage
npm run test:coverage
```

## Example

See `src/services/quantum/examples/QuantumExample.ts` for a complete example of creating and running a quantum circuit.

## Error Handling

The service includes comprehensive error handling for:
- Missing or invalid API keys
- Network issues
- Quantum job failures
- Timeout handling

## Security

- API keys are never logged or exposed in error messages
- All quantum operations are rate-limited
- Sensitive data is handled securely

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
