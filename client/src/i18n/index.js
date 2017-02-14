/* @flow */

import {
  loadTranslations,
  setLocale,
  syncTranslationWithStore,
  I18n,
} from 'react-redux-i18n';


import en from './en';


const translations = {
  en,
};

export const setupTranslationsInStore = (store: {
  dispatch: Function,
}) => {
  syncTranslationWithStore(store);
  store.dispatch(loadTranslations(translations));
  store.dispatch(setLocale('en'));
};

export const t = (labelName: string, values?: Object): string => (
  I18n.t(labelName, values)
);

export default I18n;
