<!--
  Copyright 2020-2021 Bloomreach

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  -->

<template>
  <div id="app" class="d-flex flex-column vh-100">
    <br-page :configuration="configuration" :mapping="mapping">
      <template v-slot:default="props">
        <header>
          <nav class="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
            <div class="container">
              <router-link :to="props.page.getUrl('/')" class="navbar-brand">
                {{ props.page.getTitle() || 'brXM + Vue.js = ♥' }}
              </router-link>
              <div class="collapse navbar-collapse">
                <br-component component="menu" />
              </div>
            </div>
          </nav>
        </header>
        <section class="container flex-fill pt-3">
          <br-component component="main" />
        </section>
        <footer class="bg-dark text-light py-3">
          <div class="container clearfix">
            <div class="float-left pr-3">&copy; Bloomreach</div>
            <div class="overflow-hidden">
              <br-component component="footer" />
            </div>
          </div>
        </footer>
        <br-cookie-consent :isPreview="props.page.isPreview()" :path="configuration.path"></br-cookie-consent>
      </template>
    </br-page>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { Configuration } from '@bloomreach/spa-sdk';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';

import Banner from './components/BrBanner.vue';
import Content from './components/BrContent.vue';
import Menu from './components/BrMenu.vue';
import NewsList from './components/BrNewsList.vue';
import CookieConsent from './components/BrCookieConsent.vue';

@Component({
  components: { 'br-cookie-consent': CookieConsent },
  data(this: App) {
    return {
      configuration: {
        baseUrl: process.env.BASE_URL !== '/' ? process.env.BASE_URL : '',
        endpoint: process.env.VUE_APP_BRXM_ENDPOINT,
        endpointQueryParameter: 'endpoint',
        httpClient: axios,
        path: this.$route.fullPath,
      },
      mapping: {
        Banner,
        Content,
        menu: Menu,
        'News List': NewsList,
        'Simple Content': Content,
      },
    };
  },
})
export default class App extends Vue {
  configuration!: Configuration;

  $route!: Route;

  @Watch('$route', { immediate: true, deep: true })
  navigate(): void {
    this.$set(this.configuration, 'path', this.$route.fullPath);
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app .has-edit-button {
  position: relative;
}
</style>
