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

<script lang="ts">
import { Page } from '@bloomreach/spa-sdk';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BrContainerOrderedList extends Vue {
  @Prop() page!: Page;

  render(createElement: Vue.CreateElement): Vue.VNode {
    return createElement(
      'ol',
      { class: { 'hst-container': this.page.isPreview() } },
      this.$slots.default?.map((node) =>
        createElement('li', { class: { 'hst-container-item': this.page.isPreview() } }, [node]),
      ),
    );
  }
}
</script>
