// scripts/types/exchange.ts
export interface UpdateOptions {
    forceUpdate?: boolean;
    delayMs?: number;
    startYear?: number;
    endYear?: number;
    validateData?: boolean;
  }
  
  export interface UpdateResult {
    success: boolean;
    processedFiles: string[];
    errors: Error[];
    updatedRates: number;
    skippedRates: number;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    info: {
      totalRates: number;
      dateRange: {
        start: string;
        end: string;
      };
    };
  }
  
  export interface ProcessingOptions {
    validate?: boolean;
    backup?: boolean;
    force?: boolean;
  }
  
  export interface ProcessingResult {
    success: boolean;
    processedQuarters: number;
    totalRates: number;
    errors: Error[];
    backupPath?: string;
  }