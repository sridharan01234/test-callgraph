// Simplified CallGraph Service for testing
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

/**
 * A simplified version of CallGraphService that uses regular expressions
 * instead of AST parsing to detect file dependencies
 */
export class SimpleCallGraphService {
  static async extractCallGraph(rootDir, targetFiles = []) {
    // Track file-level dependencies
    const fileEdges = {};
    const fileNameMap = {};
    
    const recordFileDependency = (sourceFile, targetFile) => {
      fileEdges[sourceFile] = fileEdges[sourceFile] || new Set();
      fileEdges[sourceFile].add(targetFile);
    };
    
    const normalizePath = (filePath) => {
      // Handle both local filesystem paths and GitHub-style paths
      if (filePath.startsWith('/')) {
        return path.relative(rootDir, filePath);
      }
      return filePath;
    };
    
    // Helper function to check file existence synchronously
    const fileExistsSync = (filePath) => {
      try {
        return existsSync(filePath);
      } catch (err) {
        return false;
      }
    };
    
    // Helper function to resolve import paths synchronously
    const resolveImportPathSync = (importPath, importDir) => {
      // Try to resolve the exact import with various extensions
      const potentialPaths = [
        path.resolve(importDir, importPath),
        path.resolve(importDir, `${importPath}.js`),
        path.resolve(importDir, `${importPath}.ts`),
        path.resolve(importDir, `${importPath}.jsx`),
        path.resolve(importDir, `${importPath}.tsx`),
        path.resolve(importDir, `${importPath}/index.js`),
        path.resolve(importDir, `${importPath}/index.ts`),
        path.resolve(importDir, `${importPath}/index.jsx`),
        path.resolve(importDir, `${importPath}/index.tsx`),
      ];
      
      for (const potential of potentialPaths) {
        if (fileExistsSync(potential)) {
          return potential;
        }
      }
      return null;
    };
    
    // Extract imports using regular expressions instead of AST parsing
    const extractImports = (content) => {
      const imports = [];
      const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
      const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      while ((match = requireRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      
      return imports;
    };

    const processFile = async (filePath, normalizedPath) => {
      try {
        // Store normalized path to actual path mapping
        fileNameMap[normalizedPath] = filePath;
        
        const content = await fs.readFile(filePath, 'utf8');
        const currentFile = normalizedPath;
        
        // Extract all imports
        const imports = extractImports(content);
        
        // Process each import
        for (const importPath of imports) {
          if (importPath.startsWith('.')) {
            const importDir = path.dirname(filePath);
            const resolvedPath = resolveImportPathSync(importPath, importDir);
            
            if (resolvedPath) {
              const normalizedImport = normalizePath(resolvedPath);
              recordFileDependency(currentFile, normalizedImport);
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing file ${filePath}:`, error);
      }
    };

    const walk = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const d of entries) {
          const filePath = path.join(dir, d.name);
          if (d.isDirectory()) {
            if (d.name === 'node_modules' || d.name.startsWith('.')) continue;
            await walk(filePath);
          } else if (/\.(js|ts|jsx|tsx)$/.test(filePath)) {
            const normalizedPath = normalizePath(filePath);
            
            // Process the file if:
            // 1. No specific target files were specified, or
            // 2. This file is in the target list, or
            // 3. The normalized version is in the target list
            if (!targetFiles.length || 
                targetFiles.includes(filePath) || 
                targetFiles.includes(normalizedPath)) {
              await processFile(filePath, normalizedPath);
            }
          }
        }
      } catch (error) {
        console.error(`Error walking directory ${dir}:`, error);
      }
    };

    await walk(rootDir);
    
    return {
      fileGraph: this.convertToGraph(fileEdges),
      fileNameMap
    };
  }

  static convertToGraph(edges) {
    const graph = {};
    for (const [k, v] of Object.entries(edges)) {
      graph[k] = Array.from(v);
    }
    return graph;
  }

  static updateRelatedFiles(analyses, callGraph) {
    if (!callGraph || (!callGraph.fileGraph && !Object.keys(callGraph).length)) {
      console.warn('No call graph available, cannot update related files');
      return analyses;
    }
    
    // Handle the new graph structure
    const fileGraph = callGraph.fileGraph || callGraph;
    const fileNameMap = callGraph.fileNameMap || {};
    
    // Find all impacted files using breadth-first search
    const findImpactedFiles = (sourceFile) => {
      const visited = new Set();
      const queue = [sourceFile];
      
      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        
        // Add dependent files to the queue
        const dependents = fileGraph[current] || [];
        for (const dependent of dependents) {
          if (!visited.has(dependent)) {
            queue.push(dependent);
          }
        }
      }
      
      return Array.from(visited);
    };
    
    return analyses.map(analysis => {
      // Try different variations of the filename to find matches
      const originalPath = analysis.filename;
      const normalizedPath = originalPath.replace(/^\//, ''); // Remove leading slash if present
      
      // Find files directly impacted by this file
      const impactedFiles = findImpactedFiles(originalPath) || 
                           findImpactedFiles(normalizedPath) || 
                           [];
      
      // Map file paths to their actual names and filter out missing files
      const relatedFiles = impactedFiles
        .filter(file => file !== originalPath && file !== normalizedPath)
        .map(file => fileNameMap[file] || file)
        .filter(Boolean);
      
      return {
        ...analysis,
        relatedFiles,
        impactAnalysis: {
          directDependencies: fileGraph[originalPath] || fileGraph[normalizedPath] || [],
          totalImpactedFiles: relatedFiles.length
        }
      };
    });
  }
}