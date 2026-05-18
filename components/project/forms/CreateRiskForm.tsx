'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import API functions
import {
  createRiskItem,
  getRiskTypeOptions,
  getProbabilityOptions,
  getConsequencesOptions,
  getImpactAreaOptions,
} from '@/lib/api/riskManagement';

import {CreateRiskData} from '@/types'

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Risk name is required").max(200, "Risk name too long"),
  riskType: z.string().min(1, "Risk type is required"),
  riskDescription: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  probability: z.string().min(1, "Probability is required"),
  consequences: z.string().min(1, "Consequences is required"),
  owner: z.string().min(1, "Risk owner is required"),
  mitigationStrategy: z.string().min(10, "Mitigation strategy must be at least 10 characters").max(1000, "Mitigation strategy too long"),
  category: z.string().optional(),
  impactArea: z.array(z.string()).optional(),
  reviewDate: z.date(),
  notes: z.string().max(500, "Notes too long").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateRiskFormProps {
  projectId: string;
  organizationId: string;
  userRole: 'manager' | 'projectCreator' | 'organiser' | 'reviewer';
  onSuccess: () => void;
  onCancel: () => void;
}

// Mock users data - replace with actual API call
const mockUsers = [
  { _id: '1', name: 'John Doe', email: 'john@example.com' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { _id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
];

const CreateRiskForm = ({ projectId, organizationId, userRole, onSuccess, onCancel }: CreateRiskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      riskType: '',
      riskDescription: '',
      probability: '',
      consequences: '',
      owner: '',
      mitigationStrategy: '',
      category: 'current',
      impactArea: [],
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const createData: CreateRiskData = {
        projectId,
        organizationId,
        name: data.name,
        riskType: data.riskType,
        riskDescription: data.riskDescription,
        probability: data.probability,
        consequences: data.consequences,
        owner: data.owner,
        mitigationStrategy: data.mitigationStrategy,
        category: data.category || 'current',
        impactArea: data.impactArea || [],
        reviewDate: data.reviewDate.toISOString()
      };

      await createRiskItem(createData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create risk:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get risk type options based on user role
  const getRiskTypesForUser = () => {
    const allOptions = getRiskTypeOptions();
    const userOptions = allOptions[userRole] || [];
    
    return userOptions.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  };

  const probabilityOptions = getProbabilityOptions();
  const consequencesOptions = getConsequencesOptions();
  const impactAreaOptions = getImpactAreaOptions();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stratosphere font-medium">Risk Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter risk name"
                    className="border-sky-200 focus:border-sky-500"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Risk Type */}
          <FormField
            control={form.control}
            name="riskType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stratosphere font-medium">Risk Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-sky-200 focus:border-sky-500">
                      <SelectValue placeholder="Select risk type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getRiskTypesForUser().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Risk Description */}
        <FormField
          control={form.control}
          name="riskDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-stratosphere font-medium">Risk Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the risk in detail..."
                  className="border-sky-200 focus:border-sky-500 min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sky-600">
                Provide a clear and detailed description of the risk
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Probability */}
          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stratosphere font-medium">Probability *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-sky-200 focus:border-sky-500">
                      <SelectValue placeholder="Select probability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {probabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Consequences */}
          <FormField
            control={form.control}
            name="consequences"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stratosphere font-medium">Consequences *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-sky-200 focus:border-sky-500">
                      <SelectValue placeholder="Select consequences" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {consequencesOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Owner */}
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stratosphere font-medium">Risk Owner *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-sky-200 focus:border-sky-500">
                      <SelectValue placeholder="Select risk owner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Review Date */}
          <FormField
            control={form.control}
            name="reviewDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-stratosphere font-medium">Review Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "border-sky-200 focus:border-sky-500 pl-3 text-left font-normal",
                          !field.value && "text-sky-500"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-sky-200" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: any) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-sky-600">
                  Optional: Set a date for risk review
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Impact Areas */}
        <FormField
          control={form.control}
          name="impactArea"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-stratosphere font-medium">Impact Areas</FormLabel>
                <FormDescription className="text-sky-600">
                  Select the areas that this risk might impact
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {impactAreaOptions.map((item) => (
                  <FormField
                    key={item.value}
                    control={form.control}
                    name="impactArea"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.value)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.value])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.value
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-stratosphere font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mitigation Strategy */}
        <FormField
          control={form.control}
          name="mitigationStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-stratosphere font-medium">Mitigation Strategy *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the strategy to mitigate this risk..."
                  className="border-sky-200 focus:border-sky-500 min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sky-600">
                Outline the approach to manage and reduce this risk
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-stratosphere font-medium">Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information or notes about this risk..."
                  className="border-sky-200 focus:border-sky-500 min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sky-600">
                Optional: Add any additional context or information
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-sky-100">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-sky-200 text-sky-500 hover:bg-sky-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Risk'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateRiskForm;