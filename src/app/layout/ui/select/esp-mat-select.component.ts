import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { NameValue } from 'src/app/shared/models/name-value.model';

@Component({
  selector: "esp-mat-select",
  templateUrl: './esp-mat-select.component.html',
  styleUrls: ['./esp-mat-select.component.scss'],
})
export class EspMatSelectComponent implements OnInit {
  @Input() espFormControl: FormControl;
  @Input() options: NameValue[];
  @Input() placeholder: string;
  @Input() allowMultiSelect: boolean = false;
  @Input() appearance = 'standard';
  @Input() triggerTextInBoxes = false;
  @Input() optionInTwoLines = false;
  triggerText = '';
  disableSelectAll = false;
  isRequired = false;
  public selectNamesList: string[] = [];
  constructor() {}

  ngOnInit(): void {
    this.isRequired = this.checkControlIsRequired(this.espFormControl);
    if (this.allowMultiSelect) {
      this.updateTriggerText();
      this.toggleItem();
      this.checkForAllOptionDisable();
    }else if (!this.allowMultiSelect && this.optionInTwoLines){
      this.updateTriggerTextForSingleSelection();
    }
  }

  private checkControlIsRequired(control: AbstractControl): boolean{
    if (!control) {
      return false;
    }
    if (control.validator) {
      const validator = control.validator({} as AbstractControl);
      if (validator && validator.required) {
        return true;
      }
    }
    return false;
  }

  private checkForAllOptionDisable(): void{
    if (this.options.every((op) => op.disabled)) {
      this.disableSelectAll = true;
    }
  }

  toggleAllSelection(): void{
    const valueArray = this.espFormControl.value;
    let values: any[] = [];
    if (valueArray.includes(-1)) {
      values = this.options.map((op) => op.value);
      values.push(-1);
      this.espFormControl.setValue(values);
    } else {
      this.espFormControl.setValue('');
      this.espFormControl.setValue(
        this.options.filter((op) => op.disabled).map((op: any) => op.value)
      );
    }
    this.updateTriggerText();
  }

  toggleItem(): void{
    const valueArray = this.espFormControl.value;
    if(valueArray !== 'undefined' && valueArray !== ''){
      if (valueArray.filter((va: any) => va !== -1).length === this.options.length) {
        if (!valueArray.find((va: any) => va === -1)) {
          valueArray.push(-1);
          this.espFormControl.setValue(valueArray);
        }
      } else {
        this.espFormControl.setValue(valueArray.filter((va: any) => va !== -1));
      }
    }
    this.updateTriggerText();
  }
  updateTriggerText(): void{
    this.triggerText = '';
    this.selectNamesList = [];
    if (this.espFormControl.value) {
      const values = this.espFormControl.value.filter((v: any) => v !== -1);
      if (!this.triggerTextInBoxes) {
        this.triggerText = this.options
          .filter((op) => values.includes(op.value))
          .map((opt) => opt.name)
          .join(', ');
      } else {
        this.selectNamesList = this.options
          .filter((op) => values.includes(op.value))
          .map((opt) => opt.name);
      }
    }
  }

  updateTriggerTextForSingleSelection(): void{
    if(this.optionInTwoLines){
      if (this.espFormControl.value) {
        this.triggerText = this.options
          .filter((op) => op.value === this.espFormControl.value)
          .map((opt) => opt.name)
          .join(', ');
      }
    }
  }
}
