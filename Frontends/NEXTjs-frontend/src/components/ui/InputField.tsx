import React from "react";

interface InputFieldProps {
  label?: string;
  placeholder: string;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  min?: string;
  step?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  type = "text",
  onChange,
  ...rest
}) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 transition-all duration-200 outline-none"
        {...rest}
      />
    </div>
  );
};

export default InputField;