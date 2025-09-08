import { AlertCircle, CheckCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useEditor } from '../../hooks/useEditor';
import type { ValidationResult } from '../../types/api';

interface ValidationPanelProps {
  cacheKey: string | null;
}

export const ValidationPanel = ({ cacheKey }: ValidationPanelProps) => {
  const editorActions = useEditor(cacheKey);
  
  if (!editorActions.currentEntry) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <div className="text-4xl mb-2">🔍</div>
        <p>No entry to validate</p>
      </div>
    );
  }
  
  const validation = editorActions.validationErrors;
  const hasErrors = validation?.errors.length > 0;
  const hasWarnings = validation?.warnings.length > 0;
  const isValid = validation?.is_valid_json && validation?.has_required_fields;
  
  // Calculate validation score
  const getValidationScore = (): number => {
    if (!validation) return 0;
    
    let score = 100;
    score -= validation.errors.length * 20; // Heavy penalty for errors
    score -= validation.warnings.length * 5; // Light penalty for warnings
    
    if (!validation.is_valid_json) score -= 30;
    if (!validation.has_required_fields) score -= 20;
    
    return Math.max(0, score);
  };
  
  const validationScore = getValidationScore();
  
  // Get overall status
  const getValidationStatus = (): {
    status: 'excellent' | 'good' | 'warning' | 'error';
    icon: React.ReactNode;
    color: string;
    message: string;
  } => {
    if (hasErrors) {
      return {
        status: 'error',
        icon: <AlertCircle className="w-5 h-5" />,
        color: 'text-red-600',
        message: 'Validation failed',
      };
    }
    
    if (hasWarnings) {
      return {
        status: 'warning',
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'text-yellow-600',
        message: 'Validation passed with warnings',
      };
    }
    
    if (validationScore >= 95) {
      return {
        status: 'excellent',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'text-green-600',
        message: 'Excellent validation',
      };
    }
    
    return {
      status: 'good',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      message: 'Validation passed',
    };
  };
  
  const status = getValidationStatus();
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Validation</h3>
          <Badge 
            variant={
              hasErrors ? 'destructive' :
              hasWarnings ? 'warning' : 'success'
            }
            className="text-xs"
          >
            Score: {validationScore}%
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {/* Trigger manual validation */}}
          className="h-8 px-2"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
      
      {/* Overall Status */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className={status.color}>
            {status.icon}
          </div>
          <div>
            <div className={`font-medium ${status.color}`}>
              {status.message}
            </div>
            <div className="text-sm text-muted-foreground">
              {editorActions.isDirty ? 'Modified entry' : 'Original entry'}
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 rounded bg-muted/50">
            <div className={validation?.is_valid_json ? 'text-green-600' : 'text-red-600'}>
              {validation?.is_valid_json ? '✓' : '✗'}
            </div>
            <div className="text-muted-foreground">JSON</div>
          </div>
          
          <div className="text-center p-2 rounded bg-muted/50">
            <div className={validation?.has_required_fields ? 'text-green-600' : 'text-red-600'}>
              {validation?.has_required_fields ? '✓' : '✗'}
            </div>
            <div className="text-muted-foreground">Fields</div>
          </div>
          
          <div className="text-center p-2 rounded bg-muted/50">
            <div className={validationScore >= 80 ? 'text-green-600' : 'text-yellow-600'}>
              {validationScore}%
            </div>
            <div className="text-muted-foreground">Score</div>
          </div>
        </div>
      </div>
      
      {/* Validation Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3 space-y-4">
          {/* Errors */}
          {hasErrors && (
            <ValidationSection
              title="Errors"
              items={validation.errors}
              icon={<AlertCircle className="w-4 h-4 text-red-600" />}
              bgColor="bg-red-50 dark:bg-red-950"
              textColor="text-red-600"
            />
          )}
          
          {/* Warnings */}
          {hasWarnings && (
            <ValidationSection
              title="Warnings"
              items={validation.warnings}
              icon={<AlertTriangle className="w-4 h-4 text-yellow-600" />}
              bgColor="bg-yellow-50 dark:bg-yellow-950"
              textColor="text-yellow-600"
            />
          )}
          
          {/* Success State */}
          {!hasErrors && !hasWarnings && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-green-600 mb-2">All Good!</h3>
              <p className="text-sm text-muted-foreground">
                No validation issues detected
              </p>
            </div>
          )}
          
          {/* Validation Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Validation Details</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span>JSON Syntax</span>
                <div className="flex items-center gap-2">
                  {validation?.is_valid_json ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={validation?.is_valid_json ? 'text-green-600' : 'text-red-600'}>
                    {validation?.is_valid_json ? 'Valid' : 'Invalid'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span>Required Fields</span>
                <div className="flex items-center gap-2">
                  {validation?.has_required_fields ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={validation?.has_required_fields ? 'text-green-600' : 'text-red-600'}>
                    {validation?.has_required_fields ? 'Present' : 'Missing'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span>Response Size</span>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">
                    {JSON.stringify(editorActions.currentEntry.body).length} bytes
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span>Status Code</span>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">
                    {editorActions.currentEntry.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Suggestions */}
          {(hasErrors || hasWarnings) && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Suggestions</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                {hasErrors && (
                  <div className="flex items-start gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-blue-600">Fix Errors First</div>
                      <div>Resolve validation errors before saving changes to prevent issues.</div>
                    </div>
                  </div>
                )}
                
                {hasWarnings && !hasErrors && (
                  <div className="flex items-start gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-blue-600">Consider Warnings</div>
                      <div>Review warnings to ensure optimal response quality.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ValidationSectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const ValidationSection = ({ title, items, icon, bgColor, textColor }: ValidationSectionProps) => {
  return (
    <div className={`p-3 rounded-lg ${bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className={`font-medium ${textColor}`}>{title}</span>
        <Badge variant="secondary" className="text-xs">
          {items.length}
        </Badge>
      </div>
      
      <ul className={`space-y-2 text-sm ${textColor}`}>
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-xs mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};