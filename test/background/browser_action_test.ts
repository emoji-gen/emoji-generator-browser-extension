'use strict';

import { assert } from 'chai';
import * as sinon from 'sinon';

import * as browserAction from '../../src/background/browser_action';

describe('addListener', () => {
  let addListener: sinon.SinonSpy;
  let create: sinon.SinonSpy;
  let getUILanguage: sinon.SinonSpy;

  beforeEach(() => {
    addListener = sinon.spy();
    create = sinon.spy();
    getUILanguage = sinon.stub().returns('ja');

    const wind = window as any;
    wind.chrome = {
      action: {
        onClicked: { addListener },
      },
      tabs: { create },
      i18n: { getUILanguage },
    };
  });

  afterEach(() => {
    addListener.resetHistory();
    create.resetHistory();
    getUILanguage.resetHistory();

    const wind = window as any;
    wind.chrome = undefined;
  });

  it('should register listener function', () => {
    browserAction.addListener();

    assert.ok(addListener.called);
    assert.isFunction(addListener.args[0][0]);
  });

  it('should open new tab', () => {
    browserAction.addListener();
    addListener.args[0][0]();

    assert.ok(create.called);
    assert.deepEqual(create.args[0][0], {
      url: 'https://emoji-gen.ninja',
    });
  });
});
