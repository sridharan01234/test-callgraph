// Test script for Simple CallGraph analysis
import path from 'path';
import { SimpleCallGraphService } from './SimpleCallGraphService.js';
import fs from 'fs/promises';

async function testCallGraphAnalysis() {
  console.log('Starting callgraph analysis test with SimpleCallGraphService...');
  
  // Set the root directory to our test repository
  const rootDir = path.resolve('./test-callgraph/src');
  console.log(`Analyzing files in: ${rootDir}`);
  
  try {
    // Run the analysis
    const callGraph = await SimpleCallGraphService.extractCallGraph(rootDir);
    
    // Print the callgraph results
    console.log('CallGraph Analysis Results:');
    console.log('---------------------------');
    console.log(`Found ${Object.keys(callGraph.fileGraph || {}).length} file dependencies`);
    
    // Print file dependencies
    console.log('\nFile Dependencies:');
    console.log('---------------------------');
    Object.entries(callGraph.fileGraph || {}).forEach(([file, dependencies]) => {
      console.log(`${file} depends on:`);
      dependencies.forEach(dep => console.log(`  - ${dep}`));
    });
    
    // Save the results to a JSON file for inspection
    await fs.writeFile(
      path.resolve('./test-callgraph/callgraph-results.json'), 
      JSON.stringify(callGraph, null, 2)
    );
    console.log('\nResults saved to callgraph-results.json');
    
    // Test the updateRelatedFiles function
    console.log('\nTesting updateRelatedFiles function:');
    console.log('---------------------------');
    
    // Mock analysis results for a single file
    const mockAnalyses = [
      {
        filename: 'app.js',
        analysis: { content: "// App content" }
      },
      {
        filename: 'components/Dashboard.js',
        analysis: { content: "// Dashboard content" }
      },
      {
        filename: 'utils/helpers.js',
        analysis: { content: "// Helpers content" }
      }
    ];
    
    const updatedAnalyses = SimpleCallGraphService.updateRelatedFiles(mockAnalyses, callGraph);
    console.log('Updated analyses with related files:');
    updatedAnalyses.forEach(analysis => {
      console.log(`\nFile: ${analysis.filename}`);
      console.log(`Related files: ${analysis.relatedFiles?.length || 0}`);
      if (analysis.relatedFiles?.length > 0) {
        analysis.relatedFiles.forEach(file => console.log(`  - ${file}`));
      }
      console.log(`Direct dependencies: ${analysis.impactAnalysis?.directDependencies?.length || 0}`);
      console.log(`Total impacted files: ${analysis.impactAnalysis?.totalImpactedFiles || 0}`);
    });
    
  } catch (error) {
    console.error('Error during callgraph analysis:', error);
  }
}

// Run the test
testCallGraphAnalysis().catch(console.error);