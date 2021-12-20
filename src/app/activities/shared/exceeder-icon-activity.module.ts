import {NgModule} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@NgModule({
  imports: [
    MatIconModule,
  ],
  exports: [],
  providers: []
})
export class ExceederIconModule {
  private svgPath = '/assets/images/icons';

  constructor(private domSanitizer: DomSanitizer, public matIconRegistry: MatIconRegistry) {
    this.matIconRegistry.addSvgIcon('xcdrs-delete-outline', this.setPath(`${this.svgPath}/delete-outline.svg`))
      .addSvgIcon('xcdrs-edit', this.setPath(`${this.svgPath}/edit.svg`))
      .addSvgIcon('xcdrs-hide-eye', this.setPath(`${this.svgPath}/hide-eye.svg`))
      .addSvgIcon('xcdrs-drag', this.setPath(`${this.svgPath}/icon-action-drag.svg`))
      .addSvgIcon('xcdrs-round-add-green', this.setPath(`${this.svgPath}/icon-round-add-green.svg`))
      .addSvgIcon('xcdrs-round-add', this.setPath(`${this.svgPath}/icon-round-add.svg`))
      .addSvgIcon('xcdrs-close', this.setPath(`${this.svgPath}/close.svg`))
      .addSvgIcon('xcdrs-link', this.setPath(`${this.svgPath}/link.svg`))
      .addSvgIcon('xcdrs-lock', this.setPath(`${this.svgPath}/lock.svg`))
      .addSvgIcon('xcdrs-unlock', this.setPath(`${this.svgPath}/unlocked.svg`))
      .addSvgIcon('xcdrs-info', this.setPath(`${this.svgPath}/info.svg`))
      .addSvgIcon('xcdrs-camera-photo', this.setPath(`${this.svgPath}/icon-camera-photo-filled.svg`))
      .addSvgIcon('xcdrs-camera-photo-white', this.setPath(`${this.svgPath}/icon-camera-photo-white.svg`))
      .addSvgIcon('xcdrs-video', this.setPath(`${this.svgPath}/icon-empty-state-video.svg`))
  }

  private setPath(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
