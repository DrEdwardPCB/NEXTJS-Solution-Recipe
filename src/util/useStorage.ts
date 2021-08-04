//just copy from internet of a hooks to access localstorage dedicate for nextjs
//https://dev.to/devlargs/nextjs-hook-for-accessing-local-or-session-storage-variables-3n0

/*
 `Storage` User will determine what storage object will he/she be using. 
 This way, user cant pass unnecessary string values
*/


/*
 `UseStorageReturnValue` This is just a return value type for our hook. 
 We can add additional typings later.
*/

type StorageType = 'session' | 'local';
type UseStorageReturnValue = {
  getItem: (key: string, type?: StorageType) => string;
  setItem: (key: string, value: string, type?: StorageType) => boolean;
  removeItem: (key: string, type?: StorageType) => void;
};

const useStorage = (): UseStorageReturnValue => {
  const storageType = (type?: StorageType): 'localStorage' | 'sessionStorage' => `${type ?? 'local'}Storage`;

  const isBrowser: boolean = ((): boolean => typeof window !== 'undefined')();

  const getItem = (key: string, type?: StorageType): string => {
    return isBrowser ? window[storageType(type)][key] : '';
  };

  const setItem = (key: string, value: string, type?: StorageType): boolean => {
    if (isBrowser) {
      const theItem = getItem(key)//suppose string
      window[storageType(type)].setItem(key, value);

      if (theItem != value) {
        window.dispatchEvent(new Event('storage'))
      }
      return true;
    }
    return false;
  };

  const removeItem = (key: string, type?: StorageType): void => {
    window[storageType(type)].removeItem(key);
  };

  return {
    getItem,
    setItem,
    removeItem,
  };
};

export default useStorage;