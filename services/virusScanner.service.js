import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class VirusScannerService {
  constructor() {
    this.clamAvAvailable = null;
    this.checkClamAvAvailability();
  }

  // Check if ClamAV is installed and available
  checkClamAvAvailability() {
    try {
      execSync('clamscan --version', { stdio: 'ignore' });
      this.clamAvAvailable = true;
      console.log('✅ ClamAV detected - virus scanning enabled');
    } catch (error) {
      this.clamAvAvailable = false;
      console.log('⚠️  ClamAV not available - using fallback validation');
    }
  }

  // Main virus scanning method with fallback
  async scanFile(fileBuffer, originalFilename, mimeType) {
    if (this.clamAvAvailable) {
      return await this.scanWithClamAV(fileBuffer, originalFilename);
    } else {
      return await this.fallbackValidation(fileBuffer, originalFilename, mimeType);
    }
  }

  // ClamAV scanning (when available)
  async scanWithClamAV(fileBuffer, originalFilename) {
    try {
      // Create temporary file for scanning
      const tempDir = '/tmp';
      const tempFilePath = path.join(tempDir, `scan_${Date.now()}_${originalFilename}`);
      
      // Write buffer to temporary file
      fs.writeFileSync(tempFilePath, fileBuffer);
      
      try {
        // Run ClamAV scan
        const result = execSync(`clamscan --no-summary "${tempFilePath}"`, { 
          encoding: 'utf8',
          timeout: 30000 // 30 second timeout
        });
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        if (result.includes('FOUND')) {
          const virusName = this.extractVirusName(result);
          return {
            status: 'infected',
            engine: 'clamav',
            details: {
              virus_name: virusName,
              scan_result: result.trim(),
              scanned_at: new Date().toISOString()
            }
          };
        } else {
          return {
            status: 'clean',
            engine: 'clamav',
            details: {
              scan_result: result.trim(),
              scanned_at: new Date().toISOString()
            }
          };
        }
      } catch (scanError) {
        // Clean up temp file on error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        throw scanError;
      }
    } catch (error) {
      console.error('ClamAV scan error:', error);
      return {
        status: 'error',
        engine: 'clamav',
        details: {
          error: error.message,
          scanned_at: new Date().toISOString()
        }
      };
    }
  }

  // Fallback validation (when ClamAV unavailable)
  async fallbackValidation(fileBuffer, originalFilename, mimeType) {
    try {
      const validationResults = [];

      // 1. File type validation
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword' // .doc
      ];

      if (!allowedTypes.includes(mimeType)) {
        return {
          status: 'rejected',
          engine: 'fallback',
          details: {
            reason: 'Invalid file type',
            mime_type: mimeType,
            allowed_types: allowedTypes,
            scanned_at: new Date().toISOString()
          }
        };
      }
      validationResults.push('✅ File type valid');

      // 2. File size validation (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (fileBuffer.length > maxSize) {
        return {
          status: 'rejected',
          engine: 'fallback',
          details: {
            reason: 'File too large',
            file_size: fileBuffer.length,
            max_size: maxSize,
            scanned_at: new Date().toISOString()
          }
        };
      }
      validationResults.push('✅ File size valid');

      // 3. File signature validation (magic numbers)
      const suspiciousSignatures = this.checkFileSignatures(fileBuffer);
      if (suspiciousSignatures.length > 0) {
        return {
          status: 'suspicious',
          engine: 'fallback',
          details: {
            reason: 'Suspicious file signatures detected',
            signatures: suspiciousSignatures,
            scanned_at: new Date().toISOString()
          }
        };
      }
      validationResults.push('✅ File signatures valid');

      // 4. Filename validation
      const filenameIssues = this.validateFilename(originalFilename);
      if (filenameIssues.length > 0) {
        return {
          status: 'suspicious',
          engine: 'fallback',
          details: {
            reason: 'Suspicious filename patterns',
            issues: filenameIssues,
            scanned_at: new Date().toISOString()
          }
        };
      }
      validationResults.push('✅ Filename valid');

      // All validations passed
      return {
        status: 'clean',
        engine: 'fallback',
        details: {
          validation_results: validationResults,
          note: 'File passed basic security validation (ClamAV not available)',
          scanned_at: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Fallback validation error:', error);
      return {
        status: 'error',
        engine: 'fallback',
        details: {
          error: error.message,
          scanned_at: new Date().toISOString()
        }
      };
    }
  }

  // Check file signatures for suspicious patterns
  checkFileSignatures(fileBuffer) {
    const suspiciousSignatures = [];
    
    // Windows executable signatures
    if (fileBuffer.length >= 2) {
      const header = fileBuffer.slice(0, 2);
      if (header.equals(Buffer.from([0x4D, 0x5A]))) { // MZ header
        suspiciousSignatures.push('Windows executable (MZ header)');
      }
    }

    // ZIP-based files (could contain malware)
    if (fileBuffer.length >= 4) {
      const zipHeader = fileBuffer.slice(0, 4);
      if (zipHeader.equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) {
        // This is a ZIP file - check if it's a legitimate document format
        const filename = arguments[1] || '';
        if (!filename.match(/\.(docx|xlsx|pptx)$/i)) {
          suspiciousSignatures.push('ZIP file (not recognized document format)');
        }
      }
    }

    // Script file signatures
    const scriptPatterns = [
      { pattern: '#!/bin/sh', name: 'Shell script' },
      { pattern: '#!/bin/bash', name: 'Bash script' },
      { pattern: '<?php', name: 'PHP script' },
      { pattern: '<script', name: 'JavaScript/HTML script' }
    ];

    const fileStart = fileBuffer.slice(0, 100).toString('utf8');
    for (const { pattern, name } of scriptPatterns) {
      if (fileStart.includes(pattern)) {
        suspiciousSignatures.push(name);
      }
    }

    return suspiciousSignatures;
  }

  // Validate filename for suspicious patterns
  validateFilename(filename) {
    const issues = [];

    // Double extensions
    if (filename.match(/\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/)) {
      issues.push('Double file extension detected');
    }

    // Suspicious extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar',
      '.sh', '.php', '.asp', '.jsp', '.py', '.pl', '.rb'
    ];
    
    const lowerFilename = filename.toLowerCase();
    for (const ext of dangerousExtensions) {
      if (lowerFilename.includes(ext)) {
        issues.push(`Dangerous extension detected: ${ext}`);
      }
    }

    // Very long filename (potential buffer overflow attempt)
    if (filename.length > 255) {
      issues.push('Filename too long (potential security risk)');
    }

    // Special characters that could indicate path traversal
    if (filename.includes('../') || filename.includes('..\\')) {
      issues.push('Path traversal attempt detected');
    }

    return issues;
  }

  // Extract virus name from ClamAV output
  extractVirusName(clamavOutput) {
    const match = clamavOutput.match(/: (.+) FOUND/);
    return match ? match[1] : 'Unknown virus';
  }

  // Get scanner status for health checks
  getStatus() {
    return {
      clamav_available: this.clamAvAvailable,
      scanner_type: this.clamAvAvailable ? 'clamav' : 'fallback',
      last_checked: new Date().toISOString()
    };
  }

  // Force re-check of ClamAV availability
  recheckAvailability() {
    this.checkClamAvAvailability();
    return this.getStatus();
  }
}

export default new VirusScannerService();
