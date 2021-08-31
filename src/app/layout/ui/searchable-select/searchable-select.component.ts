import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface NameValue {
  id: number | string;
  name: string;
  description?: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'app-searchable-select',
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.scss']
})
export class SearchableSelectComponent implements OnInit, OnChanges  {
  @Input() selected: NameValue[] = [];
  @Input() options: NameValue[] = [];
  @Input() placeholder = 'Select';
  @Input() multi = true;
  @Input() class = '';
  @Input() disabled = false;
  @Output() update = new EventEmitter<any>();

  control: FormControl = new FormControl();
  search = new FormControl('');
  filteredOptions: ReplaySubject<NameValue[]> = new ReplaySubject<NameValue[]>();
  protected onDestroyed = new Subject<void>();

  constructor() {
  }

  ngOnInit(): void {
    if (this.selected){
      this.control.setValue(this.selected.map((s: any) => s.id ? s.id : s));
    }
    this.filteredOptions.next(this.options.slice());

    this.search.valueChanges
      .pipe(takeUntil(this.onDestroyed))
      .subscribe(() => {
        this.filtered();
      });
  }
  ngOnChanges(): void {
    if (this.selected){
      this.control.setValue(this.selected.map((s: any) => s.id ? s.id : s));
    }
  }
  onDestroy(): void{
    this.onDestroyed.next();
    this.onDestroyed.complete();
  }
  onSelected(event: any): void{
    let values = [];
    if(this.multi){
      event.value.map((selected: any) => {
        const found = this.options.find((o: any) => o.id === selected);
        if (found){
          values.push(found);
        }
      });
    }
    else{
      values = [event.value]
    }
    console.log(event, values, this.multi);
    this.update.emit(values);
  }
  protected filtered(): void{
    if (!this.options) {
      return;
    }
    // get the search keyword
    let keyword = this.search.value;
    if (!keyword) {
      this.filteredOptions.next(this.options.slice());
      return;
    } else {
      keyword = keyword.toLowerCase();
    }
    // filter the banks
    this.filteredOptions.next(
      this.options.filter((bank: any) => bank.name.toLowerCase().indexOf(keyword) > -1)
    );
  }

}
