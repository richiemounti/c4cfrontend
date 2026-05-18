// components/admin/taxonomy/ResilienceDimensionForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ResilienceDimension } from '@/types/taxonomy';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const capacityTypes = [
  { id: 'absorptive_capacity', label: 'Absorptive Capacity' },
  { id: 'adaptive_capacity', label: 'Adaptive Capacity' },
  { id: 'transformative_capacity', label: 'Transformative Capacity' },
];

const resilienceDimensionSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  capacityTypes: z.enum(['absorptive_capacity', 'adaptive_capacity', 'transformative_capacity']),
  category: z.string().min(1, 'Category is required'),
  linkToPvModel: z.string().optional(),
  resilienceIndexCriteria: z.string().optional(),
  indicatorExamples: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

interface ResilienceDimensionFormProps {
  initialData: Partial<ResilienceDimension>;
  onSubmit: (data: Partial<ResilienceDimension>) => void;
}

const ResilienceDimensionForm = ({ initialData, onSubmit }: ResilienceDimensionFormProps) => {
  const form = useForm<z.infer<typeof resilienceDimensionSchema>>({
    resolver: zodResolver(resilienceDimensionSchema),
    defaultValues: {
      code: initialData.code || '',
      name: initialData.name || '',
      description: initialData.description || '',
      capacityTypes: initialData.capacityTypes || 'absorptive_capacity',
      category: initialData.category || '',
      linkToPvModel: initialData.linkToPvModel || '',
      resilienceIndexCriteria: initialData.resilienceIndexCriteria || '',
      indicatorExamples: initialData.indicatorExamples || '',
      status: initialData.status || 'active',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter code (e.g., RD01)" {...field} />
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
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dimension Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter custom category (e.g., ecological_resilience)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="capacityTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity Type*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select capacity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {capacityTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* New optional fields */}
        <FormField
          control={form.control}
          name="linkToPvModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to PV Model</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter link to Performance Verification model" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resilienceIndexCriteria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resilience Index Criteria</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter resilience index criteria" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="indicatorExamples"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indicator Examples</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter example indicators" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};

export default ResilienceDimensionForm;