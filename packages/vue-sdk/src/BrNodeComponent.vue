<!--
  Copyright 2020 Bloomreach

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
  <br-meta :meta="component.getMeta()">
    <slot>
      <br-node-container-item v-if="isContainerItem(component)" />

      <br-node-container v-else-if="isContainer(component)">
        <br-node-component v-for="(component, key) in component.getChildren()" :key="key" :component="component" />
      </br-node-container>

      <component
        v-else-if="component.getName() in mapping"
        :is="mapping[component.getName()]"
        :component="component"
        :page="page"
      />

      <br-node-component v-else v-for="(component, key) in component.getChildren()" :key="key" :component="component" />
    </slot>
  </br-meta>
</template>

<script lang="ts">
import { Component as SpaComponent, Page, isContainerItem, isContainer } from '@bloomreach/spa-sdk';
import { Component, Inject, Prop, Provide, Vue } from 'vue-property-decorator';
import BrMeta from './BrMeta.vue';
import BrNodeContainerItem from './BrNodeContainerItem.vue';
import BrNodeContainer from './BrNodeContainer.vue';

@Component({
  components: {
    BrMeta,
    BrNodeContainerItem,
    BrNodeContainer,
  },
  computed: {
    mapping(this: BrNodeComponent) {
      return this.mapping$();
    },
    page(this: BrNodeComponent) {
      return this.page$();
    },
  },
  methods: {
    isContainerItem,
    isContainer,
  },
  name: 'br-node-component',
})
export default class BrNodeComponent extends Vue {
  @Prop() component!: SpaComponent;

  @Inject() private mapping$!: () => Record<string, Vue.Component>;

  @Inject() private page$!: () => Page;

  @Provide() // ProvideReactive doesn't work with recursive components
  private component$() {
    return this.component;
  }
}
</script>
