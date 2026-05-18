// components/admin/taxonomy/TaxonomyForm.tsx
import React from 'react';
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category, Theme, SDG, ResilienceDimension, ESGCategory, Standard, Indicator } from '@/types/taxonomy';

// Define schemas for form validation
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

const themeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  theoryOfChangeStage: z.enum(["Stage 1 - Output", "Stage 2 - Outcome", "Both"]).optional().nullable(),
  status: z.enum(["draft", "published"]),
});

const subthemeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  theme: z.string().min(1, "Theme is required"),
  theoryOfChangeStage: z.enum(["Stage 1 - Output", "Stage 2 - Outcome", "Both"], {
    required_error: "Theory of Change stage is required"
  }),
  indicatorTags: z.array(z.string()).optional(),
  sdgTags: z.array(z.string()).optional(),
  resilienceTags: z.array(z.string()).optional(),
  esgTags: z.array(z.string()).optional(),
  standardTags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type ThemeFormValues = z.infer<typeof themeSchema>;
type SubthemeFormValues = z.infer<typeof subthemeSchema>;

interface AvailableTags {
  indicators: Indicator[];
  sdgs: SDG[];
  resilienceDimensions: ResilienceDimension[];
  esgCategories: ESGCategory[];
  standards: Standard[];
}

interface TaxonomyFormProps {
  type: 'category' | 'theme' | 'subtheme';
  initialData?: any;
  onSubmit: (data: any) => void;
  onChange?: (field: string, value: any) => void;
  onStageChange?: (stage: string) => void;
  onFormReady?: (submitFn: () => void) => void;
  themes?: Theme[];
  categories?: Category[];
  availableTags?: AvailableTags;
  isLoading?: boolean;
}

const TaxonomyForm: React.FC<TaxonomyFormProps> = ({
  type,
  initialData,
  onSubmit,
  onChange,
  onStageChange,
  onFormReady,
  themes = [],
  availableTags,
  isLoading = false
}) => {
  // Determine which schema to use based on the type
  const schema = type === 'category' 
    ? categorySchema
    : type === 'theme' 
      ? themeSchema 
      : subthemeSchema;

  // Get default values based on type
  const getDefaultValues = () => {
    const baseDefaults = {
      name: '',
      description: '',
      status: 'draft',
    };

    if (type === 'theme') {
      return {
        ...baseDefaults,
        theoryOfChangeStage: null,
      };
    }

    if (type === 'subtheme') {
      return {
        ...baseDefaults,
        theme: '',
        theoryOfChangeStage: 'Stage 1 - Output',
        indicatorTags: [],
        sdgTags: [],
        resilienceTags: [],
        esgTags: [],
        standardTags: []
      };
    }

    return baseDefaults;
  };

  // Set up form with React Hook Form
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || getDefaultValues(),
  });

  // Update form values when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // Watch form values to trigger onChange
  const watchedValues = form.watch();

  React.useEffect(() => {
    if (onChange) {
      Object.keys(watchedValues).forEach(key => {
        if (watchedValues[key] !== initialData?.[key]) {
          onChange(key, watchedValues[key]);
        }
      });
    }
  }, [watchedValues, onChange, initialData]);

  // Notify parent when theoryOfChangeStage changes (without feeding back into initialData)
  const watchedStage = form.watch('theoryOfChangeStage');
  const prevStageRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (onStageChange && watchedStage && watchedStage !== prevStageRef.current) {
      prevStageRef.current = watchedStage;
      onStageChange(watchedStage);
    }
  }, [watchedStage, onStageChange]);


  const handleFormSubmit = (data: CategoryFormValues | ThemeFormValues | SubthemeFormValues) => {
    onSubmit(data);
  };

  // Register form submit function with parent
  React.useEffect(() => {
    if (onFormReady) {
      onFormReady(() => {
        form.handleSubmit(handleFormSubmit)();
      });
    }
  }, [onFormReady, form, handleFormSubmit]);

  // Helper function to handle tag selection
  const handleTagSelect = (tagType: string, tagId: string) => {
    const currentTags = form.getValues(tagType as any) || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id: string) => id !== tagId)
      : [...currentTags, tagId];
    
    form.setValue(tagType as any, newTags);
  };

  // Helper function to remove a tag
  const handleTagRemove = (tagType: string, tagId: string) => {
    const currentTags = form.getValues(tagType as any) || [];
    const newTags = currentTags.filter((id: string) => id !== tagId);
    form.setValue(tagType as any, newTags);
  };

  // Multi-select tag component
  const TagSelector: React.FC<{
    label: string;
    description: string;
    fieldName: string;
    options: Array<{ _id: string; code?: string; name: string }>;
  }> = ({ label, description, fieldName, options }) => {
    const selectedTags = form.watch(fieldName as any) || [];
    
    return (
      <FormField
        control={form.control}
        name={fieldName as any}
        render={() => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            
            {/* Selected tags display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedTags.map((tagId: string) => {
                  const tag = options.find(opt => opt._id === tagId);
                  return tag ? (
                    <Badge key={tagId} variant="secondary" className="text-xs">
                      {tag.code || tag.name}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleTagRemove(fieldName, tagId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            
            {/* Tag selection dropdown */}
            <Select
              value=""
              onValueChange={(value) => value && handleTagSelect(fieldName, value)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem 
                    key={option._id} 
                    value={option._id}
                    className={selectedTags.includes(option._id) ? "bg-muted" : ""}
                  >
                    <div className="flex items-center">
                      {selectedTags.includes(option._id) && (
                        <span className="mr-2">✓</span>
                      )}
                      {option.code ? `${option.code}: ${option.name}` : option.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <FormDescription>{description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form id="taxonomy-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder={`Enter ${type} name`} {...field} />
              </FormControl>
              <FormDescription>
                The name of the {type}.
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
                  placeholder={`Enter ${type} description (optional)`} 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                A brief description of the {type}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Theory of Change Stage (for themes and subthemes) */}
        {(type === 'theme' || type === 'subtheme') && (
          <FormField
            control={form.control}
            name="theoryOfChangeStage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Theory of Change Stage
                  {type === 'theme' && <span className="text-muted-foreground text-xs ml-2">(optional)</span>}
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                  value={field.value ?? 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {type === 'theme' && (
                      <SelectItem value="none">
                        <span className="text-muted-foreground">None</span>
                      </SelectItem>
                    )}
                    <SelectItem value="Stage 1 - Output">Stage 1 - Output</SelectItem>
                    <SelectItem value="Stage 2 - Outcome">Stage 2 - Outcome</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The theory of change stage this {type} belongs to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Theme Selection (for subthemes only) */}
        {type === 'subtheme' && (
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme._id} value={theme._id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The theme this subtheme belongs to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Tag Selectors (for subthemes only) */}
        {type === 'subtheme' && availableTags && (
          <>
            {/* Indicator Tags */}
            {availableTags.indicators.length > 0 && (
              <TagSelector
                label="Indicator Tags"
                description="Select relevant Indicators."
                fieldName="indicatorTags"
                options={availableTags.indicators}
              />
            )}
            
            {/* SDG Tags */}
            {availableTags.sdgs.length > 0 && (
              <TagSelector
                label="SDG Tags"
                description="Select relevant Sustainable Development Goals."
                fieldName="sdgTags"
                options={availableTags.sdgs}
              />
            )}

            {/* Resilience Tags */}
            {availableTags.resilienceDimensions.length > 0 && (
              <TagSelector
                label="Resilience Tags"
                description="Select relevant resilience dimensions."
                fieldName="resilienceTags"
                options={availableTags.resilienceDimensions}
              />
            )}

            {/* ESG Tags */}
            {availableTags.esgCategories.length > 0 && (
              <TagSelector
                label="ESG Tags"
                description="Select relevant Environmental, Social, and Governance categories."
                fieldName="esgTags"
                options={availableTags.esgCategories}
              />
            )}

            {/* Standard Tags */}
            {availableTags.standards.length > 0 && (
              <TagSelector
                label="Standards"
                description="Select relevant industry standards."
                fieldName="standardTags"
                options={availableTags.standards}
              />
            )}
          </>
        )}

        {/* Status Field - Only for categories, themes, and subthemes */}
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The current status of the {type}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Saving...' : `Save ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaxonomyForm;