import {
  afterEach,
  beforeEach,
  describe,
  expect,
  rs,
  test,
} from '@rstest/core';

import { addListener } from './browser_action.js';

afterEach(() => {
  rs.unstubAllGlobals();
});

describe('addListener', () => {
  let _addListener: any;
  let create: any;
  let getUILanguage: any;

  beforeEach(() => {
    _addListener = rs.fn();
    create = rs.fn();
    getUILanguage = rs.fn().mockReturnValue('ja');

    const chrome = {
      action: {
        onClicked: { addListener: _addListener },
      },
      tabs: { create },
      i18n: { getUILanguage },
    };
    rs.stubGlobal('chrome', chrome);
  });

  test('should register listener function', () => {
    addListener();

    expect(_addListener).toHaveBeenCalled();
    expect(_addListener.mock.calls[0][0]).toBeTypeOf('function');
  });

  test('should open new tab', () => {
    addListener();
    _addListener.mock.calls[0][0]();

    expect(create).toHaveBeenCalled();
    expect(create.mock.calls[0][0]).toEqual({
      url: 'https://emoji-gen.ninja',
    });
  });
});
