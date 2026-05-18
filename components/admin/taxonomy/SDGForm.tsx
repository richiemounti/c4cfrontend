// components/admin/taxonomy/SDGForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SDG } from '@/types/taxonomy';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sdgCodes = [
  'SDG1', 'SDG2', 'SDG3', 'SDG4', 'SDG5', 
  'SDG6', 'SDG7', 'SDG8', 'SDG9', 'SDG10', 
  'SDG11', 'SDG12', 'SDG13', 'SDG14', 'SDG15', 
  'SDG16', 'SDG17'
];

const sdgSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

interface SDGFormProps {
  initialData: Partial<SDG>;
  onSubmit: (data: Partial<SDG>) => void;
}

const SDGForm = ({ initialData, onSubmit }: SDGFormProps) => {
  const form = useForm<z.infer<typeof sdgSchema>>({
    resolver: zodResolver(sdgSchema),
    defaultValues: {
      code: initialData.code || '',
      name: initialData.name || '',
      description: initialData.description || '',
      iconUrl: initialData.iconUrl || '',
      color: initialData.color || '',
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
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SDG code" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sdgCodes.map(code => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter SDG name" {...field} />
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
            name="iconUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter icon URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input placeholder="Enter color code (e.g., #FF5733)" {...field} />
                  </FormControl>
                  {field.value && (
                    <div 
                      className="h-10 w-10 rounded-md border"
                      style={{ backgroundColor: field.value }}
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};

export default SDGForm;