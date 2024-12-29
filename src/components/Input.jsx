'use client';

import React, { useCallback } from 'react';

// test
export function Input(options) {
  const noop = () => null;
  const {
    value,
    label,
    id,
    onChange = noop,
    ref = null,
    onKeyDown = noop,
    ...rest
  } = options;

  const internalOnChange = useCallback(
    e => {
      const updatedValue = e.currentTarget.value;
      onChange(updatedValue);
    },
    [onChange],
  );

  return (
    <div className="mb-10">
      <div className="pb-2">
        <label htmlFor={id}>{label}</label>
      </div>
      <div>
        <input
          {...rest}
          className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={value}
          onChange={internalOnChange}
          id={id}
          ref={ref}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}
