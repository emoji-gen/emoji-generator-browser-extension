const WEB_URL = 'https://emoji-gen.ninja';

export function addListener() {
  chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
    const locale = getLocale();
    const url = locale === 'ja' ? WEB_URL : WEB_URL + '/' + locale + '/';
    chrome.tabs.create({ url });
  });
}

// --------------------------------------------------------

const DEFAULT_LOCALE = 'en';
const SIMPLE_LOCALES = ['ja', 'ko', 'en'];
const SIMPLIFIED_CHINESE_COUNTRIES = ['cn', 'hans'];
const TRADITIONAL_CHINESE_COUNTRIES = ['tw', 'sg', 'hk', 'mo', 'hant'];

export function getLocale() {
  const [lang, country] = chrome.i18n.getUILanguage().toLowerCase().split('-');

  if (SIMPLE_LOCALES.includes(lang)) {
    return lang;
  }
  if (SIMPLIFIED_CHINESE_COUNTRIES.includes(country)) {
    return 'zh-Hans';
  }
  if (TRADITIONAL_CHINESE_COUNTRIES.includes(country)) {
    return 'zh-Hant';
  }
  if (lang === 'zh') {
    return 'zh-Hans';
  }

  return DEFAULT_LOCALE;
}
