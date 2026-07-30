import { TextareaHTMLAttributes, forwardRef, useId } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = false, resize = 'vertical', className = '', id, ...props }, ref) => {
    const baseStyles = 'bg-white dark:bg-gray-800 border rounded-lg px-4 py-3 text-foreground placeholder-slate-500 dark:placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const borderColor = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20';
    const widthStyle = fullWidth ? 'w-full' : '';
    const resizeStyle = `resize-${resize}`;

    // Associate the label and any error/helper text with the control so screen
    // readers announce them (WCAG 1.3.1 / 4.1.2). A caller-supplied id wins.
    const reactId = useId();
    const textareaId = id ?? reactId;
    const messageId = `${textareaId}-message`;
    const hasMessage = Boolean(error || helperText);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-body mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`${baseStyles} ${borderColor} ${widthStyle} ${resizeStyle} ${className}`}
          {...props}
        />
        {error && (
          <p id={messageId} role="alert" className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p id={messageId} className="mt-1 text-sm text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
