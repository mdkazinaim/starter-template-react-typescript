# Form Implementation Skill

Instructions for building forms with validation using React Hook Form and Zod.

---

## Core Technologies

| Library | Purpose |
|---------|---------|
| React Hook Form | Form state management |
| Zod | Schema-based validation |
| @hookform/resolvers | Connect Zod to React Hook Form |

---

## Basic Form Pattern

### Step 1: Define Schema

```tsx
import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "viewer"], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
  department: z.string().min(1, "Department is required"),
  startDate: z.string().optional(),
  salary: z.number().min(0, "Salary must be positive").optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
```

### Step 2: Create Form Component

```tsx
// src/pages/Admin/Employees/Components/EmployeeForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, EmployeeFormData } from "./schemas";

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EmployeeForm = ({ defaultValues, onSubmit, onCancel, isLoading }: EmployeeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          {...register("name")}
          className="w-full px-3 py-2 border border-gray-200 rounded-md"
          placeholder="Enter name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full px-3 py-2 border border-gray-200 rounded-md"
          placeholder="Enter email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          {...register("role")}
          className="w-full px-3 py-2 border border-gray-200 rounded-md"
        >
          <option value="">Select role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="viewer">Viewer</option>
        </select>
        {errors.role && (
          <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
```

---

## Integration with API

### Create Operation

```tsx
// In container component
import { useCreateEmployeeMutation } from '@/store/Api/employee.api';
import { toast } from 'sonner';

const [createEmployee, { isLoading }] = useCreateEmployeeMutation();

const handleCreate = async (data: EmployeeFormData) => {
  try {
    await createEmployee(data).unwrap();
    toast.success("Employee created successfully");
    closeModal();
  } catch (error) {
    toast.error("Failed to create employee");
  }
};

<EmployeeForm onSubmit={handleCreate} isLoading={isLoading} />
```

### Update Operation

```tsx
const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();

const handleUpdate = async (data: EmployeeFormData) => {
  try {
    await updateEmployee({ id: employeeId, ...data }).unwrap();
    toast.success("Employee updated successfully");
    closeModal();
  } catch (error) {
    toast.error("Failed to update employee");
  }
};

<EmployeeForm 
  defaultValues={employee} 
  onSubmit={handleUpdate} 
  isLoading={isLoading} 
/>
```

---

## Form with Modal

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const FormModal = ({ isOpen, onClose, onSubmit }: FormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Form Title</h2>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Form fields */}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

---

## Validation Patterns

### String Validations

```tsx
z.string()
  .min(1, "Required")
  .min(3, "Must be at least 3 characters")
  .max(100, "Must be less than 100 characters")
  .email("Invalid email")
  .regex(/^[A-Za-z]+$/, "Only letters allowed");
```

### Number Validations

```tsx
z.number()
  .min(0, "Must be positive")
  .max(100, "Cannot exceed 100")
  .int("Must be a whole number")
  .positive("Must be positive");
```

### Date Validations

```tsx
z.string()
  .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
  .transform((val) => new Date(val));
```

### Conditional Validations

```tsx
z.object({
  hasDiscount: z.boolean(),
  discount: z.number().optional(),
}).refine(
  (data) => !data.hasDiscount || (data.discount !== undefined && data.discount > 0),
  {
    message: "Discount is required when discount is enabled",
    path: ["discount"],
  }
);
```

### Nested Objects

```tsx
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
});

const userSchema = z.object({
  name: z.string(),
  address: addressSchema,
});
```

### Arrays

```tsx
z.object({
  tags: z.array(z.string()).min(1, "At least one tag required"),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
  })).max(10, "Maximum 10 items"),
});
```

---

## Advanced Patterns

### Dynamic Fields

```tsx
import { useFieldArray } from "react-hook-form";

const { control, register } = useForm<{
  items: { name: string; quantity: number }[];
}>();

const { fields, append, remove } = useFieldArray({
  control,
  name: "items",
});

return (
  <div>
    {fields.map((field, index) => (
      <div key={field.id}>
        <input {...register(`items.${index}.name`)} />
        <input {...register(`items.${index}.quantity`)} type="number" />
        <button type="button" onClick={() => remove(index)}>Remove</button>
      </div>
    ))}
    <button type="button" onClick={() => append({ name: "", quantity: 1 })}>
      Add Item
    </button>
  </div>
);
```

### Dependent Fields

```tsx
const { watch, setValue } = useForm<FormData>();
const country = watch("country");

useEffect(() => {
  setValue("city", ""); // Reset city when country changes
}, [country, setValue]);
```

---

## Form Checklist

- [ ] Schema defined with Zod
- [ ] Type inferred from schema
- [ ] zodResolver used
- [ ] Error messages displayed
- [ ] Loading state handled
- [ ] Success/error toasts
- [ ] Form reset on success/cancel
- [ ] Accessible labels
