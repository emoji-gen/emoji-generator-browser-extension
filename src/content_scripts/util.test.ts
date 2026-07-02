import {
  describe,
  expect,
  beforeEach,
  afterEach,
  rs,
  test,
} from '@rstest/core';

import { attach, getAppId, listenCustomEvent } from './util.js';
import {
  CE_ATTACH,
  CE_SEARCH_JOINED_TEAMS,
  CE_SEARCH_JOINED_TEAMS_DONE,
} from '../event.js';

afterEach(() => {
  rs.unstubAllGlobals();
});

describe('getAppId', () => {
  beforeEach(() => {
    document.body.setAttribute('data-app-id', '12345');
  });

  afterEach(() => {
    document.body.removeAttribute('data-app-id');
  });

  test('# can get app id', () => {
    expect(getAppId()).to.be.equal('12345');
  });
});

describe('attach', () => {
  let listener: any;

  beforeEach(() => {
    listener = rs.fn();
    document.body.addEventListener(CE_ATTACH, listener);
  });

  afterEach(() => {
    document.body.removeEventListener(CE_ATTACH, listener);
  });

  test('# can dispatch event', () => {
    attach();
    expect(listener).toHaveBeenCalled();
  });
});

describe('listenCustomEvent', () => {
  beforeEach(() => {
    const chrome = {
      runtime: {
        sendMessage: function (detail: any, response: (detail: any) => void) {
          response(detail);
        },
      },
    };
    rs.stubGlobal('chrome', chrome);
  });

  test('# can listen custom event', () => {
    let callbackEvent: CustomEvent | null = null;
    document.body.addEventListener(
      CE_SEARCH_JOINED_TEAMS_DONE,
      (e: Event) => {
        callbackEvent = e as CustomEvent;
      },
    );

    listenCustomEvent(CE_SEARCH_JOINED_TEAMS, CE_SEARCH_JOINED_TEAMS_DONE);

    const ce = new CustomEvent(CE_SEARCH_JOINED_TEAMS, { detail: 'foo' });
    document.body.dispatchEvent(ce);

    expect((callbackEvent as CustomEvent | null)?.detail).toEqual({
      type: CE_SEARCH_JOINED_TEAMS,
      detail: 'foo',
    });
  });
});
