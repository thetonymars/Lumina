
import React from 'react';
import { DesignStyle } from '../types';

interface StylePickerProps {
  selected: DesignStyle;
  onSelect: (style: DesignStyle) => void;
  disabled?: boolean;
}

const STYLES = [
  { id: DesignStyle.MID_CENTURY, icon: 'fa-chair', desc: 'Warm, Retro, Functional' },
  { id: DesignStyle.SCANDINAVIAN, icon: 'fa-snowflake', desc: 'Light, Minimal, Natural' },
  { id: DesignStyle.INDUSTRIAL, icon: 'fa-building', desc: 'Raw, Urban, Metallic' },
  { id: DesignStyle.BOHEMIAN, icon: 'fa-leaf', desc: 'Eclectic, Vibrant, Cozy' },
  { id: DesignStyle.JAPANDI, icon: 'fa-yin-yang', desc: 'Zen, Clean, Balanced' },
  { id: DesignStyle.ART_DECO, icon: 'fa-gem', desc: 'Bold, Luxury, Geometric' }
];

const StylePicker: React.FC<StylePickerProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {STYLES.map((style) => (
        <button
          key={style.id}
          disabled={disabled}
          onClick={() => onSelect(style.id)}
          className={`flex-shrink-0 w-32 md:w-40 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${
            selected === style.id 
              ? 'border-indigo-600 bg-indigo-50 shadow-md' 
              : 'border-white bg-white hover:border-gray-200 hover:shadow-sm'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
            selected === style.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            <i className={`fa-solid ${style.icon}`}></i>
          </div>
          <span className={`text-sm font-semibold text-center leading-tight ${
            selected === style.id ? 'text-indigo-900' : 'text-gray-700'
          }`}>
            {style.id}
          </span>
          <span className="text-[10px] text-gray-400 text-center uppercase tracking-wider">{style.desc}</span>
        </button>
      ))}
    </div>
  );
};

export default StylePicker;
