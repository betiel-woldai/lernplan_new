import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  error?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, error }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Light mode color palette with white and blue preference
  const predefinedColors = [
    '#FFFFFF', // White
    '#F8FAFC', // Slate 50
    '#F1F5F9', // Slate 100
    '#E2E8F0', // Slate 200
    '#3B82F6', // Blue 500
    '#60A5FA', // Blue 400
    '#93C5FD', // Blue 300
    '#DBEAFE', // Blue 100
    '#EFF6FF', // Blue 50
    '#EF4444', // Red 500
    '#F87171', // Red 400
    '#10B981', // Green 500
    '#34D399', // Green 400
    '#F59E0B', // Yellow 500
    '#FBBF24', // Yellow 400
    '#8B5CF6', // Purple 500
    '#A78BFA', // Purple 400
    '#F97316', // Orange 500
    '#FB923C', // Orange 400
    '#06B6D4', // Cyan 500
    '#22D3EE', // Cyan 400
    '#84CC16', // Lime 500
    '#A3E635', // Lime 400
    '#EC4899', // Pink 500
    '#F472B6', // Pink 400
  ];

  return (
    <div className="space-y-3">
      {/* Color Preview */}
      <div
        className="w-full h-12 rounded-md border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
        style={{ backgroundColor: value }}
        onClick={() => setShowPicker(!showPicker)}
        title={`Selected color: ${value}`}
      />
      
      {/* Predefined Colors */}
      <div className="grid grid-cols-8 gap-2">
        {predefinedColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
              value === color ? 'border-gray-800 shadow-lg' : 'border-gray-300 hover:border-gray-400'
            } ${color === '#FFFFFF' ? 'shadow-sm' : ''}`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            title={`Select color ${color}`}
          />
        ))}
      </div>
      
      {/* Custom Color Picker */}
      {showPicker && (
        <div className="relative">
          <div className="border border-gray-300 rounded-lg p-3 bg-white shadow-lg">
            <HexColorPicker 
              color={value} 
              onChange={onChange}
              style={{ width: '100%', height: '200px' }}
            />
            <div className="mt-3 flex items-center justify-between">
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const color = e.target.value;
                  if (/^#[0-9A-F]{0,6}$/i.test(color)) {
                    onChange(color);
                  }
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm font-mono w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#FFFFFF"
              />
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default ColorPicker;