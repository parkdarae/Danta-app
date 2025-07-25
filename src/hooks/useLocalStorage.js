import { useState, useEffect } from 'react';

/**
 * 로컬 스토리지와 연동된 상태 관리 훅
 * @param {string} key - 로컬 스토리지 키
 * @param {any} defaultValue - 기본값
 * @returns {[any, function]} - [값, 설정함수]
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`로컬 스토리지에서 ${key}를 읽는 중 오류 발생:`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`로컬 스토리지에 ${key}를 저장하는 중 오류 발생:`, error);
    }
  };

  return [value, setStoredValue];
}

/**
 * 로컬 스토리지에서 데이터를 가져오는 함수
 * @param {string} key - 키
 * @param {any} defaultValue - 기본값
 * @returns {any} - 저장된 값 또는 기본값
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`로컬 스토리지에서 ${key}를 읽는 중 오류 발생:`, error);
    return defaultValue;
  }
}

/**
 * 로컬 스토리지에 데이터를 저장하는 함수
 * @param {string} key - 키
 * @param {any} value - 값
 */
export function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`로컬 스토리지에 ${key}를 저장하는 중 오류 발생:`, error);
  }
}

/**
 * 로컬 스토리지에서 데이터를 삭제하는 함수
 * @param {string} key - 키
 */
export function removeFromStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`로컬 스토리지에서 ${key}를 삭제하는 중 오류 발생:`, error);
  }
} 