export const keyCodeListener = (code, func) => {
  const keyFunction = (event) => {
    event.key === code && func();
  };
  document.addEventListener('keydown', keyFunction);
  return () => {
    document.removeEventListener('keydown', keyFunction);
  };
}