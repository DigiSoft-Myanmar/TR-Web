import { useState, useEffect } from "react";

function getStorageValue(key: string, defaultValue: string) {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved!);
  return initial || defaultValue;
}

export const useLocalStorage = (key: string, defaultValue: string) => {
  const [state, setState] = useState(defaultValue);

  if (typeof window === "undefined") {
    return [state, setState];
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
