import { z, ZodTypeAny } from "zod";
import { FieldConfig } from "@/common/DynamicForm/FormFields/FieldTypes";

// ============================================
// 🎯 Enhanced Zod Schema Generator
// ============================================

export const generateZodSchema = (fields: FieldConfig[]) => {
  const shape: Record<string, ZodTypeAny> = {};

  fields.forEach((field) => {
    let validator: ZodTypeAny;

    switch (field.type) {
      // ============================================
      // Text-based fields
      // ============================================
      case "email":
        validator = z.string().email("Invalid email address");
        break;

      case "url":
        validator = z.string().url("Invalid URL");
        break;

      case "tel":
        validator = z
          .string()
          .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number");
        break;

      case "text":
      case "password":
      case "textarea":
        validator = z.string();
        break;

      // ============================================
      // Number fields
      // ============================================
      case "number":
      case "range":
        validator = z.coerce.number();

        if ("min" in field && field.min !== undefined) {
          validator = (validator as z.ZodNumber).min(
            field.min,
            `Minimum value is ${field.min}`
          );
        }

        if ("max" in field && field.max !== undefined) {
          validator = (validator as z.ZodNumber).max(
            field.max,
            `Maximum value is ${field.max}`
          );
        }

        if ("step" in field && field.step !== undefined) {
          validator = (validator as z.ZodNumber).multipleOf(
            field.step,
            `Must be a multiple of ${field.step}`
          );
        }
        break;

      // ============================================
      // Select fields
      // ============================================
      case "select":
        validator = z.string();

        if ("options" in field && field.options && field.options.length > 0) {
          const validValues = field.options.map((opt) =>
            typeof opt === "string" ? opt : opt.value.toString()
          );
          validator = z.enum(validValues as [string, ...string[]]);
        }
        break;

      case "multiselect":
      case "checkbox-group":
      case "tags":
        validator = z.array(z.string());

        if ("minSelection" in field && field.minSelection !== undefined) {
          validator = (validator as z.ZodArray<z.ZodString>).min(
            field.minSelection,
            `Select at least ${field.minSelection} option(s)`
          );
        }

        if ("maxSelection" in field && field.maxSelection !== undefined) {
          validator = (validator as z.ZodArray<z.ZodString>).max(
            field.maxSelection,
            `Select at most ${field.maxSelection} option(s)`
          );
        }

        if ("maxTags" in field && field.maxTags !== undefined) {
          validator = (validator as z.ZodArray<z.ZodString>).max(
            field.maxTags,
            `Maximum ${field.maxTags} tags allowed`
          );
        }
        break;

      // ============================================
      // Boolean fields
      // ============================================
      case "checkbox":
      case "switch":
        validator = z.boolean();
        break;

      // ============================================
      // Radio fields
      // ============================================
      case "radio":
        if ("options" in field && field.options && field.options.length > 0) {
          const validValues = field.options.map((opt) =>
            typeof opt === "string" ? opt : opt.value.toString()
          );
          validator = z.enum(validValues as [string, ...string[]]);
        } else {
          validator = z.string();
        }
        break;

      // ============================================
      // Date/Time fields
      // ============================================
      case "date":
      case "datetime-local":
      case "time":
        validator = z.string();

        // Optionally convert to Date object
        // validator = z.string().transform((val) => new Date(val));

        if ("min" in field && field.min) {
          const minDate =
            typeof field.min === "string"
              ? field.min
              : field.min.toISOString().split("T")[0];
          validator = (validator as z.ZodString).refine(
            (val) => new Date(val) >= new Date(minDate),
            `Date must be after ${minDate}`
          );
        }

        if ("max" in field && field.max) {
          const maxDate =
            typeof field.max === "string"
              ? field.max
              : field.max.toISOString().split("T")[0];
          validator = (validator as z.ZodString).refine(
            (val) => new Date(val) <= new Date(maxDate),
            `Date must be before ${maxDate}`
          );
        }
        break;

      // ============================================
      // File upload fields
      // ============================================
      case "file":
        if ("multiple" in field && field.multiple) {
          validator = z.array(z.instanceof(File));

          if ("maxFiles" in field && field.maxFiles !== undefined) {
            validator = (validator as z.ZodArray<z.ZodType<File>>).max(
              field.maxFiles,
              `Maximum ${field.maxFiles} files allowed`
            );
          }
        } else {
          validator = z.instanceof(File);
        }

        // File size validation
        if ("maxSize" in field && field.maxSize !== undefined) {
          const maxSizeMB = (field.maxSize / (1024 * 1024)).toFixed(2);

          if ("multiple" in field && field.multiple) {
            validator = (validator as z.ZodArray<z.ZodType<File>>).refine(
              (files) =>
                files.every((file) => file.size <= (field.maxSize || 0)),
              `Each file must be less than ${maxSizeMB}MB`
            );
          } else {
            validator = (validator as z.ZodType<File>).refine(
              (file) => file.size <= (field.maxSize || 0),
              `File must be less than ${maxSizeMB}MB`
            );
          }
        }

        // File type validation
        if ("accept" in field && field.accept) {
          const acceptedTypes = field.accept.split(",").map((t) => t.trim());

          if ("multiple" in field && field.multiple) {
            validator = (validator as z.ZodArray<z.ZodType<File>>).refine(
              (files) =>
                files.every((file) =>
                  acceptedTypes.some((type) => {
                    if (type.startsWith(".")) {
                      return file.name
                        .toLowerCase()
                        .endsWith(type.toLowerCase());
                    }
                    if (type.includes("/*")) {
                      const category = type.split("/")[0];
                      return file.type.startsWith(category);
                    }
                    return file.type === type;
                  })
                ),
              `Invalid file type. Accepted: ${field.accept}`
            );
          } else {
            validator = (validator as z.ZodType<File>).refine(
              (file) =>
                acceptedTypes.some((type) => {
                  if (type.startsWith(".")) {
                    return file.name.toLowerCase().endsWith(type.toLowerCase());
                  }
                  if (type.includes("/*")) {
                    const category = type.split("/")[0];
                    return file.type.startsWith(category);
                  }
                  return file.type === type;
                }),
              `Invalid file type. Accepted: ${field.accept}`
            );
          }
        }
        break;

      // ============================================
      // Color picker
      // ============================================
      case "color":
        validator = z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format");
        break;

      // ============================================
      // Rich text
      // ============================================
      case "rich-text":
        validator = z.string();
        break;

      // ============================================
      // Default
      // ============================================
      default:
        validator = z.string();
    }

    // ============================================
    // Apply common validations
    // ============================================

    // Required field validation
    if (field.required !== false) {
      if (validator instanceof z.ZodString) {
        validator = validator.min(1, `${field.label} is required`);
      } else if (validator instanceof z.ZodArray) {
        validator = validator.min(1, `${field.label} is required`);
      } else if (validator instanceof z.ZodType && field.type === "file") {
        // File is required
        validator = validator.refine(
          (file) => file !== null && file !== undefined,
          `${field.label} is required`
        );
      }
    } else {
      // Make field optional
      validator = validator.optional();
    }

    // Length validations for string fields
    if (
      validator instanceof z.ZodString ||
      (validator instanceof z.ZodOptional &&
        validator._def.innerType instanceof z.ZodString)
    ) {
      const stringValidator =
        validator instanceof z.ZodOptional
          ? (validator._def.innerType as z.ZodString)
          : validator;

      if ("minLength" in field && field.minLength !== undefined) {
        validator = stringValidator.min(
          field.minLength,
          `Minimum ${field.minLength} characters required`
        );
        if (field.required === false) {
          validator = validator.optional();
        }
      }

      if ("maxLength" in field && field.maxLength !== undefined) {
        validator = stringValidator.max(
          field.maxLength,
          `Maximum ${field.maxLength} characters allowed`
        );
        if (field.required === false) {
          validator = validator.optional();
        }
      }

      // Pattern validation
      if ("pattern" in field && field.pattern) {
        validator = stringValidator.regex(
          new RegExp(field.pattern),
          `Invalid format for ${field.label}`
        );
        if (field.required === false) {
          validator = validator.optional();
        }
      }
    }

    // Custom validation rules
    if (field.validation && field.validation.length > 0) {
      field.validation.forEach((rule) => {
        validator = validator.refine((val) => {
          // Custom validation logic based on rule.rule
          return customValidators[rule.rule]?.(val, rule.value) ?? true;
        }, rule.message);
      });
    }

    shape[field.name] = validator;
  });

  return z.object(shape);
};

// ============================================
// 🔧 Custom Validators
// ============================================

const customValidators: Record<
  string,
  (value: unknown, ruleValue?: unknown) => boolean
> = {
  hasUppercase: (value) => {
    if (typeof value !== "string") return false;
    return /[A-Z]/.test(value);
  },
  hasLowercase: (value) => {
    if (typeof value !== "string") return false;
    return /[a-z]/.test(value);
  },
  hasNumber: (value) => {
    if (typeof value !== "string") return false;
    return /\d/.test(value);
  },
  hasSpecialChar: (value) => {
    if (typeof value !== "string") return false;
    return /[!@#$%^&*(),.?":{}|<>]/.test(value);
  },
  minWords: (value, min) => {
    if (typeof value !== "string" || typeof min !== "number") return false;
    return value.trim().split(/\s+/).length >= min;
  },
  maxWords: (value, max) => {
    if (typeof value !== "string" || typeof max !== "number") return false;
    return value.trim().split(/\s+/).length <= max;
  },
  isAlphanumeric: (value) => {
    if (typeof value !== "string") return false;
    return /^[a-zA-Z0-9]+$/.test(value);
  },
  noSpaces: (value) => {
    if (typeof value !== "string") return false;
    return !/\s/.test(value);
  },
};

// Export custom validators for external use
export { customValidators };
