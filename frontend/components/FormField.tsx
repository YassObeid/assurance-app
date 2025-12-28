// Form Field component for React Hook Form
import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}
