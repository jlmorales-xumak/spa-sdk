/*
 * Copyright 2020 Hippo B.V. (http://www.onehippo.com)
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

import { PageModel, Visitor } from '../page';
import { UrlBuilder } from '../url';
import { HttpClientConfig, HttpClient, HttpRequest } from './http';

const DEFAULT_AUTHORIZATION_HEADER = 'Authorization';
const DEFAULT_SERVER_ID_HEADER = 'serverid';

export interface ApiOptions {
  /**
   * Authorization header.
   * By default, `Authorization` will be used.
   */
  authorizationHeader?: string;

  /**
   * Authorization token.
   * By default, the SDK will try to extract the token from the request query string
   * using `authorizationQueryParameter` option.
   */
  authorizationToken?: string;

  /**
   * HTTP client that will be used to fetch the page model.
   */
  httpClient: HttpClient<PageModel>;

  /**
   * Current user's request.
   */
  request: HttpRequest;

  /**
   * Header identifying the current cluster node.
   * By default, `serverid` will be used.
   */
  serverIdHeader?: string;

  /**
   * Cluster node identifier.
   * By default, the SDK will try to extract the value from the request query string
   * using `serverIdQueryParameter` option.
   */
  serverId?: string;

  /**
   * Current visitor.
   */
  visitor?: Omit<Visitor, 'new'>;
}

export interface Api {
  /**
   * @param path Source path to generate the Page Model API URL.
   * @returns The Page Model.
   */
  getPage(path: string): Promise<PageModel>;

  /**
   * @param path Source path to generate the Page Model API URL.
   * @param payload Payload with the component properties.
   * @return The Page Model.
   */
  getComponent(path: string, payload: object): Promise<PageModel>;
}

export class ApiImpl implements Api {
  private options!: ApiOptions;

  constructor(private urlBuilder: UrlBuilder) {}

  initialize(options: ApiOptions) {
    this.options = options;
  }

  getPage(path: string) {
    const url = this.urlBuilder.getApiUrl(path);

    return this.send({ url, method: 'GET' });
  }

  getComponent(path: string, payload: object) {
    const url = this.urlBuilder.getApiUrl(path);
    const data = new URLSearchParams(payload as Record<string, string>);

    return this.send({
      url,
      data: data.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });
  }

  private async send(config: HttpClientConfig) {
    const { remoteAddress: ip } = this.options.request.connection || {};
    const { host, ...headers } = this.options.request.headers || {};
    const {
      authorizationHeader = DEFAULT_AUTHORIZATION_HEADER,
      authorizationToken,
      serverIdHeader = DEFAULT_SERVER_ID_HEADER,
      serverId,
      visitor,
    } = this.options;

    const response = await this.options.httpClient({...config, headers: {
      ...ip && { 'x-forwarded-for': ip },
      ...authorizationToken && { [authorizationHeader]: `Bearer ${authorizationToken}` },
      ...serverId && { [serverIdHeader]: serverId },
      ...visitor && { [visitor.header]: visitor.id },
      ...headers,
      ...config.headers,
    }});

    return response.data;
  }
}