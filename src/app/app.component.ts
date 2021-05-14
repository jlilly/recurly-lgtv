import { Component, OnInit } from '@angular/core';
import { Recurly } from '@recurly/recurly-js';
import { RecurlyApiKey } from './recurly-config';

declare const recurly: Recurly;

@Component({
  selector: 'app-root',
  template: `
<form id="my-form">
  <input type="text" data-recurly="first_name">
  <input type="text" data-recurly="last_name">

  <div id="recurly-elements">
    <!-- Recurly Elements will be attached here -->
  </div>

  <!-- Recurly.js will update this field automatically -->
  <input type="hidden" name="recurly-token" data-recurly="token">

  <button>submit</button>
</form>
  `,
  styles: []
})
export class AppComponent implements OnInit{
  ngOnInit() {
    recurly.configure(RecurlyApiKey);
  }

  ngAfterViewInit() {
    const elements = recurly.Elements();
    const cardElement = elements.CardElement();
    cardElement.attach('#recurly-elements');

    setTimeout(() => cardElement.focus(), 1000);
  }

}
