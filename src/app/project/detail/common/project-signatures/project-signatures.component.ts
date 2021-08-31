import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-project-signatures',
  templateUrl: './project-signatures.component.html',
  styleUrls: ['./project-signatures.component.scss']
})
export class ProjectSignaturesComponent implements OnInit {
  @Input() entityid: any;
  @Input() entity: any;
  @Output() update = new EventEmitter<any>();

  loading= true;
  signatureList: Array<any> = [];

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.getSignatureList();
  }
  getSignatureList(): void{
    this.loading = true;
    // tslint:disable-next-line: max-line-length
    this.http.post(environment.baseURL + '/api/Project/GetAllSignatures', {
      module: 'project',
      entityId: this.entityid
    }).subscribe((results: any) => {
      this.signatureList = results.result.map((sign: any) => {
        return sign;
      });
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }
}
