// components/admin/taxonomy/IndicatorForm.tsx
import React, { useState, KeyboardEvent } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Indicator } from '@/types/taxonomy';
import { X } from 'lucide-react';
import { validateURL, validateURLArray, validateEvidence } from '@/lib/utils/validation';


/* ------------------------------------------------------------------ */
/* Helpers (NEW) */
/* ------------------------------------------------------------------ */

const normalizeUrl = (url: string) =>
  url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/* ------------------------------------------------------------------ */
/* Schema */
/* ------------------------------------------------------------------ */

const indicatorSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(2000, "Name must be less than 2000 characters")
    .trim(),
  
  description: z.string()
    .max(2500, "Description must be less than 2500 characters")
    .optional(),
  
  status: z.enum(["active", "inactive"]),
  
  evidence: z.object({
    source: z.string()
      .max(1000, "Source must be less than 1000 characters")
      .optional()
      .or(z.literal('')),
    
    url: z.array(
      z.string()
        .max(2500, "URL must be less than 2500 characters")
        .refine(
          (url) => {
            if (!url || !url.trim()) return false;
            const result = validateURL(url);
            return result.isValid;
          },
          { message: "Please enter a valid URL (e.g., https://example.com)" }
        )
    ).optional()
    .refine(
      (urls) => {
        if (!urls || urls.length === 0) return true;
        const result = validateURLArray(urls);
        return result.isValid;
      },
      { message: "One or more URLs are invalid or duplicated" }
    ),
    
    details: z.string()
      .max(1500, "Details must be less than 1500 characters")
      .optional()
      .or(z.literal('')),
  }).optional()
  .refine(
    (evidence) => {
      if (!evidence) return true;
      const result = validateEvidence(evidence);
      return result.isValid;
    },
    { message: "Evidence validation failed" }
  ),
});

type IndicatorFormValues = z.infer<typeof indicatorSchema>;

interface IndicatorFormProps {
  initialData?: Partial<Indicator>;
  onSubmit: (data: IndicatorFormValues) => void;
  onChange?: (field: string, value: any) => void;
  isLoading?: boolean;
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({
  initialData,
  onSubmit,
  onChange,
  isLoading = false
}) => {
  // State for URL input
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  const form = useForm<IndicatorFormValues>({
    resolver: zodResolver(indicatorSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'active',
      evidence: initialData?.evidence || {
        source: '',
        url: [],
        details: '',
      },
    },
  });

  /* ------------------------------------------------------------------ */
  /* Sync initial data */
  /* ------------------------------------------------------------------ */

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'active',
        evidence: initialData.evidence || {
          source: '',
          url: [],
          details: '',
        },
      });
    }
  }, [initialData, form]);

  /* ------------------------------------------------------------------ */
  /* URL logic (FIXED) */
  /* ------------------------------------------------------------------ */

    const handleAddUrl = () => {
    const rawUrl = urlInput.trim();
    
    if (!rawUrl) {
      setUrlError('Please enter a URL');
      return;
    }

    // Use the comprehensive validation utility
    const validationResult = validateURL(rawUrl);

    if (!validationResult.isValid) {
      setUrlError(validationResult.error || 'Invalid URL');
      return;
    }

    const sanitizedUrl = validationResult.sanitized!;
    const currentUrls = form.getValues('evidence.url') || [];

    // Check for duplicates
    if (currentUrls.includes(sanitizedUrl)) {
      setUrlError('This URL has already been added');
      return;
    }

    // Check maximum number of URLs (optional limit)
    if (currentUrls.length >= 10) {
      setUrlError('Maximum 10 URLs allowed');
      return;
    }

    // Add the sanitized URL
    form.setValue(
      'evidence.url',
      [...currentUrls, sanitizedUrl],
      { shouldDirty: true, shouldValidate: true }
    );

    setUrlInput('');
    setUrlError('');
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    const currentUrls = form.getValues('evidence.url') || [];
    form.setValue(
      'evidence.url',
      currentUrls.filter(url => url !== urlToRemove),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const handleUrlKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddUrl();
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    // Clear error as user types
    if (urlError) {
      setUrlError('');
    }
  };

  const handleFormSubmit = (data: IndicatorFormValues) => {
    try {
      // Additional validation before submit
      if (data.evidence) {
        const evidenceValidation = validateEvidence(data.evidence);
        
        if (!evidenceValidation.isValid) {
          // Show validation errors
          evidenceValidation.errors.forEach(error => {
            form.setError('evidence.url', {
              type: 'manual',
              message: error
            });
          });
          return;
        }

        // Clean up evidence object - if all fields are empty, send null
        const hasAnyEvidenceData = 
          data.evidence.source?.trim() || 
          (data.evidence.url && data.evidence.url.length > 0) || 
          data.evidence.details?.trim();
        
        if (!hasAnyEvidenceData) {
          data.evidence = undefined;
        } else {
          // Sanitize and validate URLs one more time
          if (data.evidence.url && data.evidence.url.length > 0) {
            const urlValidation = validateURLArray(data.evidence.url);
            if (urlValidation.isValid) {
              data.evidence.url = urlValidation.sanitized;
            } else {
              // Show errors
              form.setError('evidence.url', {
                type: 'manual',
                message: urlValidation.errors.join(', ')
              });
              return;
            }
          }
        }
      }
      
      onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      form.setError('root', {
        type: 'manual',
        message: 'An error occurred while validating the form. Please check all fields.'
      });
    }
  };

  // Watch form values to trigger onChange
  const watchedValues = form.watch();
  
  React.useEffect(() => {
    if (onChange) {
      // Notify parent of form changes
      Object.keys(watchedValues).forEach(key => {
        const typedKey = key as keyof IndicatorFormValues;
        if (watchedValues[typedKey] !== initialData?.[typedKey]) {
          onChange(key, watchedValues[typedKey]);
        }
      });
    }
  }, [watchedValues, onChange, initialData]);


  // Get character count helper
  const getCharCount = (value: string | undefined, max: number) => {
    const count = value?.length || 0;
    const percentage = (count / max) * 100;
    const colorClass = percentage > 90 ? 'text-red-500' : percentage > 75 ? 'text-yellow-600' : 'text-gray-500';
    return <span className={`text-xs ${colorClass}`}>{count}/{max}</span>;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter indicator name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the indicator.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter indicator description (optional)" 
                      {...field} 
                      value={field.value || ''}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the indicator.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The current status of the indicator.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Evidence Card */}
        <Card>
          <CardHeader>
            <CardTitle>Evidence (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Evidence Source */}
            <FormField
              control={form.control}
              name="evidence.source"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Source</FormLabel>
                    {getCharCount(field.value, 1000)}
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Research paper, Report, Dataset" 
                      {...field} 
                      value={field.value || ''}
                      rows={3}
                      maxLength={1000}
                    />
                  </FormControl>
                  <FormDescription>
                    The source of the evidence for this indicator.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Evidence URLs */}
                    <FormField
          control={form.control}
          name="evidence.url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URLs</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {/* URL Input with real-time validation feedback */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input 
                        type="text"
                        placeholder="https://example.com/evidence" 
                        value={urlInput}
                        onChange={handleUrlInputChange}
                        onKeyDown={handleUrlKeyDown}
                        maxLength={2500}
                        className={urlError ? 'border-red-500' : ''}
                      />
                      {urlError && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <span className="font-medium">⚠</span>
                          {urlError}
                        </p>
                      )}
                      {urlInput && !urlError && (
                        <p className="text-sm text-gray-500 mt-1">
                          {urlInput.length}/2500 characters
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddUrl}
                      variant="outline"
                      size="default"
                      disabled={!urlInput.trim()}
                    >
                      Add URL
                    </Button>
                  </div>

                  {/* URL Tags Display */}
                  {field.value && field.value.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        {field.value.length} URL{field.value.length !== 1 ? 's' : ''} added
                      </div>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                        {field.value.map((url, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-2 py-1.5 px-3 text-sm"
                          >
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline max-w-[300px] truncate"
                              onClick={(e) => e.stopPropagation()}
                              title={url}
                            >
                              {url}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveUrl(url)}
                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                              aria-label="Remove URL"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Add links to evidence sources. URLs will be automatically formatted (e.g., "example.com" → "https://example.com"). Maximum 2500 characters per URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

            {/* Evidence Details */}
            <FormField
              control={form.control}
              name="evidence.details"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Details</FormLabel>
                    {getCharCount(field.value, 1500)}
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about the evidence" 
                      {...field} 
                      value={field.value || ''}
                      rows={6}
                      maxLength={1500}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional information or context about the evidence.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Saving...' : 'Save Indicator'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IndicatorForm;