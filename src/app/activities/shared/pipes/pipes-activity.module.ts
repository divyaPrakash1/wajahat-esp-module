import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TextHighlightPipe } from "./text-highlight-activity.pipe";
import { TextSortPipe } from "./text-sort-activity.pipe";
import { ReadMoreLinkPipe } from "./read-more-link-activity.pipe";
import { ShrinkMessagePipe } from "./shrink-message-activity.pipe";
import { NgxLinkifyjsModule, NgxLinkifyjsPipe } from "ngx-linkifyjs";
import { TimeAgoExtendsPipe } from "./time-ago-activity.pipe";
import { TextTruncatePipe } from "./text-truncate-activity.pipe";
import { FileSizePipe } from "./file-size-activity.pipe";
import { SanitizeHtmlPipe } from "./sanitize-html-activity.pipe";
import { UrlifyPipe } from "./urlify-activity.pipe";
import { MarkdownToHtmlPipe } from "./markdown-to-html-activity.pipe";
import { ParseListsPipe } from "./parse-lists-activity.pipe";
import { InitialsPipe } from "./initials-activity.pipe";
import { linkedInUrlPipe } from "./linkedIn-url-activity.pipe";
import { CutExtensionPipe } from "./cut-extension-activity.pipe";
import { FileExtensionPipe } from "./file-extension-activity.pipe";
import { ArabicNumberPipe } from "./number-activity.pipe";
import { ArabicDatePipe } from "./date-activity.pipe";

@NgModule({
  declarations: [
    TextHighlightPipe,
    TextSortPipe,
    ReadMoreLinkPipe,
    ShrinkMessagePipe,
    TimeAgoExtendsPipe,
    TextTruncatePipe,
    FileSizePipe,
    SanitizeHtmlPipe,
    UrlifyPipe,
    MarkdownToHtmlPipe,
    ParseListsPipe,
    InitialsPipe,
    linkedInUrlPipe,
    CutExtensionPipe,
    FileExtensionPipe,
    ArabicNumberPipe,
    ArabicDatePipe
  ],
  imports: [CommonModule, NgxLinkifyjsModule.forRoot()],
  exports: [
    TextHighlightPipe,
    TextSortPipe,
    ReadMoreLinkPipe,
    ShrinkMessagePipe,
    NgxLinkifyjsPipe,
    TimeAgoExtendsPipe,
    TextTruncatePipe,
    FileSizePipe,
    SanitizeHtmlPipe,
    UrlifyPipe,
    MarkdownToHtmlPipe,
    ParseListsPipe,
    InitialsPipe,
    linkedInUrlPipe,
    CutExtensionPipe,
    FileExtensionPipe,
    ArabicNumberPipe,
    ArabicDatePipe
  ]
})
export class PipesModule {}
