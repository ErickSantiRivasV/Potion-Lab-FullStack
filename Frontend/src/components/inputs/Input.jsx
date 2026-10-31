function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
  autoComplete,
}) {
  const inputId = `input-${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "field"}`;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-app-text font-semibold mb-1"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        autoComplete={autoComplete}
        className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
      />
    </div>
  );
}

export default Input;
