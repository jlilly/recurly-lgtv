import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CardElement, Recurly } from '@recurly/recurly-js';
import { RecurlyApiKey } from './recurly-config';

declare const recurly: Recurly;
declare const webOS: any;

@Component({
  selector: 'app-root',
  template: `
<h1>Recurly LGTV Bug</h1>
<form id="my-form">
  <input type="text" data-recurly="first_name" disabled placeholder="First Name">
  <input type="text" data-recurly="last_name" disabled placeholder="Last Name">

  <button disabled class="submit">submit</button>
  <div id="recurly-elements">
    <!-- Recurly Elements will be attached here -->
  </div>

  <!-- Recurly.js will update this field automatically -->
  <input type="hidden" name="recurly-token" data-recurly="token">

</form>
<div class="buttons">
  <button #refocusBtn (click)="refocus()" (keydown)="onKeydown({ event: $event, source: 'refocus' })">refocus form</button>
  <button #reloadBtn (click)="reload()" (keydown)="onKeydown({ event: $event, source: 'reload' })">reload page</button>
</div>
<h3>Steps to Reproduce</h3>
<ol>
  <li>Type '4111 1111 1111 1111' into card number field
  <li>Delete last character
  <li>Try to type any other number into the card number field
</ol>
<div class="device-info">
  <div>Model: {{modelName}}</div>
  <div>OS Version: {{osVersion}}</div>
  <div>SDK Version: {{sdkVersion}}</div>
  <div>User Agent: {{ userAgent }}</div>
</div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  @ViewChild('refocusBtn') refocusButton?: ElementRef;
  @ViewChild('reloadBtn') reloadButton?: ElementRef;
  cardElement: CardElement = recurly.Elements().CardElement({
    style: {
      fontSize: '30px'
    }
  });
  userAgent = navigator.userAgent;
  modelName = '';
  osVersion = '';
  sdkVersion = ''

  ngOnInit() {
    recurly.configure(RecurlyApiKey);
    webOS.deviceInfo(({ modelName, version, sdkVersion }: any) => {
      this.modelName = modelName;
      this.osVersion = version;
      this.sdkVersion = sdkVersion;
    });
  }

  ngAfterViewInit() {
    this.cardElement.attach('#recurly-elements');
    this.cardElement.on('submit', this.onSubmit.bind(this));
    recurly.on('field:submit', this.onSubmit.bind(this));

    // Hack to focus form
    const focusHack = setInterval(() => {
      this.cardElement.focus();
    }, 100);

    this.cardElement.on('focus', () => clearInterval(focusHack));
  }

  refocus() {
    this.cardElement.focus();
  }

  reload() {
    location.reload();
  }

  onSubmit() {
    this.refocusButton?.nativeElement.focus();
  }

  // When the virtual keyboard closes, focus the refocus button
  @HostListener('document:keyboardStateChange', ['$event'])
  handleCloseKeyboard(event: any): void {
    if (!event.detail.visibility) {
      this.refocusButton?.nativeElement.focus();
    }
  }

  onKeydown({ event, source }: KeydownEvent) {
    if (event.key === 'ArrowUp')  this.cardElement.focus();
    else if (source === 'refocus' && event.key === 'ArrowRight') {
      this.reloadButton?.nativeElement.focus();
    } else if (source ==='reload' && event.key === 'ArrowLeft') {
      this.refocusButton?.nativeElement.focus();
    }
  }
}

type ButtonEventSource = 'refocus' | 'reload';
type KeydownEvent = {
  event: KeyboardEvent,
  source: ButtonEventSource
}
