import {
  useForm,
  Controller,
  type Path,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";
import { useState, useMemo } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";
import TagsInput from "./FormFields/TagsInput";
import type { FieldConfig } from "./FormFields/FieldTypes";

// ============================================
// 📦 Types
// ============================================

interface CommonFormProps<T> {
  fields: FieldConfig[];
  schema: ZodSchema<T>;
  onSubmit: (data: T) => void | Promise<void>;
  defaultValues?: Partial<T>;
  submitButtonText?: string;
  resetButtonText?: string;
  showResetButton?: boolean;
  loading?: boolean;
  className?: string;
  layout?: "vertical" | "horizontal" | "grid";
  gridCols?: number;
}

// ============================================
// 🎨 Enhanced CommonForm Component
// ============================================

const CommonForm = <T extends Record<string, unknown>>({
  fields,
  schema,
  onSubmit,
  defaultValues,
  submitButtonText = "Submit",
  resetButtonText = "Reset",
  showResetButton = false,
  loading = false,
  className = "",
  layout = "vertical",
  gridCols = 2,
}: CommonFormProps<T>) => {
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string[]>>(
    {}
  );

  // Prepare default values from field configs
  const formDefaultValues = useMemo(() => {
    const defaults: Record<string, unknown> = {};

    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });

    return { ...defaults, ...defaultValues } as DefaultValues<T>;
  }, [fields, defaultValues]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: formDefaultValues,
  });

  const formValues = watch();

  // ============================================
  // 🔍 Conditional Field Logic
  // ============================================

  const shouldShowField = (field: FieldConfig): boolean => {
    if (!field.showWhen) return true;

    const {
      field: dependentField,
      operator = "equals",
      value,
    } = field.showWhen;
    const dependentValue = formValues[dependentField as keyof T];

    switch (operator) {
      case "equals":
        return dependentValue === value;
      case "notEquals":
        return dependentValue !== value;
      case "contains":
        return Array.isArray(dependentValue) && dependentValue.includes(value);
      case "greaterThan":
        return (
          typeof dependentValue === "number" &&
          typeof value === "number" &&
          dependentValue > value
        );
      case "lessThan":
        return (
          typeof dependentValue === "number" &&
          typeof value === "number" &&
          dependentValue < value
        );
      default:
        return true;
    }
  };

  // ============================================
  // 📁 File Preview Handler
  // ============================================

  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (!files) return;

    const previews: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          setFilePreviews((prev) => ({ ...prev, [fieldName]: previews }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // ============================================
  // 🎯 Form Submit Handler
  // ============================================

  const onSubmitForm = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // ============================================
  // 🎨 Render Field
  // ============================================

  const renderField = (field: FieldConfig) => {
    if (!shouldShowField(field)) return null;

    const error = errors[field.name];
    const errorMessage = error?.message as string | undefined;

    // Common input classes
    const inputClasses = `w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue ${
      error ? "border-red-500" : "border-border"
    } ${field.disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`;

    switch (field.type) {
      // ============================================
      // Text Inputs
      // ============================================
      case "text":
      case "email":
      case "url":
      case "tel":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              {"prefix" in field && field.prefix && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {field.prefix}
                </div>
              )}
              <input
                type={field.type}
                {...register(field.name as Path<T>)}
                placeholder={field.placeholder}
                disabled={field.disabled}
                readOnly={field.readOnly}
                className={`${inputClasses} ${
                  "prefix" in field && field.prefix ? "pl-10" : ""
                } ${"suffix" in field && field.suffix ? "pr-10" : ""}`}
              />
              {"suffix" in field && field.suffix && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {field.suffix}
                </div>
              )}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Password Input
      // ============================================
      case "password":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword[field.name] ? "text" : "password"}
                {...register(field.name as Path<T>)}
                placeholder={field.placeholder}
                disabled={field.disabled}
                className={`${inputClasses} pr-10`}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    [field.name]: !prev[field.name],
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword[field.name] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Number & Range
      // ============================================
      case "number":
      case "range":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              {...register(field.name as Path<T>)}
              min={"min" in field ? field.min : undefined}
              max={"max" in field ? field.max : undefined}
              step={"step" in field ? field.step : undefined}
              disabled={field.disabled}
              className={inputClasses}
            />
            {field.type === "range" &&
              "showValue" in field &&
              field.showValue && (
                <div className="text-center text-sm text-gray-600 mt-1">
                  {formValues[field.name as keyof T] as number}
                </div>
              )}
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Textarea
      // ============================================
      case "textarea": {
        const currentLength =
          (formValues[field.name as keyof T] as string)?.length || 0;
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              {...register(field.name as Path<T>)}
              rows={"rows" in field ? field.rows : 4}
              placeholder={field.placeholder}
              disabled={field.disabled}
              readOnly={field.readOnly}
              maxLength={"maxLength" in field ? field.maxLength : undefined}
              className={inputClasses}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {field.helpText && (
                  <p className="text-xs text-gray-500">{field.helpText}</p>
                )}
              </div>
              {"showCharCount" in field &&
                field.showCharCount &&
                "maxLength" in field && (
                  <p className="text-xs text-gray-500">
                    {currentLength}/{field.maxLength}
                  </p>
                )}
            </div>
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );
      }

      // ============================================
      // Select
      // ============================================
      case "select":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              {...register(field.name as Path<T>)}
              disabled={field.disabled}
              className={inputClasses}
            >
              <option value="">
                {field.placeholder || "Select an option"}
              </option>
              {"options" in field &&
                field.options?.map((opt) => {
                  const value = typeof opt === "string" ? opt : opt.value;
                  const label = typeof opt === "string" ? opt : opt.label;
                  const disabled = typeof opt === "object" && opt.disabled;
                  return (
                    <option key={value} value={value} disabled={disabled}>
                      {label}
                    </option>
                  );
                })}
            </select>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Multiselect
      // ============================================
      case "multiselect":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              {...register(field.name as Path<T>)}
              multiple
              disabled={field.disabled}
              className={`${inputClasses} min-h-[100px]`}
            >
              {"options" in field &&
                field.options?.map((opt) => {
                  const value = typeof opt === "string" ? opt : opt.value;
                  const label = typeof opt === "string" ? opt : opt.label;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
            </select>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Checkbox
      // ============================================
      case "checkbox":
        return (
          <div key={field.name} className={field.className}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register(field.name as Path<T>)}
                disabled={field.disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {"checkboxLabel" in field ? field.checkboxLabel : field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1 ml-6">
                {field.helpText}
              </p>
            )}
            {errorMessage && (
              <p className="text-sm text-red-500 mt-1 ml-6">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Checkbox Group
      // ============================================
      case "checkbox-group":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
              className={`space-y-2 ${
                "inline" in field && field.inline ? "flex flex-wrap gap-4" : ""
              }`}
            >
              {"options" in field &&
                field.options?.map((opt) => {
                  const value = typeof opt === "string" ? opt : opt.value;
                  const label = typeof opt === "string" ? opt : opt.label;
                  return (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={value}
                        {...register(field.name as Path<T>)}
                        disabled={field.disabled}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  );
                })}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Radio
      // ============================================
      case "radio":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
              className={`space-y-2 ${
                "inline" in field && field.inline ? "flex flex-wrap gap-4" : ""
              }`}
            >
              {"options" in field &&
                field.options?.map((opt) => {
                  const value = typeof opt === "string" ? opt : opt.value;
                  const label = typeof opt === "string" ? opt : opt.label;
                  return (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={value}
                        {...register(field.name as Path<T>)}
                        disabled={field.disabled}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  );
                })}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Date/Time
      // ============================================
      case "date":
      case "datetime-local":
      case "time":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              {...register(field.name as Path<T>)}
              min={
                "min" in field && field.min
                  ? typeof field.min === "string"
                    ? field.min
                    : field.min.toISOString().split("T")[0]
                  : undefined
              }
              max={
                "max" in field && field.max
                  ? typeof field.max === "string"
                    ? field.max
                    : field.max.toISOString().split("T")[0]
                  : undefined
              }
              disabled={field.disabled}
              className={inputClasses}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // File Upload
      // ============================================
      case "file":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl border-border bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-light-gray mb-2" />
                  <p className="text-sm text-light-gray mb-1">
                    Click to upload or drag and drop
                  </p>
                  {"accept" in field && field.accept && (
                    <p className="text-xs text-light-gray">
                      Accepted: {field.accept}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  {...register(field.name as Path<T>)}
                  accept={"accept" in field ? field.accept : undefined}
                  multiple={"multiple" in field ? field.multiple : false}
                  disabled={field.disabled}
                  onChange={(e) => {
                    const { onChange: onFileChange } = register(field.name as Path<T>);
                    onFileChange(e);
                    handleFileChange(field.name, e.target.files);
                  }}
                  className="hidden"
                />
              </label>

              {/* File Previews */}
              {"preview" in field &&
                field.preview &&
                filePreviews[field.name] && (
                  <div className="grid grid-cols-4 gap-2">
                    {filePreviews[field.name].map((preview, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Color Picker
      // ============================================
      case "color":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                {...register(field.name as Path<T>)}
                disabled={field.disabled}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                {...register(field.name as Path<T>)}
                disabled={field.disabled}
                placeholder="#000000"
                className={inputClasses}
              />
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Switch/Toggle
      // ============================================
      case "switch":
        return (
          <div key={field.name} className={field.className}>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  {...register(field.name as Path<T>)}
                  disabled={field.disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      // ============================================
      // Tags
      // ============================================
      case "tags":
        return (
          <div key={field.name} className={field.className}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Controller
              name={field.name as Path<T>}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TagsInput
                  value={(value as string[]) || []}
                  onChange={onChange}
                  placeholder={field.placeholder}
                  maxTags={"maxTags" in field ? field.maxTags : undefined}
                  suggestions={
                    "suggestions" in field ? field.suggestions : undefined
                  }
                  allowCustom={
                    "allowCustom" in field ? field.allowCustom : true
                  }
                  disabled={field.disabled}
                  tagColor={"tagColor" in field ? field.tagColor : undefined}
                />
              )}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================
  // 🎨 Layout Classes
  // ============================================

  const getLayoutClasses = () => {
    switch (layout) {
      case "grid":
        return "grid gap-4"; // Columns handled via style
      case "horizontal":
        return "space-y-4"; // Could also be a grid or flex, but stacking is safe default for horizontal if not specific
      default:
        return "space-y-4";
    }
  };

  // ============================================
  // 🎨 Render
  // ============================================

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className={`bg-white p-6 shadow-sm border border-border rounded-xl ${className}`}>
      <div
        className={getLayoutClasses()}
        style={
          layout === "grid"
            ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {fields.map((field) => renderField(field))}
      </div>

      <div className="flex gap-3 mt-6 justify-end">
        {showResetButton && (
          <button
            type="button"
            onClick={() => reset(formDefaultValues as DefaultValues<T>)}
            disabled={loading || isSubmitting}
            className="px-10 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resetButtonText}
          </button>
        )}

        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="px-10 py-3 bg-primary-blue text-white font-medium rounded-xl hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading || isSubmitting ? "Submitting..." : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default CommonForm;
