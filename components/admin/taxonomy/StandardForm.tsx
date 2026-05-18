// components/admin/taxonomy/StandardForm.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Standard } from '@/types/taxonomy';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the form schema
const formSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  issuingBody: z.string().min(1, 'Issuing body is required'),
  website: z.string().optional(),
  version: z.string().optional(),
  publishedYear: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

// Define the exact shape of form values expected
type FormValues = z.infer<typeof formSchema>;

interface StandardFormProps {
  initialData: Partial<Standard>;
  onSubmit: (data: Partial<Standard>) => void;
}

const StandardForm = ({ initialData, onSubmit }: StandardFormProps) => {
  // Create the form with explicit types
  const form = useForm<FormValues>({
    // Use the exact resolver matching your FormValues type
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: initialData.code || '',
      name: initialData.name || '',
      description: initialData.description || '',
      issuingBody: initialData.issuingBody || '',
      website: initialData.website || '',
      version: initialData.version || '',
      publishedYear: initialData.publishedYear ? initialData.publishedYear.toString() : '',
      status: initialData.status || 'active',
    },
  });

  // Define a properly typed submit handler
  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    // Convert form data to match Standard interface
    const submissionData: Partial<Standard> = {
      ...data,
      // Convert publishedYear from string to number if it exists
      publishedYear: data.publishedYear && data.publishedYear.trim() !== '' 
        ? parseInt(data.publishedYear, 10) 
        : undefined
    };
    onSubmit(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter code (e.g., ISO14001)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="issuingBody"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issuing Body*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter issuing organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter standard name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter description" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="Enter website URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Version</FormLabel>
                <FormControl>
                  <Input placeholder="Enter version" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="publishedYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Published Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter year (e.g., 2023)" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
          >
            {initialData._id ? 'Update Standard' : 'Create Standard'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StandardForm;