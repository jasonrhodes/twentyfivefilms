'use client';

const posterSizeOptions = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'original'];

export function buildImageUrl({ config, size, path }) {
  const { secure_base_url, poster_sizes } = config;

  if (!posterSizeOptions.includes(size)) {
    console.error(
      `Invalid poster size requested (${size}), valid sizes are (${posterSizeOptions.join(', ')})`
    );
  }

  const sizeCode = poster_sizes[posterSizeOptions.indexOf(size)];

  return `${secure_base_url}${sizeCode}/${path}`;
}
