import { ButtonHTMLAttributes } from 'react';

interface LoadingButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  isLoading: boolean;
  text: string;
  loadingText: string;
}

export const LoadingButton = ({
  isLoading,
  text,
  loadingText,
  disabled,
  className = '',
  type = 'submit',
  onClick,
  ...props
}: LoadingButtonProps) => (  <button
    {...props}
    type={type}
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`flex items-center justify-center gap-2 ${className} ${
      isLoading ? 'cursor-not-allowed opacity-75' : ''
    } disabled:opacity-75 disabled:cursor-not-allowed`}
  >
    {isLoading && (
      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
    )}
    {isLoading ? loadingText : text}
  </button>
);
