import {
  Component,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
  Input,
} from "@angular/core";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "xcdrs-search-field",
  templateUrl: "./search-field-activity.component.html",
  styleUrls: ["./search-field-activity.component.scss"],
})
export class ActivitySearchFieldComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<string>();
  hasValue = false;
  searchText : string = '';
  private inputChangeSubject = new Subject<string>();
  @Input('input') set searchInput(value: string) {
    this.searchText = value;
    //this._searchInput = value;
    //this.keyword.setValue(this._searchInput, { emitEvent: false }xcdrs-search-field)
  }
  constructor() {}

  @HostBinding("class.empty")
  private get isEmpty() {
    return !this.hasValue;
  }

  ngOnInit(): void {
    this.inputChangeSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.search.emit(searchTerm.toLowerCase());
      });
  }

  onInputChange(searchTerm: string) {
    this.hasValue = !!searchTerm;
    this.inputChangeSubject.next(searchTerm);
  }

  ngOnDestroy(): void {
    this.inputChangeSubject.unsubscribe();
  }
}
