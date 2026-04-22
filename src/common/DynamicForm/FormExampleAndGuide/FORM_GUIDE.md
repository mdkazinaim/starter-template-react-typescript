# Enhanced CommonForm Guide

## Overview

The `CommonForm` component is a robust, data-driven form solution designed for flexibility and ease of use. It supports over 20 field types, comprehensive validation (using Zod), default values, conditional rendering, file uploads with previews, and more.

## Features

- **20+ Field Types**: Text, email, password, number, select, multiselect, checkbox, radio, date, time, file upload, tags, rich text (placeholder), and more.
- **Validation**: Automatic Zod schema generation with support for custom validation rules.
- **Default Values**: Pre-populate forms with existing data.
- **Conditional Logic**: Show/hide fields based on the values of other fields.
- **Visual Enhancements**: Password visibility toggle, file previews, loading states.
- **Layout Control**: Support for vertical, horizontal, and grid layouts.

## Basic Usage

```tsx
import CommonForm from "@/common/CommonForm";
import { generateZodSchema } from "@/utils/generateZodSchema";
import type { FieldConfig } from "@/common/FormFields/FieldTypes";

const MyForm = () => {
  const fields: FieldConfig[] = [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
    },
  ];

  const schema = generateZodSchema(fields);

  const handleSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <CommonForm
      fields={fields}
      schema={schema}
      onSubmit={handleSubmit}
    />
  );
};
```

## Field Configuration

Each field is defined by a `FieldConfig` object. Here are some examples:

### Text & Password
```typescript
{
  name: "password",
  label: "Password",
  type: "password",
  required: true,
  minLength: 8,
  helpText: "Must be at least 8 characters",
}
```

### Select & Multiselect
```typescript
{
  name: "role",
  label: "User Role",
  type: "select",
  options: [
    { value: "admin", label: "Administrator" },
    { value: "user", label: "User" },
  ],
}
```

### Conditional Fields
Show a field only when another field has a specific value:
```typescript
{
  name: "otherRole",
  label: "Specify Role",
  type: "text",
  showWhen: {
    field: "role",
    operator: "equals",
    value: "other",
  },
}
```

### File Upload
```typescript
{
  name: "avatar",
  label: "Profile Picture",
  type: "file",
  accept: "image/*",
  preview: true,
  maxSize: 5 * 1024 * 1024, // 5MB
}
```

### Tags Input (New)
```typescript
{
  name: "skills",
  label: "Skills",
  type: "tags",
  maxTags: 5,
  suggestions: ["React", "TypeScript", "Node.js"],
}
```

## Default Values

You can provide default values in two ways:
1. **Per Field**: Add `defaultValue` to the field config.
2. **Form Level**: Pass a `defaultValues` object to the `CommonForm` component.

```typescript
// Field Config
{
  name: "username",
  type: "text",
  defaultValue: "johndoe",
}

// Form Component
<CommonForm
  defaultValues={{ username: "johndoe" }}
  // ...
/>
```

## Validation

Validation is handled automatically via `generateZodSchema`. You can add custom rules:

```typescript
{
  name: "customField",
  type: "text",
  validation: [
    { rule: "hasUppercase", message: "Must contain an uppercase letter" },
  ],
}
```
Supported custom rules: `hasUppercase`, `hasLowercase`, `hasNumber`, `hasSpecialChar`, `minWords`, `maxWords`, `isAlphanumeric`, `noSpaces`.

## Layouts

The form supports three layout modes:

- `vertical`: Fields stacked vertically (default).
- `horizontal`: Fields specific spacing (customizable).
- `grid`: Fields arranged in a grid.

```tsx
<CommonForm
  layout="grid"
  gridCols={2} // Number of columns
  // ...
/>
```

## Resetting the Form

To show a reset button:

```tsx
<CommonForm
  showResetButton
  resetButtonText="Clear Form"
  // ...
/>
```
