console.log('Test file is running!');
console.log('If you see this, modules are loading correctly!');

// Try to import one of our modules to test path resolution
try {
  const { orchestratorAgent } = await import('./src/agents/OrchestratorAgent.js');
  console.log('Successfully imported orchestratorAgent:', orchestratorAgent.constructor.name);
} catch (error) {
  console.error('Failed to import orchestratorAgent:', error);
}

// Keep the process alive
setInterval(() => {}, 1000);

// Make this file a module
export {};
