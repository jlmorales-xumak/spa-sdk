/*
 * Copyright 2019-2020 Hippo B.V. (http://www.onehippo.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Typed } from 'emittery';
import { Component, Factory, PageModel, Page, TYPE_COMPONENT } from '../page';
import { Events } from '../events';
import { Api } from './api';
import { Spa } from './spa';

jest.mock('../url');

const model = {
  _meta: {},
  content: {
    someContent: { id: 'content-id', name: 'content-name' },
  },
  page: {
    id: 'page-id',
    type: TYPE_COMPONENT,
    _links: {
      componentRendering: { href: 'some-url' },
    },
  },
};
const config = {
  httpClient: jest.fn(),
  options: {
    live: {
      cmsBaseUrl: 'http://localhost:8080/site/my-spa',
    },
    preview: {
      cmsBaseUrl: 'http://localhost:8080/site/_cmsinternal/my-spa',
    },
  },
  request: {
    path: '/',
  },
};

describe('Spa', () => {
  let api: jest.Mocked<Api>;
  let eventBus: Typed<Events>;
  let page: jest.Mocked<Page>;
  let pageFactory: jest.Mocked<Factory<[PageModel], Page>>;
  let spa: Spa;

  beforeEach(() => {
    eventBus = new Typed<Events>();
    api = {
      initialize: jest.fn(),
      getPage: jest.fn(() => model),
      getComponent: jest.fn(() => model),
    } as unknown as jest.Mocked<Api>;
    page = {
      getComponent: jest.fn(),
      isPreview: jest.fn(),
    } as unknown as jest.Mocked<Page>;
    pageFactory = { create: jest.fn() };

    spyOn(eventBus, 'on').and.callThrough();
    pageFactory.create.mockReturnValue(page);
    spa = new Spa(eventBus, api, pageFactory);
  });

  describe('initialize', () => {
    beforeEach(async () => await spa.initialize(config.request.path));

    it('should get page through an API', () => {
      expect(api.getPage).toBeCalledWith(config.request.path);
    });

    it('should use a page model from the arguments', async () => {
      jest.clearAllMocks();
      const model = {} as PageModel;

      await spa.initialize(config.request.path, model);
      expect(api.getPage).not.toBeCalled();
      expect(pageFactory.create).toBeCalledWith(model);
    });

    it('should create a page instance', () => {
      expect(pageFactory.create).toBeCalledWith(model);
    });

    it('should subscribe for cms.update event', async () => {
      page.isPreview.mockReturnValue(true);
      await spa.initialize(config.request.path);
      expect(eventBus.on).toBeCalledWith('cms.update', expect.any(Function));
    });

    it('should reject a promise when fetching the page model fails', () => {
      const error = new Error('Failed to fetch page model data');
      api.getPage.mockImplementationOnce(() => { throw error; });
      const promise = spa.initialize(config.request.path);

      expect.assertions(1);
      expect(promise).rejects.toBe(error);
    });
  });

  describe('onCmsUpdate', () => {
    let component: jest.Mocked<Component>;
    let root: jest.Mocked<Component>;

    beforeEach(async () => {
      root = { getComponentById: jest.fn() } as unknown as jest.Mocked<Component>;
      component = { getUrl: jest.fn() } as unknown as jest.Mocked<Component>;

      page.getComponent.mockReturnValue(root);
      page.isPreview.mockReturnValue(true);
      spyOn(eventBus, 'emit');
      await spa.initialize(config.request.path);

      jest.clearAllMocks();
    });

    it('should not proceed if a component does not exist', async () => {
      await eventBus.emitSerial('cms.update', { id: 'some-component', properties: {} });

      expect(root.getComponentById).toBeCalledWith('some-component');
      expect(api.getComponent).not.toBeCalled();
      expect(eventBus.emit).not.toBeCalled();
    });

    describe('on component update', () => {
      beforeEach(async () => {
        root.getComponentById.mockReturnValue(component);
        component.getUrl.mockReturnValue('some-url');
        await eventBus.emitSerial('cms.update', { id: 'page-id', properties: { a: 'b' } });
      });

      it('should request a component model', () => {
        expect(component.getUrl).toBeCalled();
        expect(api.getComponent).toBeCalledWith('some-url', { a: 'b' });
      });

      it('should emit page.update event', () => {
        expect(eventBus.emit).toBeCalledWith('page.update', { page: model });
      });
    });
  });

  describe('destroy', () => {
    it('should unsubscribe from cms.update event', async () => {
      spyOn(eventBus, 'off');

      await spa.initialize(config.request.path);
      spa.destroy();

      expect(eventBus.off).toBeCalledWith('cms.update', expect.any(Function));
    });
  });
});