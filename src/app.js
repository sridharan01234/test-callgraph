// Main application entry point
import { Dashboard } from './components/Dashboard';

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    console.log('Initializing document management application...');
    
    // Create and initialize the dashboard
    const dashboard = new Dashboard('app-root');
    await dashboard.initialize();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    document.getElementById('app-root').innerHTML = `
      <div class="error-message">
        Failed to initialize application: ${error.message}
      </div>
    `;
  }
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export initialization function for testing purposes
export { initializeApp };