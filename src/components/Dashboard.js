// Dashboard Component
import { DocumentList } from './DocumentList';
import { getDocumentById } from '../services/dataService';
import { capitalizeText } from '../utils/helpers';

/**
 * Dashboard component that displays document lists and detail views
 */
export class Dashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.documentList = null;
    this.currentDocumentId = null;
  }
  
  /**
   * Initialize the dashboard
   */
  async initialize() {
    this.renderLayout();
    
    // Initialize document list
    this.documentList = new DocumentList('document-list-container');
    await this.documentList.initialize();
    
    this.attachEventListeners();
  }
  
  /**
   * Create the basic layout structure
   */
  renderLayout() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="dashboard">
        <header class="dashboard-header">
          <h1>${capitalizeText('document management system')}</h1>
        </header>
        <div class="dashboard-content">
          <div class="sidebar">
            <h2>Documents</h2>
            <div id="document-list-container"></div>
          </div>
          <div class="main-content">
            <div id="document-detail-container">
              <div class="empty-state">Select a document to view details</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Load and display a single document
   */
  async loadDocument(id) {
    if (!id) return;
    
    this.currentDocumentId = id;
    const detailContainer = document.getElementById('document-detail-container');
    
    if (!detailContainer) return;
    
    try {
      detailContainer.innerHTML = '<div class="loading">Loading document...</div>';
      const document = await getDocumentById(id);
      this.renderDocumentDetail(document, detailContainer);
    } catch (error) {
      detailContainer.innerHTML = `<div class="error-message">Error loading document: ${error.message}</div>`;
    }
  }
  
  /**
   * Render a document's details
   */
  renderDocumentDetail(document, container) {
    container.innerHTML = `
      <div class="document-detail">
        <h2>${document.title}</h2>
        <div class="document-metadata">
          <span class="document-date">${document.formattedDate}</span>
        </div>
        <div class="document-content">
          <p>${document.description}</p>
        </div>
        <div class="document-actions">
          <button id="edit-document-btn">Edit</button>
          <button id="delete-document-btn">Delete</button>
        </div>
      </div>
    `;
    
    // Attach action buttons
    document.getElementById('edit-document-btn').addEventListener('click', () => {
      this.editDocument(document.id);
    });
    
    document.getElementById('delete-document-btn').addEventListener('click', () => {
      this.deleteDocument(document.id);
    });
  }
  
  /**
   * Handle document editing
   */
  editDocument(id) {
    console.log(`Editing document ${id}`);
    // Show edit form or modal
  }
  
  /**
   * Handle document deletion
   */
  deleteDocument(id) {
    console.log(`Deleting document ${id}`);
    // Show confirmation dialog
  }
  
  /**
   * Set up event listeners
   */
  attachEventListeners() {
    // Example: Listen for document selection events
    document.addEventListener('document-selected', (event) => {
      const { documentId } = event.detail;
      this.loadDocument(documentId);
    });
  }
}