'use client'

import { useCallback } from 'react';

export function Input(options) {
  const noop = () => null;
  const { value, label, id, onChange = noop, selectedIndex = 0, setSelectedIndex = noop, ref = null, movies = [], onSelect = noop, ...rest } = options;

  const internalOnChange = useCallback((e) => {
    const updatedValue = e.currentTarget.value;
    onChange(updatedValue);
  }, [onChange]);

  const keyNavigation = (event) => {
    console.log('key press', event.code);
    if (event.code === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex(selectedIndex === 0 ? 0 : selectedIndex - 1)
    } else if (event.code === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex(selectedIndex === movies.length - 1 ? 0 : selectedIndex + 1)
    } else if (event.code === 'Enter') {
      console.log('LOG: pressed "ENTER"')
      event.preventDefault()
      onSelect(movies[selectedIndex], true)
    } else {
      console.log('LOG: else branch');
      setSelectedIndex(0)
    }
  }

  return (
    <div className="mb-10">
      <div className="pb-2"><label htmlFor={id}>{label}</label></div>
      <div>
        <input
          {...rest}
          className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={value} 
          onChange={internalOnChange} 
          id={id}
          ref={ref}
          onKeyDown={e => keyNavigation(e)}
        />
      </div>
    </div>
  )
}