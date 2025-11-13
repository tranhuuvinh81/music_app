import React from 'react';

const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  ...props
}) => {
  const handleChange = (event) => {
    onChange(Number(event.target.value));
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      className={`
        w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-5
        [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:bg-blue-600
        [&::-webkit-slider-thumb]:border-0
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:hover:bg-blue-700
        [&::-moz-range-thumb]:w-5
        [&::-moz-range-thumb]:h-5
        [&::-moz-range-thumb]:bg-blue-600
        [&::-moz-range-thumb]:border-0
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:cursor-pointer
        [&::-moz-range-thumb]:hover:bg-blue-700
        ${className}
      `}
      {...props}
    />
  );
};

Slider.displayName = 'Slider';

export default Slider;