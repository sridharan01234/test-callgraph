// Data service to handle API calls
import { formatDate, capitalizeText } from '../utils/helpers';

// Sample data for demo purposes
const SAMPLE_DATA = [
  { id: 1, title: 'project report', date: '2025-04-15', description: 'Annual project performance report with detailed metrics and analysis.' },
  { id: 2, title: 'quarterly budget', date: '2025-05-01', description: 'Financial overview for Q2 2025.' },
  { id: 3, title: 'team evaluation', date: '2025-05-10', description: 'Team performance metrics and individual assessments.' }
];

/**
 * Fetches and formats documents from the API
 * @returns {Promise<Array>} Formatted document list
 */
export async function fetchDocuments() {
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      const formattedData = SAMPLE_DATA.map(item => ({
        ...item,
        title: capitalizeText(item.title),
        formattedDate: formatDate(item.date)
      }));
      resolve(formattedData);
    }, 300);
  });
}

/**
 * Gets a single document by ID
 * @param {number} id - Document ID
 * @returns {Promise<Object>} Document data
 */
export async function getDocumentById(id) {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const document = SAMPLE_DATA.find(doc => doc.id === id);
      
      if (document) {
        resolve({
          ...document,
          title: capitalizeText(document.title),
          formattedDate: formatDate(document.date)
        });
      } else {
        reject(new Error('Document not found'));
      }
    }, 200);
  });
}