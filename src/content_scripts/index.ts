import {
  CE_ATTACH,
  CE_REGISTER_EMOJI,
  CE_REGISTER_EMOJI_DONE,
  CE_SEARCH_JOINED_TEAMS,
  CE_SEARCH_JOINED_TEAMS_DONE,
} from "../event.js";
import { attach, getAppId, listenCustomEvent } from "./util.js";

const APP_ID = "j1g3xUDxVmwWCCKqibVQCZOHNpvnSMBY";

function main() {
  if (_DEBUG) {
    console.log("Start background scripts");
  }

  const appId = getAppId();
  if (appId === APP_ID) {
    chrome.runtime.sendMessage({ type: CE_ATTACH }, (response) => {
      if (_DEBUG) {
        console.log("attach to Webpage", response);
      }
      listenCustomEvent(CE_SEARCH_JOINED_TEAMS, CE_SEARCH_JOINED_TEAMS_DONE);
      listenCustomEvent(CE_REGISTER_EMOJI, CE_REGISTER_EMOJI_DONE);
      attach();
    });
  }
}

main();
