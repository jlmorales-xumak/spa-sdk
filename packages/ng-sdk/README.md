# Bloomreach Angular SDK

Bloomreach Angular SDK provides simplified headless integration with [Bloomreach Experience Manager](https://www.bloomreach.com/en/products/experience-manager)
for Angular-based applications. This library interacts with the [Page Model API](https://documentation.bloomreach.com/api-reference/content/delivery/page-delivery-api/page-delivery-api.html)
and [Bloomreach SPA SDK](https://www.npmjs.com/package/@bloomreach/spa-sdk) and
exposes a simplified declarative Angular interface over the Page Model.

## Features

- Bloomreach Page Angular component;
- Bloomreach Component Angular directive;
- Manage Content Button;
- Manage Menu Button;
- [TransferState](https://angular.io/api/platform-browser/TransferState) support;
- [Angular Universal](https://angular.io/guide/universal) support.

## Get Started

### Installation

To get the SDK into your project with [NPM](https://docs.npmjs.com/cli/npm):

```bash
npm install @bloomreach/ng-sdk
```

And with [Yarn](https://yarnpkg.com):

```bash
yarn add @bloomreach/ng-sdk
```

### Usage

The following code snippets render a simple page with a
[Banner](https://documentation.bloomreach.com/library/setup/hst-components/overview.html)
component.

#### `src/app/app.module.ts`

In the [`NgModule`](https://angular.io/guide/ngmodules) metadata, it needs to
import `BrSdkModule` and specify all the brXM components as [module entry components](https://angular.io/guide/entry-components).

```typescript
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrSdkModule } from "@bloomreach/ng-sdk";

import { AppComponent } from "./app.component";
import { BannerComponent } from "./banner/banner.component";

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, BannerComponent],
  entryComponents: [BannerComponent],
  imports: [BrowserModule, BrSdkModule],
})
export class AppModule {}
```

#### `src/app/app.component.ts`

In the `app-root` component, it needs to pass the configuration and brXM
components mapping into the `br-page` component inputs.

```typescript
import { Component } from "@angular/core";
import { Location } from "@angular/common";
import { Configuration } from "@bloomreach/spa-sdk";

import { BannerComponent } from "./banner/banner.component";

@Component({
  selector: "app-root",
  template: `
    <br-page [configuration]="configuration" [mapping]="mapping">
      <ng-template let-page="page">
        <header>
          <a [href]="page.getUrl('/')">Home</a>
          <ng-container brComponent="menu"></ng-container>
        </header>
        <section>
          <ng-container brComponent="main"></ng-container>
        </section>
        <footer>
          <ng-container brComponent="footer"></ng-container>
        </footer>
      </ng-template>
    </br-page>
  `,
})
export class AppComponent {
  configuration: Configuration;

  mapping = {
    Banner: BannerComponent,
  };

  constructor(location: Location) {
    this.configuration = {
      /* ... */
    };
  }
}
```

#### `src/app/banner/banner.component.ts`

Finally, in the `app-banner` component, it can consume the component data via
the `component` input.

```typescript
import { Component, Input } from "@angular/core";
import { Component as BrComponent } from "@bloomreach/spa-sdk";

@Component({
  selector: "app-banner",
  template: "Banner: {{ component.getName() }}",
})
export class BannerComponent {
  @Input() component!: BrComponent;
}
```

### Configuration

The `br-page` component supports several options you may use to customize page
initialization. These options will be passed to the `initialize` function from
[`@bloomreach/spa-sdk`](https://www.npmjs.com/package/@bloomreach/spa-sdk). See
[here](https://www.npmjs.com/package/@bloomreach/spa-sdk#configuration) for the
full configuration documentation.

### Mapping

The `br-page` component provides a way to link Angular components with the brXM
ones. It requires to pass the `mapping` property that maps the component type
with its representation.

The [Container Items](https://www.npmjs.com/package/@bloomreach/spa-sdk#container-item) can be
mapped by their labels.

```typescript
import { NewsListComponent } from "./news-list/news-list.component";

export class AppComponent {
  mapping = {
    "News List": NewsListComponent,
  };
}
```

The [Containers](https://www.npmjs.com/package/@bloomreach/spa-sdk#container-item)
can be only mapped by their [type](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html),
so you need to use [constants](https://www.npmjs.com/package/@bloomreach/spa-sdk#constants) from
[`@bloomreach/spa-sdk`](www.npmjs.com/package/@bloomreach/spa-sdk). By default,
the Angular SDK provides an implementation for all the container types as it is
defined in the [documentation](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html).

```typescript
import { TYPE_CONTAINER_INLINE } from "@bloomreach/spa-sdk";
import { InlineContainerComponent } from "./inline-container/inline-container.component";

export class AppComponent {
  mapping = {
    [TYPE_CONTAINER_INLINE]: InlineContainerComponent,
  };
}
```

From within the Container component, the Container Items can be accessed via the
`getChildren` method. This can be used to reorder or wrap child elements.

```typescript
import { Component, Input } from '@angular/core';
import { Component as BrComponent } from '@bloomreach/spa-sdk';

@Component({
  selector: 'app-inline-container',
  template: `
    <div>
      <span *ngFor="let child of component.getChildren()">
        <ng-container [brComponent]="child"></ng-container>
      </span>
    </div>
  `,
})
export class InlineContainerComponent() {
  @Input() component!: BrComponent;
}
```

The [Components](https://www.npmjs.com/package/@bloomreach/spa-sdk#component)
can be mapped by their names. It is useful for a menu component mapping.

```typescript
import { MenuComponent } from "./menu/menu.component";

export class AppComponent {
  mapping = {
    menu: MenuComponent,
  };
}
```

By default, container items that are not mapped will be rendered as a warning
text. There is an option to override the fallback.

```typescript
import { TYPE_CONTAINER_ITEM_UNDEFINED } from "@bloomreach/spa-sdk";
import { FallbackComponent } from "./fallback/fallback.component";

export class AppComponent {
  mapping = {
    [TYPE_CONTAINER_ITEM_UNDEFINED]: FallbackComponent,
  };
}
```

### Inline Mapping

There is also another way to render a component.
In case you need to show a static component or a component from the abstract page, you can use inline component mapping.

```typescript
@Component({
  selector: "app-root",
  template: `
    <br-page>
      <ng-template>
        <app-menu *brComponent="'menu'; let component" [component]="component">
        </app-menu>
      </ng-template>
    </br-page>
  `,
})
export class AppComponent {}
```

In a brXM component, it is also possible to point where the component's children are going to be placed.

```typescript
@Component({
  selector: "app-footer",
  template: `
    <div>
      @copy; Bloomreach
      <ng-container brComponent></ng-container>
    </div>
  `,
})
export class FooterComponent {}
```

The component data in case of inline mapping can be accessed via the template context.

```typescript
@Component({
  selector: "app-root",
  template: `
    <br-page>
      <ng-template>
        <ul *brComponent="'menu'; let component; let page = page">
          <li><a [href]="page.getUrl('/')">Home</a></li>
          <li *ngFor="let item of component.getModels()">...</li>
        </ul>
      </ng-template>
    </br-page>
  `,
})
export class AppComponent {}
```

### Buttons

It is recommended to add the css style `position: relative` to the Buttons
so they will position correctly within their parent container component.

Manage menu button can be placed inside a menu component using
`brManageMenuButton` directive.

```typescript
import { Component, Input } from "@angular/core";
import {
  Component as BrComponent,
  Menu,
  Page,
  Reference,
} from "@bloomreach/spa-sdk";

interface MenuModels {
  menu: Reference;
}

@Component({
  selector: "app-menu",
  template: `
    <ul [ngClass]="{ 'has-edit-button': page.isPreview() }">
      <!-- ... -->

      <ng-container [brManageMenuButton]="menu"></ng-container>
    </ul>
  `,
})
export class MenuComponent {
  @Input() component!: BrComponent;
  @Input() page!: Page;

  get menu() {
    const { menu } = this.component.getModels<MenuModels>();

    return menu && this.page.getContent<Menu>(menu);
  }
}
```

Manage content button can be placed inside a component using
`brManageContentButton` directive with non-empty input.

```typescript
import { Component, Input } from "@angular/core";
import {
  Component as BrComponent,
  Document,
  Page,
  Reference,
} from "@bloomreach/spa-sdk";

interface BannerModels {
  document: Reference;
}

@Component({
  selector: "app-banner",
  template: `
    <div [ngClass]="{ 'has-edit-button': page.isPreview() }">
      <!-- ... -->

      <ng-container
        [brManageContentButton]="document"
        documentTemplateQuery="new-banner-document"
        folderTemplateQuery="new-banner-folder"
        parameter="document"
        root="banners"
        [relative]="true"
      >
      </ng-container>
    </div>
  `,
})
export class BannerComponent {
  @Input() component!: BrComponent;
  @Input() page!: Page;

  get document() {
    const { document } = this.component.getModels<BannerModels>();

    return document && this.page.getContent<Document>(document);
  }
}
```

Add new content button can be placed inside a component using
`brManageContentButton` directive but without passing a content entity.

```typescript
import { Component } from "@angular/core";

@Component({
  selector: "app-news",
  template: `
    <div [ngClass]="{ 'has-edit-button': page.isPreview() }">
      <!-- ... -->

      <ng-container
        [brManageContentButton]
        documentTemplateQuery="new-news-document"
        folderTemplateQuery="new-news-folder"
        root="news"
      >
      </ng-container>
    </div>
  `,
})
export class NewsComponent {
  @Input() component!: BrComponent;
  @Input() page!: Page;

  // ...
}
```

### State Transfering

The `br-page` component supports
[TransferState](https://angular.io/api/platform-browser/TransferState) without
any extra configuration. To use it in [Angular Universal](https://angular.io/guide/universal) applications,
import [ServerTransferStateModule](https://angular.io/api/platform-server/ServerTransferStateModule)
on the server and [BrowserTransferStateModule](BrowserTransferStateModule) on
the client. If you would like to disable the feature, just pass `false` into
the `stateKey` input.

```html
<br-page [stateKey]="false"></br-page>
```

### Http error handling

The event handler is triggered when an HTTP error occurs from fetching PMA.

```typescript
import { Component } from "@angular/core";
import { BrPageComponent } from "@bloomreach/ng-sdk";

@Component({
  selector: "app-root",
  template: `
    <br-page [configuration]="configuration" (httpError)="onHttpError($event)">
      ...
    </br-page>
  `,
})
export class AppComponent {
  onHttpError(error: HttpErrorResponse): void {
    // http error handler
  }

  // ...
}
```

## License

Published under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license.

## Reference

The Angular SDK is using [Bloomreach SPA SDK](https://www.npmjs.com/package/@bloomreach/spa-sdk#reference) to interact
with the brXM.

### br-page

This is the entry point to the page model. This component requests and
initializes the page model, and then renders the page root component
recursively.

| Type   | Property        | Required | Description                                                                                                                                                                                                |
| ------ | --------------- | :------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| input  | `configuration` |  _yes_   | The [configuration](#configuration) of the SPA SDK.                                                                                                                                                        |
| input  | `mapping`       |  _yes_   | The brXM and Angular components [mapping](#mapping).                                                                                                                                                       |
| input  | `page`          |   _no_   | Preinitialized page instance or prefetched page model. Mostly that should be used to transfer state from the server-side to the client-side.                                                               |
| input  | `stateKey`      |   _no_   | The TransferState key is used to transfer the state from the server-side to the client-side. By default, it equals to `brPage`. If `false` is passed then the state transferring feature will be disabled. |
| output | `state`         |   _no_   | The current state of the page component.                                                                                                                                                                   |
| output | `httpError`     |   _no_   | The event handler that processes HTTP error events from fetching PMA.                                                                                                                                      |

This component also supports a template transclusion. `<ng-template>` from the
component contents will be rendered in the root component context.

| Variable      | Description                |
| ------------- | -------------------------- |
| _`$implicit`_ | The root component.        |
| `component`   | The root component.        |
| `page`        | The current page instance. |

### brComponent

This directive points to where children or some component should be placed.
`brComponent` can be used inside `br-page` or mapped components only. If it is
being used as a [structural directive](https://angular.io/guide/structural-directives),
then the template will be rendered in the context of every matched component.
Otherwise, it will try to render all children components recursively.

| Property      | Required | Description                                                                                                                                                                                                                     |
| ------------- | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brComponent` |   _no_   | The component instance or a path to a component. The path is defined as a slash-separated components name chain relative to the current component (e.g. `main/container`). If it is omitted, all the children will be rendered. |

The template context holds references to the current component and the current
page instance.

| Variable      | Description                |
| ------------- | -------------------------- |
| _`$implicit`_ | The current component.     |
| `component`   | The current component.     |
| `page`        | The current page instance. |

### brManageContentButton

This directive places a button on the page that opens the linked content in the
document editor or opens a document editor to create a new one. The button will
only be shown in preview mode.

| Property                    | Required | Description                                                                                     |
| --------------------------- | :------: | ----------------------------------------------------------------------------------------------- |
| `brManageContentButton`     |   _no_   | The content entity to open for editing.                                                         |
| `documentTemplateQuery`     |   _no_   | Template query to use for creating new documents.                                               |
| `folderTemplateQuery`       |   _no_   | Template query to use in case folders specified by `path` do not yet exist and must be created. |
| `path`                      |   _no_   | Initial location of a new document, relative to the `root`.                                     |
| `parameter`                 |   _no_   | Name of the component parameter in which the document path is stored.                           |
| `pickerConfiguration`       |   _no_   | The root path of the CMS configuration to use for the picker, relative to `/hippo:configuration/hippo:frontend/cms`. |
| `pickerInitialPath`         |   _no_   | The initial path to use in the picker if nothing has been selected yet, relative to the pickerRootPath. |
| `pickerRemembersLastVisited`|   _no_   | Whether the picker remembers the last visited path.                                             |
| `pickerRootPath`            |   _no_   | The absolute root path to use in the picker, or an empty string if the channel content path is used. |
| `pickerSelectableNodeTypes` |   _no_   | Types of nodes to be able to select in the picker, separated by a comma.                        |
| `relative`                  |   _no_   | Flag indicating that the picked value should be stored as a relative path.                      |
| `root`                      |   _no_   | Path to the root folder of selectable document locations.                                       |

### brManageMenuButton

This directive places a button on the page that opens the linked menu in the
menu editor. The button will only be shown in preview mode.

| Property                | Required | Description             |
| ----------------------- | :------: | ----------------------- |
| `brManageContentButton` |  _yes_   | The related menu model. |
