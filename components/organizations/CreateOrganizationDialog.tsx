'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateOrganizationData, createOrganization } from '@/lib/api/organization';
import { PlusCircle } from 'lucide-react';

interface CreateOrganizationDialogProps {
  onOrganizationCreated: () => void;
}

const CreateOrganizationDialog = ({ onOrganizationCreated }: CreateOrganizationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizationData>({
    defaultValues: {
      name: '',
      country: '',
      city: '',
    },
  });

  const onSubmit = async (data: CreateOrganizationData) => {
    setIsSubmitting(true);
    try {
      await createOrganization(data);
      toast({
        title: 'Success',
        description: 'Organization created successfully.',
        variant: 'default',
      });
      reset();
      setOpen(false);
      onOrganizationCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create organization',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-ochre hover:bg-ochre-900 text-white">
          <PlusCircle className="h-4 w-4 mr-2" /> Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-sky">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Enter the details for your new organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="required">
                Organization Name
              </Label>
              <Input
                id="name"
                {...register('name', {
                  required: 'Organization name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Name cannot exceed 100 characters',
                  },
                })}
                placeholder="Enter organization name"
                className={errors.name ? 'border-red-500' : 'border-sky'}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country" className="required">
                Country
              </Label>
              <Input
                id="country"
                {...register('country', {
                  required: 'Country is required',
                })}
                placeholder="Enter country"
                className={errors.country ? 'border-red-500' : 'border-sky'}
              />
              {errors.country && (
                <p className="text-xs text-red-500">{errors.country.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city" className="required">
                City
              </Label>
              <Input
                id="city"
                {...register('city', {
                  required: 'City is required',
                })}
                placeholder="Enter city"
                className={errors.city ? 'border-red-500' : 'border-sky'}
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-sky text-stratosphere hover:bg-sky-tint"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganizationDialog;