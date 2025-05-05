// Document List Component
import { fetchDocuments } from '../services/dataService';
import { truncateText } from '../utils/helpers';

/**
 * Renders a list of documents with pagination
 */
export class DocumentList {
  constructor(containerId, pageSize = 5) {
    this.container = document.getElementById(containerId);
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.documents = [];
    this.totalPages = 0;
  }
  
  /**
   * Initialize the component
   */
  async initialize() {
    try {
      await this.loadDocuments();
      this.render();
      this.attachEventListeners();
    } catch (error) {
      this.renderError('Failed to load documents');
      console.error('Document list initialization failed:', error);
    }
  }
  
  /**
   * Fetch document data from the service
   */
  async loadDocuments() {
    try {
      this.documents = await fetchDocuments();
      this.totalPages = Math.ceil(this.documents.length / this.pageSize);
    } catch (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }
  }
  
  /**
   * Render the document list
   */
  render() {
    if (!this.container) return;
    
    // Clear the container
    this.container.innerHTML = '';
    
    // Calculate paging
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageItems = this.documents.slice(startIndex, startIndex + this.pageSize);
    
    if (pageItems.length === 0) {
      this.renderEmpty();
      return;
    }
    
    // Create list element
    const list = document.createElement('ul');
    list.className = 'document-list';
    
    // Add items to list
    pageItems.forEach(doc => {
      const item = document.createElement('li');
      item.className = 'document-item';
      
      const title = document.createElement('h3');
      title.textContent = doc.title;
      
      const date = document.createElement('span');
      date.className = 'document-date';
      date.textContent = doc.formattedDate;
      
      const description = document.createElement('p');
      description.textContent = truncateText(doc.description, 80);
      
      item.appendChild(title);
      item.appendChild(date);
      item.appendChild(description);
      list.appendChild(item);
    });
    
    this.container.appendChild(list);
    this.renderPagination();
  }
  
  /**
   * Render pagination controls
   */
  renderPagination() {
    if (this.totalPages <= 1) return;
    
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = this.currentPage === 1;
    prevButton.onclick = () => this.changePage(this.currentPage - 1);
    
    // Page indicator
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = this.currentPage === this.totalPages;
    nextButton.onclick = () => this.changePage(this.currentPage + 1);
    
    pagination.appendChild(prevButton);
    pagination.appendChild(pageInfo);
    pagination.appendChild(nextButton);
    
    this.container.appendChild(pagination);
  }
  
  /**
   * Change the current page
   */
  changePage(pageNumber) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.currentPage = pageNumber;
    this.render();
  }
  
  /**
   * Display an error message
   */
  renderError(message) {
    if (!this.container) return;
    this.container.innerHTML = `<div class="error-message">${message}</div>`;
  }
  
  /**
   * Display an empty state message
   */
  renderEmpty() {
    if (!this.container) return;
    this.container.innerHTML = '<div class="empty-state">No documents found</div>';
  }
  
  /**
   * Attach any additional event listeners
   */
  attachEventListeners() {
    // Add any additional event listeners as needed
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    // Adjust layout as needed
    console.log('Window resized, adjusting layout...');
  }
}