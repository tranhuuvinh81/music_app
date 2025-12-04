// frontend/src/components/ui/Button.js
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  className = '', 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'rounded-full font-medium transition-all duration-300 focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white hover:shadow-lg hover:scale-105',
    secondary: 'bg-white bg-opacity-20 backdrop-blur-sm  hover:bg-opacity-30',
    accent: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white hover:shadow-lg hover:scale-105',
    ghost: 'bg-transparent text-white hover:bg-white hover:bg-opacity-20',
  };
  
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;