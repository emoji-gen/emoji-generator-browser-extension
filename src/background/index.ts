import {
  CE_ATTACH,
  CE_REGISTER_EMOJI,
  CE_SEARCH_JOINED_TEAMS,
} from '../event.js';
import { addListener } from './browser_action.js';
import { searchJoinedTeams, registerEmoji } from './slack.js';

function attached(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
) {
  sendResponse({ contents: null });
}

function _searchJoinedTeams(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
): boolean {
  searchJoinedTeams().then(
    (teams) => sendResponse({ contents: teams }),
    (err) => sendResponse({ err }),
  );
  return true;
}

function _registerEmoji(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
): boolean {
  registerEmoji(
    request.detail.url,
    request.detail.text,
    request.detail.teamdomain,
  ).then(
    (_) => sendResponse({ contents: 'ok' }),
    (err) => sendResponse({ err }),
  );
  return true;
}

// --------------------------------------------------------------------------

function main() {
  if (_DEBUG) {
    console.log('Start background scripts');
  }

  addListener();
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (_DEBUG) {
      console.log(request);
    }
    switch (request.type) {
      case CE_ATTACH:
        return attached(request, sender, sendResponse);
      case CE_SEARCH_JOINED_TEAMS:
        return _searchJoinedTeams(request, sender, sendResponse);
      case CE_REGISTER_EMOJI:
        return _registerEmoji(request, sender, sendResponse);
    }
  });
}

main();
