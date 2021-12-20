import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { ActivitiesService } from "../../services/activities.service";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { OppProActivity } from "../../models/OppProActivity";
import { delay, map, startWith } from "rxjs/operators";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import * as moment from "moment";
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";

@Component({
  selector: "xcdrs-opp-pro-dialog",
  templateUrl: "./opp-pro-dialog.html",
  styleUrls: ["./opp-pro-dialog.scss"],
})
export class OppProDialog implements OnInit {
  size: string;
  form: FormGroup;
  isLoading: boolean = false;
  dataLoaded: boolean = false;
  formMode: string = "new";
  formType: string = "call";
  activity: any;

  types: { id: number; name: string; active: boolean }[] = [
    {
      id: 0,
      name: "Opportunity",
      active: true,
    },
    {
      id: 1,
      name: "Customer",
      active: false,
    },
  ];
  oppotunities: { id: number; name: string }[] = [];
  selectedOpportunity: number = null;
  customers: { id: number; name: string }[] = [];
  selectedCustomer: number = null;
  callToActions: { id: number; name: string }[] = [];
  selectedCallToAction: number = null;
  callToUsers: {
    id: number;
    name: string;
    emails?: string[];
    type?: string;
    selected?: boolean;
  }[] = [];
  selectedCallToUser: number = null;
  selectedCallToUserEmails: string[] = [];
  callFromUsers: { id: number; name: string }[] = [];
  selectedCallFromUser: string = '';
  selectedCallFromUserEmail: string = '';
  salesJobs: { id: number; name: string }[] = [];
  callDirections: { id: number; name: string }[] = [
    { id: 0, name: "Incoming" },
    { id: 1, name: "Outgoing" },
  ];

  arabicCallDirections: { id: number; name: string }[] = [
    { id: 0, name: "واردة" },
    { id: 1, name: "صادرة" },
  ];
  selectedDirection: number = 1;
  priorities: { id: number; name: string }[] = [
    { id: 0, name: "Low" },
    { id: 1, name: "Normal" },
    { id: 2, name: "High" },
  ];
  arabicPriorities: { id: number; name: string }[] = [
    { id: 0, name: "قليل" },
    { id: 1, name: "عادي" },
    { id: 2, name: "عالي" },
  ];
  selectedPriority: number = 1;
  isOpportunity: boolean = true;
  territoryFilter: number[] = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18];

  meetingChannels: { id: number; name: string }[] = [
    { id: 1, name: "Onsite" },
    { id: 2, name: "Online" }, 
  ];

  arabicMeetingChannels: { id: number; name: string }[] = [
    { id: 1, name: "بالموقع" },
    { id: 2, name: "عبر الإنترنت" },
  ];

  selectedChannel: number = 1;

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  participantsControl = new FormControl([]);

  filteredParticipants: { id: number; name: string }[];
  participants: {
    id: number;
    name: string;
    emails?: string[];
    type?: string;
    selected?: boolean;
  }[] = [];
  
  partnerAttendees: { id: number; name: string }[] = [];
  participantSearch: string = '';
  emailListOfCustomerAttendees: string[] = [];
  emailListOfPartners: string[] = [];
  hr: number;
  min: number;
  sec: number;
  effort: any;
  isArabic: boolean = false;
  @ViewChild("participantsInput") participantsInput: ElementRef;
  @ViewChild("auto") matAutocomplete: MatAutocomplete;

  constructor(
    private _fb: FormBuilder,
    private _resizeService: ActivityResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<OppProDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      formType: string;
      formMode: string;
      activityId?: any;
      oppProData: any;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.getLanguage();
    this.formMode = this.data.formMode;
    this.formType = this.data.formType;
    if (this.formMode == "edit" ) {
      this.getOppProDetails(this.data.activityId);
    }else{
      this.initFormGroup();
      this.onChanges();
      this.dataLoaded = true;
      this.isLoading = false;
    }
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }


  getOppProDetails(activityId: string) {
    this._activitiesService
      .getOppProActivityDetails(activityId, this.data.oppProData)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001") {
            this.activity = {
              activityId: resp.result.activityId,
              id: resp.result.activityId,
              appType: 2,
              activityType: resp.result.activityType,
              oppProActivityType:resp.result.activityType,
              actualClosingDate: resp.result.actualClosingDate,
              actualDurationMinutes: resp.result.actualDurationMinutes,
              actualDurationMinutesFormatted:
                resp.result.actualDurationMinutesFormatted,

              effortSum: parseInt(resp.result.durationMinutes),
              effortInHour: Math.floor(
                moment
                  .duration(parseInt(resp.result.durationMinutes), "minutes")
                  .asHours()
              ),
              effortInMinute: Math.floor(
                moment
                  .duration(
                    moment
                      .duration(
                        parseInt(resp.result.durationMinutes),
                        "minutes"
                      )
                      .asHours() -
                      Math.floor(
                        moment
                          .duration(
                            parseInt(resp.result.durationMinutes),
                            "minutes"
                          )
                          .asHours()
                      ),
                    "hours"
                  )
                  .asMinutes()
              ),
              amISubscriber: resp.result.amISubscriber,
              associatedEntityId: resp.result.associatedEntityId,
              associatedEntityName: resp.result.associatedEntityName,
              associatedEntityTitle: resp.result.associatedEntityTitle,
              attachments: resp.result.attachments,
              callDirection: resp.result.callDirection,
              channel: resp.result.callDirection == 1 ? "Onsite" : "Online",
              callFromId: resp.result.callFromId,
              callFromName: resp.result.callFromName,
              callToActionId: resp.result.callToActionId,
              callToActionTitle: resp.result.callToActionTitle,
              callToId: resp.result.callToId,
              callToName:
                resp.result.activityType == "meeting"
                  ? this.getNames(JSON.parse(resp.result.callToName.toString()))
                  : resp.result.callToName,
              callToNameObj:
                resp.result.activityType == "meeting"
                  ? JSON.parse(resp.result.callToName.toString())
                  : resp.result.callToName,
              completedOnDate: resp.result.completedOnDate,
              createdById: resp.result.createdById,
              createdByName: resp.result.createdByName,
              createdDate: resp.result.createdDate,
              description: resp.result.description,
              note: resp.result.description,
              durationMinutes: resp.result.durationMinutes,
              durationMinutesFormatted: resp.result.durationMinutesFormatted,
              hasAttachment: resp.result.hasAttachment,
              isCancelled: resp.result.isCancelled,
              isCompleted: resp.result.isCompleted,

              progressStatus: resp.result.isCancelled
                ? "Cancelled"
                : resp.result.isCompleted
                ? "Done"
                : "Planned",
              progressStatusColor: resp.result.isCancelled
                ? "#EB487F"
                : resp.result.isCompleted
                ? "#33BA70"
                : "#00a3ff",
              meetingIsAllDayEvent: resp.result.meetingIsAllDayEvent,
              organizationId: resp.result.organizationId,
              organizationName: resp.result.organizationName,
              ownerName: resp.result.ownerName,
              priorityCode: resp.result.priorityCode,
              reminderAddedDate: resp.result.reminderAddedDate,
              reminderSelectedDate: resp.result.reminderSelectedDate,
              reminderSelectedOption: resp.result.reminderSelectedOption,
              scheduleEnd: resp.result.scheduleEnd,
              date:
                resp.result.scheduleEnd != null
                  ? moment(new Date(resp.result.scheduleEnd)).format(
                      "DD MMM YYYY"
                    )
                  : null,

              startTime:
                resp.result.scheduleEnd != null
                  ? moment(
                      new Date(
                        new Date(resp.result.scheduleEnd).getTime() -
                          Math.abs(
                            parseInt(resp.result.durationMinutes) * 60000
                          )
                      )
                    )
                      .local()
                      .format("hh:mm A")
                  : null,
              endTime:
                resp.result.scheduleEnd != null
                  ? moment(
                      new Date(new Date(resp.result.scheduleEnd).getTime())
                    )
                      .local()
                      .format("hh:mm A")
                  : null,

              scheduleStart: resp.result.scheduleStart,
              subject: resp.result.subject,
              updatedById: resp.result.updatedById,
              updatedByName: resp.result.updatedByName,
              canEdit: true,
            };

            this.selectedCallFromUser = this.activity.callFromId;
            this.selectedCallToUser = this.activity.callToId;
            this.selectedCallToAction = this.activity.callToActionId;
            if (this.activity.associatedEntityName == "opportunity") {
              this.selectedOpportunity = this.activity.associatedEntityId;
              this.isOpportunity = true;
            } else {
              this.selectedCustomer = this.activity.associatedEntityId;
              this.isOpportunity = false;
            }

            this.effort = {
              effortSum: this.activity.effortSum,
              effortInMinute: this.activity.effortInMinute,
              effortInHour: this.activity.effortInHour,
            };
            this.initFormGroup();
            this.onChanges();
            
    this.dataLoaded = true;
    this.isLoading = false;
          } 
        }
      });
  }

  getNames(callTo) {
    let names = [];

    for (var i = 0; i < callTo.customerAttendeesList.length; i++) {
      names.push(callTo.customerAttendeesList[i].name);
    }

    for (var i = 0; i < callTo.partnerAttendeesList.length; i++) {
      names.push(callTo.partnerAttendeesList[i].name);
    }
    return names.join(", ");
  }

  initFormGroup() {
    if (this.formMode == "new") {
      this.selectedCallFromUser = this.data.oppProData.user.applicationUserId;
      this.selectedCallFromUserEmail = this.data.oppProData.user.email;
    } 
    // else {
    //   if (!!this.data.activity) {
    //     this.activity = this.data.activity;
    //     this.selectedCallFromUser = this.activity.callFromId;
    //     this.selectedCallToUser = this.activity.callToId;
    //     this.selectedCallToAction = this.activity.callToActionId;
    //     if (this.activity.associatedEntityName == "opportunity") {
    //       this.selectedOpportunity = this.activity.associatedEntityId;
    //       this.isOpportunity = true;
    //     } else {
    //       this.selectedCustomer = this.activity.associatedEntityId;
    //       this.isOpportunity = false;
    //     }
    //   }
    // }
    switch (this.formType) {
      case "proposal":
        this.form = this._fb.group({
          title: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.subject
              : null,
            [Validators.required]
          ),

          notes: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.description
              : null
          ),
          opportunity: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.associatedEntityTitle
              : null
          ),
          customer: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.associatedEntityTitle
              : null
          ),
          purpose: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.callToActionTitle
              : null
          ),
          callFrom: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.callFromName
              : this.data.oppProData.user.firstName +
                " " +
                this.data.oppProData.user.lastName
          ),
          dueDate: new FormControl(
            this.formMode == "edit" &&
            !!this.activity &&
            this.activity.scheduleEnd != null
              ? new Date(this.activity.scheduleEnd)  //this.getDueDate()
              : null
          ),

          callTo: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.callToName
              : null
          ),
        });
        break;
      case "meeting":
        this.form = this._fb.group({
          title: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.subject
              : null,
            [Validators.required]
          ),

          notes: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.description
              : null
          ),
          opportunity: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.associatedEntityTitle
              : null
          ),
          customer: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.associatedEntityTitle
              : null
          ),
          priority: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.getPriority(this.activity.priorityCode)
              : !this.isArabic ? "Normal" : "طبيعي"
          ),
          channel: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.getChannel(this.activity.callDirection)
              : !this.isArabic ? "Onsite" : "بالموقع"
          ),
          purpose: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.callToActionTitle
              : null
          ),
          callFrom: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.callFromName
              : this.data.oppProData.user.firstName +
                " " +
                this.data.oppProData.user.lastName
          ),
          dueDate: new FormControl(
            this.formMode == "edit" &&
            !!this.activity &&
            this.activity.scheduleEnd != null
              ? new Date(this.activity.scheduleEnd) //this.getDueDate()
              : null
          ),
          startTime: new FormControl(
            this.formMode == "edit" &&
            !!this.activity &&
            this.activity.scheduleStart != null
              ? new Date(new Date(this.activity.scheduleStart).getTime())
              : null
          ),
          endTime: new FormControl(
            this.formMode == "edit" &&
            !!this.activity &&
            this.activity.scheduleEnd != null
              ? new Date(new Date(this.activity.scheduleEnd).getTime())
              : null
          ),
          callTo: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.getParticipants(this.activity.callToNameObj)
              : []
          ),
        });
        if (this.formMode == "edit") {
          this.selectedChannel = this.activity.callDirection;
        }
        break;
      default:
        this.form = this._fb.group({
          title: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.subject
              : null,
            [Validators.required]
          ),

          notes: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.description
              : null
          ),
          opportunity: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.associatedEntityTitle
              : null
          ),
          customer: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.associatedEntityTitle
              : null
          ),
          priority: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.getPriority(this.activity.priorityCode)
              : !this.isArabic ? "Normal" : "طبيعي"
          ),
          direction: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.getDirection(this.activity.callDirection)
              : !this.isArabic ? "Outgoing" : "بالموقع"
          ),
          purpose: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.callToActionTitle
              : null
          ),
          callFrom: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.callFromName
              : this.data.oppProData.user.firstName +
                " " +
                this.data.oppProData.user.lastName
          ),
          dueDate: new FormControl(
            this.formMode == "edit" &&
            !!this.activity &&
            this.activity.scheduleEnd != null
              ? new Date(this.activity.scheduleEnd) //this.getDueDate()
              : null
          ),
          startTime: new FormControl(
            this.formMode == "edit" &&
            !!this.activity &&
            this.activity.scheduleStart != null
              ? new Date(new Date(this.activity.scheduleStart).getTime())
              : null
          ),
          endTime: new FormControl(
            this.formMode == "edit" &&
            !!this.activity &&
            this.activity.scheduleEnd != null
              ? new Date(new Date(this.activity.scheduleEnd).getTime())
              : null
          ),
          callTo: new FormControl(
            this.formMode == "edit" && !!this.activity
              ? this.activity.callToName
              : null
          ),
        });
        if (this.formMode == "edit") {
          this.selectedDirection = this.activity.callDirection;
          this.selectedPriority = this.activity.priorityCode;
        }

        break;
    }

    if (this.formMode == "edit") {
      let entity = {
        id: this.activity.associatedEntityId,
        name: this.activity.associatedEntityName,
        customerId: this.activity.organizationId,
      };
      this.updateRelatedFields(entity, this.activity.associatedEntityName);
    }
    if (this.isOpportunity) {
      this.initFormData("opportunity");
    } else {
      this.initFormData("customer");
    }
  }

  getParticipants(callToObj) {
    let users = [];
    for (var i = 0; i < callToObj.customerAttendeesList.length; i++) {
      (callToObj.customerAttendeesList[i].type = "contact"),
        (callToObj.customerAttendeesList[i].selected = true);
      users.push(callToObj.customerAttendeesList[i]);
    }

    for (var i = 0; i < callToObj.partnerAttendeesList.length; i++) {
      (callToObj.partnerAttendeesList[i].type = "attendee"),
        (callToObj.partnerAttendeesList[i].selected = true);
      users.push(callToObj.partnerAttendeesList[i]);
    }

    this.participants = users;
    return users;
  }

  getEndTime(dt, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
  }

  getPriority(code: number) {
    for (let i = 0; i < this.priorities.length; i++) {
      if (this.priorities[i].id == code) {
        return !this.isArabic ? this.priorities[i].name : this.arabicPriorities[i].name;
      }
    }
    return null;
  }
  getDirection(code: number) {
    for (let i = 0; i < this.callDirections.length; i++) {
      if (this.callDirections[i].id == code) {
        return !this.isArabic ? this.callDirections[i].name : this.arabicCallDirections[i].name;
      }
    }
    return null;
  }

  getChannel(code: number) {
    for (let i = 0; i < this.meetingChannels.length; i++) {
      if (this.meetingChannels[i].id == code) {
        return !this.isArabic ? this.meetingChannels[i].name : this.arabicMeetingChannels[i].name;
      }
    }
    return null;
  }
  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
  }
  getScheduleEnd(dt, minutes) {
    return moment(dt).add(minutes, "minutes"); //new Date(dt.getTime() + minutes * 60000);
  }

  submit() {
    this.updateDueDateTime();
    switch (this.formType) {
      case "proposal":
        this.submitProposal();
        break;

      case "meeting":
        this.submitMeeting();
        break;
      default:
        this.submitCall();
        break;
    }
  }
  updateDueDateTime() {
    if (
      this.form.get("dueDate").value != "" &&
      this.form.get("dueDate").value != null
    ) {
      this.hr = new Date().getHours();
      this.min = new Date().getMinutes();
      this.sec = new Date().getSeconds();
      this.form.get("dueDate").value.setHours(this.hr, this.min, this.sec);
    }
  }
  submitProposal() {
    this.isLoading = true;
    var callDuration = null;

    if (this.formMode == "new") {
      let data = {
        activityType: this.formType,
        hasAttachment: false,
        subject: this.form.value.title,
        description: this.form.value.notes,
        callToActionId: this.selectedCallToAction,
        callToActionTitle: this.form.value.purpose,
        callToId: this.selectedCallToUser,
        callToName: this.form.value.callTo,
        callFromId: this.selectedCallFromUser,
        callFromName: this.form.value.callFrom,
        createdDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        ownerId: this.selectedCallFromUser,
        ownerName: this.form.value.callFrom,
        scheduleEnd:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.endTime).format("hh:mm:ss a"),
        scheduleStart:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.startTime).format("hh:mm:ss a"),
        durationMinutes: callDuration,
        associatedEntityId: this.isOpportunity
          ? this.selectedOpportunity
          : this.selectedCustomer,
        associatedEntityName: this.isOpportunity ? "opportunity" : "Account",
        isReminderUpdated: false,
        reminderSelectedOption: "never",
        reminderSelectedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        reminderAddedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        changeHistoryList: {},
        createdById: this.data.oppProData.user.applicationUserId,
        createdByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
        EmailCreatedBy: this.data.oppProData.user.email,
        EmailPreparedBy: this.selectedCallFromUserEmail,
        EmailTo: this.selectedCallToUserEmails,
        action: "SaveAsDraft",
        UpdatedById: this.data.oppProData.user.applicationUserId,
        UpdatedByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
      };
      this._activitiesService
        .createOppProProposal(data, this.data.oppProData)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.code == "001") {
              this.isLoading = false;
              this.addCallToActionToActivity(resp.result);
              this.cancel();
              this._alertService.success(!this.isArabic ? resp.message : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this.isLoading = false;
              this.cancel();
              this._alertService.error(!this.isArabic ? resp.message : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    } else {
      let data = {
        activityId: this.activity.activityId,
        activityType: this.formType,
        hasAttachment: false,
        subject: this.form.value.title,
        description: this.form.value.notes,
        callToActionId: this.selectedCallToAction,
        callToActionTitle: this.form.value.purpose,
        callToId: this.selectedCallToUser,
        callToName: this.form.value.callTo,
        callFromId: this.selectedCallFromUser,
        callFromName: this.form.value.callFrom,
        createdDate: moment
          .utc(new Date(this.activity.createdDate))
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        ownerId: this.selectedCallFromUser,
        ownerName: this.form.value.callFrom,
        scheduleEnd:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.endTime).format("hh:mm:ss a"),
        scheduleStart:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.startTime).format("hh:mm:ss a"),
        durationMinutes: callDuration,
        associatedEntityId: this.isOpportunity
          ? this.selectedOpportunity
          : this.selectedCustomer,
        associatedEntityName: this.isOpportunity ? "opportunity" : "Account",
        isReminderUpdated: false,
        reminderSelectedOption: "never",
        reminderSelectedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        reminderAddedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        changeHistoryList: {
          entityId: this.activity.activityId,
          entityName: "activity",
          stateChangedBy: this.data.oppProData.user.applicationUserId, // Id of Logged in user
          stateChangedByName:
            this.data.oppProData.user.firstName +
            " " +
            this.data.oppProData.user.lastName,
          lastUpdatedDate: moment
            .utc(new Date())
            .local()
            .format("YYYY-MM-DD hh:mm:ss a"),
          changedItems: this.getChangedItemsHistoryList(),
        },
        createdById: this.data.oppProData.user.applicationUserId,
        createdByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
        EmailCreatedBy: this.data.oppProData.user.email,
        EmailPreparedBy: this.selectedCallFromUserEmail,
        EmailTo: this.selectedCallToUserEmails,
        action: "SaveAsDraft",
        UpdatedById: this.data.oppProData.user.applicationUserId,
        UpdatedByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
      };
      this._activitiesService
        .editOppProProposal(data, this.data.oppProData)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.code == "001") {
              this.isLoading = false;
              this.updateCallToActionToActivity(resp.result);
              this.cancel();
              this._alertService.success(!this.isArabic ? resp.message : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this.isLoading = false;
              this.cancel();
              this._alertService.error(!this.isArabic ? resp.message : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    }
  }

  submitMeeting() {
    this.isLoading = true;
    var callDuration = moment
      .duration(
        moment(new Date(this.form.get("endTime").value)).diff(
          moment(new Date(this.form.get("startTime").value))
        )
      )
      .asMinutes();

    if (this.formMode == "new") {
      let data = {
        attendeesInformation: {
          customerAttendeesList: this.getusersList(
            this.form.get("callTo").value,
            "contact"
          ),
          customerId: this.isOpportunity
            ? this.selectedOpportunity
            : this.selectedCustomer,
          customerName: this.isOpportunity
            ? this.form.get("opportunity").value
            : this.form.get("customer").value,
          emailCreatedBy: this.data.oppProData.user.email,
          emailListOfCustomerAttendees: this.getEmailsList(
            this.form.get("callTo").value,
            "contact"
          ),

          partnerAttendeesList: this.getusersList(
            this.form.get("callTo").value,
            "attendee"
          ),
          emailListOfPartners: this.getEmailsList(
            this.form.get("callTo").value,
            "attendee"
          ),
          emailSignature: "",
        },
        action: "SaveAsDraft",
        activityType: this.formType,
        hasAttachment: false,
        subject: this.form.value.title,
        description: this.form.value.notes,
        // callToId: this.selectedCallToUser,
        // callToName: this.form.value.callTo,
        callToActionId: this.selectedCallToAction,
        callToActionTitle: this.form.value.purpose,
        callFromId: this.selectedCallFromUser,
        callFromName: this.form.value.callFrom,
        createdDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        ownerId: this.selectedCallFromUser,
        ownerName: this.form.value.callFrom,
        scheduleEnd:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.endTime).format("hh:mm:ss a"),
        scheduleStart:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.startTime).format("hh:mm:ss a"),
        durationMinutes: callDuration,
        callDirection: this.selectedChannel,
        associatedEntityId: this.isOpportunity
          ? this.selectedOpportunity
          : this.selectedCustomer,
        associatedEntityName: this.isOpportunity ? "opportunity" : "Account",
        isReminderUpdated: false,
        reminderSelectedOption: "never",
        reminderSelectedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        reminderAddedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        changeHistoryList: {},
        createdById: this.data.oppProData.user.applicationUserId,
        createdByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
        meetingIsAllDayEvent: true,
      };
      this._activitiesService
        .createOppProMeeting(data, this.data.oppProData)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.code == "001") {
              this.isLoading = false;
              this.addCallToActionToActivity(resp.result);
              this.cancel();
              this._alertService.success(!this.isArabic ? resp.message : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this.isLoading = false;
              this.cancel();
              this._alertService.error(!this.isArabic ? resp.message : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    } else {
      let data = {
        attendeesInformation: {
          customerAttendeesList: this.getusersList(
            this.form.get("callTo").value,
            "contact"
          ),
          customerId: this.isOpportunity
            ? this.selectedOpportunity
            : this.selectedCustomer,
          customerName: this.isOpportunity
            ? this.form.get("opportunity").value
            : this.form.get("customer").value,
          emailCreatedBy: this.data.oppProData.user.email,
          emailListOfCustomerAttendees: this.getEmailsList(
            this.form.get("callTo").value,
            "contact"
          ),

          action: "SaveAsDraft",
          partnerAttendeesList: this.getusersList(
            this.form.get("callTo").value,
            "attendee"
          ),
          emailListOfPartners: this.getEmailsList(
            this.form.get("callTo").value,
            "attendee"
          ),
          emailSignature: "",
        },
        activityId: this.activity.activityId,
        activityType: this.formType,
        hasAttachment: false,
        subject: this.form.value.title,
        description: this.form.value.notes,
        // callToId: this.selectedCallToUser,
        // callToName: this.form.value.callTo,
        callToActionId: this.selectedCallToAction,
        callToActionTitle: this.form.value.purpose,
        callFromId: this.selectedCallFromUser,
        callFromName: this.form.value.callFrom,
        createdDate: moment
          .utc(new Date(this.activity.createdDate))

          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        ownerId: this.selectedCallFromUser,
        ownerName: this.form.value.callFrom,
        scheduleEnd:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.endTime).format("hh:mm:ss a"),
        scheduleStart:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.startTime).format("hh:mm:ss a"),
        durationMinutes: callDuration,
        callDirection: this.selectedChannel,
        associatedEntityId: this.isOpportunity
          ? this.selectedOpportunity
          : this.selectedCustomer,
        associatedEntityName: this.isOpportunity ? "opportunity" : "Account",
        isReminderUpdated: false,
        reminderSelectedOption: "never",
        reminderSelectedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        reminderAddedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        changeHistoryList: {
          entityId: this.activity.activityId,
          entityName: "activity",
          stateChangedBy: this.data.oppProData.user.applicationUserId, // Id of Logged in user
          stateChangedByName:
            this.data.oppProData.user.firstName +
            " " +
            this.data.oppProData.user.lastName,
          lastUpdatedDate: moment
            .utc(new Date())
            .local()
            .format("YYYY-MM-DD hh:mm:ss a"),
          changedItems: this.getChangedItemsHistoryList(),
        },
        createdById: this.data.oppProData.user.applicationUserId,
        createdByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
        UpdatedById: this.data.oppProData.user.applicationUserId,
        UpdatedByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
        meetingIsAllDayEvent: true,
      };
      this._activitiesService
        .editOppProMeeting(data, this.data.oppProData)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.code == "001") {
              this.isLoading = false;
              this.updateCallToActionToActivity(resp.result);
              this.cancel();
              this._alertService.success(!this.isArabic ? resp.message : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this.isLoading = false;
              this.cancel();
              this._alertService.error(!this.isArabic ? resp.message : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    }
  }

  submitCall() {
    this.isLoading = true;
    var callDuration = moment
      .duration(
        moment(new Date(this.form.get("endTime").value)).diff(
          moment(new Date(this.form.get("startTime").value))
        )
      )
      .asMinutes();

    if (this.formMode == "new") {
      let data = {
        activityType: this.formType,
        hasAttachment: false,
        subject: this.form.value.title,
        description: this.form.value.notes,
        callToId: this.selectedCallToUser,
        callToName: this.form.value.callTo,
        callToActionId: this.selectedCallToAction,
        callToActionTitle: this.form.value.purpose,
        callFromId: this.selectedCallFromUser,
        callFromName: this.form.value.callFrom,
        createdDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        ownerId: this.selectedCallFromUser,
        ownerName: this.form.value.callFrom,
        scheduleEnd:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.endTime).format("hh:mm:ss a"),
        scheduleStart:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.startTime).format("hh:mm:ss a"),
        priorityCode: this.selectedPriority,
        durationMinutes: callDuration,
        callDirection: this.selectedDirection,
        associatedEntityId: this.isOpportunity
          ? this.selectedOpportunity
          : this.selectedCustomer,
        associatedEntityName: this.isOpportunity ? "opportunity" : "Account",
        isReminderUpdated: false,
        reminderSelectedOption: "never",
        reminderSelectedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        reminderAddedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        changeHistoryList: {},
        createdById: this.data.oppProData.user.applicationUserId,
        createdByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
      };
      this._activitiesService
        .createOppProCall(data, this.data.oppProData)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.code == "001") {
              this.isLoading = false;
              this.addCallToActionToActivity(resp.result);
              this.cancel();
              this._alertService.success(!this.isArabic ? resp.message : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this.isLoading = false;
              this.cancel();
              this._alertService.error(!this.isArabic ? resp.message : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    } else {
      let data = {
        activityId: this.activity.activityId,
        activityType: this.formType,
        hasAttachment: false,
        subject: this.form.value.title,
        description: this.form.value.notes,
        callToId: this.selectedCallToUser,
        callToName: this.form.value.callTo,
        callToActionId: this.selectedCallToAction,
        callToActionTitle: this.form.value.purpose,
        callFromId: this.selectedCallFromUser,
        callFromName: this.form.value.callFrom,
        createdDate: moment
          .utc(new Date(this.activity.createdDate))

          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        ownerId: this.selectedCallFromUser,
        ownerName: this.form.value.callFrom,
        scheduleEnd:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.endTime).format("hh:mm:ss a"),
        scheduleStart:
          moment(this.form.value.dueDate).format("YYYY-MM-DD") +
          " " +
          moment(this.form.value.startTime).format("hh:mm:ss a"),
        priorityCode: this.selectedPriority,
        durationMinutes: callDuration,
        callDirection: this.selectedDirection,
        associatedEntityId: this.isOpportunity
          ? this.selectedOpportunity
          : this.selectedCustomer,
        associatedEntityName: this.isOpportunity ? "opportunity" : "Account",
        isReminderUpdated: false,
        reminderSelectedOption: "never",
        reminderSelectedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        reminderAddedDate: moment
          .utc(new Date())
          .local()
          .format("YYYY-MM-DD hh:mm:ss a"),
        changeHistoryList: {
          entityId: this.activity.activityId,
          entityName: "activity",
          stateChangedBy: this.data.oppProData.user.applicationUserId, // Id of Logged in user
          stateChangedByName:
            this.data.oppProData.user.firstName +
            " " +
            this.data.oppProData.user.lastName,
          lastUpdatedDate: moment
            .utc(new Date())
            .local()
            .format("YYYY-MM-DD hh:mm:ss a"),
          changedItems: this.getChangedItemsHistoryList(),
        },
        createdById: this.data.oppProData.user.applicationUserId,
        createdByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
        UpdatedById: this.data.oppProData.user.applicationUserId,
        UpdatedByName:
          this.data.oppProData.user.firstName +
          " " +
          this.data.oppProData.user.lastName,
      };
      this._activitiesService
        .editOppProCall(data, this.data.oppProData)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.code == "001") {
              this.isLoading = false;
              this.updateCallToActionToActivity(resp.result);
              this.cancel();
              this._alertService.success(!this.isArabic ? resp.message : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this.isLoading = false;
              this.cancel();
              this._alertService.error(!this.isArabic ? resp.message : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    }
  }

  getChangedItemsHistoryList() {
    let changedItems = [];

    if (this.activity.callFromId != this.selectedCallFromUser) {
      changedItems.push({
        columnName: "ActivityOwnerId",
        currentValueId: this.selectedCallFromUser,
        currentValueName: this.form.value.callFrom,
        descriptiveTitle: "updated",
        previousValueId: this.activity.ownerId,
        previousValueName: this.activity.ownerName,
      });
    }

    if (
      !moment(this.activity.scheduleEnd).isSame(moment(this.form.value.dueDate))
    ) {
      changedItems.push({
        columnName: "ScheduleEndDate",
        currentValueId: 0,
        currentValueName: new Date(this.form.value.dueDate),
        descriptiveTitle: "updated",
        previousValueId: 0,
        previousValueName: new Date(this.activity.scheduleEnd),
      });
    }

    return changedItems;
  }

  addCallToActionToActivity(activity: OppProActivity) {
    let data = {
      entityId: activity.activityId,
      entityType: "Activities",
      callToActionId: this.selectedCallToAction,
      callToActionTitle: this.form.value.purpose,
      createdOn: activity.createdDate,
      createdById: activity.createdById,
      createdByName: activity.createdByName,
    };
    this._activitiesService
      .addCallToActionToActivity(data, this.data.oppProData)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code == "001") {
            this._alertService.success(!this.isArabic ? resp.message : this._activitiesService.arabicAlertMessage, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(!this.isArabic ? resp.message : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }

  updateCallToActionToActivity(activity: OppProActivity) {
    let data = {
      entityId: activity.activityId,
      entityType: "Activities",
      callToActionId: this.selectedCallToAction,
      callToActionTitle: this.form.value.purpose,
      updatedOn: moment.utc(new Date()).local().format("YYYY-MM-DD hh:mm:ss a"),
      updatedById: this.data.oppProData.user.applicationUserId,
      updatedByName:
        this.data.oppProData.user.firstName +
        " " +
        this.data.oppProData.user.lastName,
    };
    this._activitiesService
      .updateCallToActionInActivity(data, this.data.oppProData)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code == "001") {
            this._alertService.success(!this.isArabic ? resp.message : this._activitiesService.arabicAlertMessage, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(!this.isArabic ? resp.message : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }

  activateType(type: { id: number; name: string; active: boolean }) {
    this.resetFields(type.name.toLowerCase());
    this.initFormData(type.name.toLowerCase());
    switch (type.name) {
      case "Customer":
        this.isOpportunity = false;
        this.types[0].active = false;
        type.active = true;
        this.form.get("customer") == undefined
          ? this.form.addControl("customer", new FormControl(null))
          : "";
        this.form.removeControl("opportunity");
        break;
      default:
        this.isOpportunity = true;
        this.types[1].active = false;
        type.active = true;
        this.form.get("opportunity") == undefined
          ? this.form.addControl("opportunity", new FormControl(null))
          : "";
        this.form.removeControl("customer");
        break;
    }
  }

  resetFields(type: string) {
    switch (this.formType) {
      case "proposal":
        if (type == "customer") {
          //this.form.get("opportunity").setValue(null);
          this.selectedOpportunity = null;
          this.oppotunities = [];
        } else {
          // this.form.get("customer").setValue(null);
          this.selectedCustomer = null;
          this.customers = [];
        }

        this.form.get("purpose").setValue(null);
        this.callToActions = [];
        this.selectedCallToAction = null;

        this.form
          .get("callFrom")
          .setValue(
            this.data.oppProData.user.firstName +
              " " +
              this.data.oppProData.user.lastName
          );
        this.selectedCallFromUser = this.data.oppProData.user.applicationUserId;

        this.form.get("callTo").setValue(null);
        this.selectedCallToUser = null;
        this.callToUsers = [];

        this.form.get("dueDate").setValue(null);

        break;
      case "meeting":
        break;
      default:
        if (type == "customer") {
          //this.form.get("opportunity").setValue(null);
          this.selectedOpportunity = null;
          this.oppotunities = [];

          !this.isArabic ? this.form.get("direction").setValue("Outgoing") : this.form.get("direction").setValue("منفتح");
          this.selectedDirection = 1;

          !this.isArabic ? this.form.get("priority").setValue("Normal") : this.form.get("priority").setValue("طبيعي");
          this.selectedPriority = 1;
        } else {
          // this.form.get("customer").setValue(null);
          this.selectedCustomer = null;
          this.customers = [];
        }
        this.form.get("purpose").setValue(null);
        this.callToActions = [];
        this.selectedCallToAction = null;

        this.form
          .get("callFrom")
          .setValue(
            this.data.oppProData.user.firstName +
              " " +
              this.data.oppProData.user.lastName
          );
        this.selectedCallFromUser = this.data.oppProData.user.applicationUserId;

        this.form.get("callTo").setValue(null);
        this.selectedCallToUser = null;
        this.callToUsers = [];

        this.form.get("dueDate").setValue(null);

        this.form.get("startTime").setValue(null);
        this.form.get("endTime").setValue(null);

        break;
    }
  }

  initFormData(type: string) {
    this.getCallToActionsAssociatedWithCallToActionModules(type);

    if (type == "opportunity") {
      this.getOpportunityListForActivities("");
    } else {
      this.searchCustomerByFilter("");
    }

    if (this.formType == "proposal") {
      this.getOpportunityOwnersWithDetials();
    } else {
      this.getOpportunityOwners();
    }
  }

  getUsersList() {
    this._activitiesService
      .getUserList(this.data.oppProData)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.partnerAttendees = resp.result.map((user) => {
              return {
                id: user.applicationUserId,
                name: user.firstName + " " + user.lastName,
                emails: [user.email],
                selected:
                  this.participants.length > 0
                    ? this.getSelectionState(user.applicationUserId, "attendee")
                    : false,
                type: "attendee",
              };
            });
            this.partnerAttendees.length > 0
              ? (this.callToUsers = this.callToUsers.concat(
                  this.partnerAttendees
                ))
              : "";
          }
        }
      });
  }

  getSelectionState(id, type) {
    let state = false;
    for (var i = 0; i < this.participants.length; i++) {
      if (this.participants[i].id == id && this.participants[i].type == type) {
        state = true;
      }
    }
    return state;
  }

  getCallToActionsAssociatedWithCallToActionModules(type: string) {
    this._activitiesService
      .getCallToActionsAssociatedWithCallToActionModules(
        type,
        this.data.oppProData
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.callToActions = resp.result.map((action) => {
              return {
                id: action.callToActionId,
                name: action.title,
              };
            });
          }
        }
      });
  }

  getOpportunityListForActivities(keyword: string) {
    this._activitiesService
      .getOpportunityListForActivities(
        this.data.oppProData.user.applicationUserId,
        this.data.oppProData.user.organizationId,
        keyword,
        this.data.oppProData
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.oppotunities = resp.result.map((opp) => {
              return {
                id: opp.opportunityId,
                name: opp.title,
                customerId: opp.customerId,
              };
            });
          }
        }
      });
  }

  getOpportunityOwners() {
    this._activitiesService
      .getOpportunityOwners(this.data.oppProData)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.callFromUsers = resp.result.map((user) => {
              return {
                id: user.applicationUserId,
                name: user.fullName,
              };
            });
          }
        }
      });
  }

  getOpportunityOwnersWithDetials() {
    this._activitiesService
      .getOwnersWithDetails(this.data.oppProData)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.callFromUsers = resp.result.map((user) => {
              return {
                id: user.applicationUserId,
                name: user.fullName,
                email: user.email,
              };
            });
          }
        }
      });
  }

  searchCustomerByFilter(keyword: string) {
    this._activitiesService
      .searchCustomerByFilter(
        this.territoryFilter,
        keyword,
        this.data.oppProData
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.customers = resp.result.map((customer) => {
              return {
                id: customer.organizationId,
                name: customer.organizationName,
                customerId: customer.organizationId,
              };
            });
          }
        }
      });
  }

  // getAllSalesJobListing() {
  //   this._activitiesService
  //     .getAllSalesJobListing(this.data.oppProData)
  //     .subscribe((resp) => {
  //       if (!!resp) {
  //         if (resp.code === "001" && resp.result.length > 0) {
  //           this.salesJobs = resp.result.map((job) => {
  //             return {
  //               id: job.salesJobId,
  //               name: job.salesJobTitle,
  //             };
  //           });
  //         }
  //       }
  //     });
  // }

  getCustomerContactsList(customerId) {
    this._activitiesService
      .getCustomerContactsList(customerId, this.data.oppProData)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.callToUsers = resp.result.map((user) => {
              return {
                id: user.id,
                name: user.firstName + " " + user.lastName,
              };
            });
          }
        }
      });
  }

  getCustomerContactsListWithDetails(customerId) {
    this._activitiesService
      .getCustomerContactsListWithDetails(customerId, this.data.oppProData)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.callToUsers = resp.result.map((user) => {
              return {
                id: user.id,
                name: user.firstName + " " + user.lastName,
                emails: user.emails,
                selected:
                  this.participants.length > 0
                    ? this.getSelectionState(user.applicationUserId, "contact")
                    : false,
                type: "contact",
              };
            });
            if (this.formType == "meeting") {
              this.getUsersList();
            }
          }
        }
      });
  }
  isValidEndDate() {
    let isValid =
      this.form.get("endTime").value != null &&
      moment(this.form.get("startTime").value, "hh:mm a").isBefore(
        moment(this.form.get("endTime").value, "hh:mm a")
      );

    return !isValid
      ? this.form.get("endTime").setErrors({ incorrect: true })
      : null;
  }

  onChanges(): void {
    if (this.formType == "call" || this.formType == "meeting") {
      this.form.get("endTime").valueChanges.subscribe((val) => {
        if (val != "" && val != null) {
          this.isValidEndDate();
        }
      });
    }
    // this.form.get("dueDate").valueChanges.subscribe((val) => {
    //   if (val != "" && val != null) {
    //     this.hr = new Date().getHours();
    //     this.min = new Date().getMinutes();
    //     this.sec = new Date().getSeconds();
    //     val.setHours(this.hr, this.min, this.sec);
    //   }
    // });

    this.form.get("customer").valueChanges.subscribe((val) => {
      if (val != "" && val != null) {
        // this.form.get("title").setValue(`Call To ${val}`);
        this.form.get("callTo").setValue(null);
        this.selectedCallToUser = null;
      }
    });

    this.form.get("opportunity").valueChanges.subscribe((val) => {
      if (val != "" && val != null) {
        // this.form.get("title").setValue(`Call To ${val}`);
        this.form.get("callTo").setValue(null);
        this.selectedCallToUser = null;
      }
    });

    this.form.get("callTo").valueChanges.subscribe((val) => {
      if (val != "" && val != null && typeof val === "string") {
        this.filteredParticipants = this._filter(val);
      } else {
        this.filteredParticipants = []; //this.callToUsers.slice();
      }
      this.participantSearch = val;
    });
  }

  updateRelatedFields(entity, type) {
    if (type == "opportunity") {
      this.selectedOpportunity = entity.id;
    } else {
      this.selectedCustomer = entity.id;
    }
    if (this.formType == "call") {
      this.getCustomerContactsList(entity.customerId);
    } else {
      this.getCustomerContactsListWithDetails(entity.customerId);
    }
  }

  remove(participant): void {
    const index = this.participants.indexOf(participant);

    if (index >= 0) {
      this.participants.splice(index, 1);
    }
    const index2 = this.callToUsers.indexOf(participant);

    if (index2 >= 0) {
      this.callToUsers[index2].selected = false;
    }

    this.participantsInput.nativeElement.value = "";
    this.form.get("callTo").setValue(this.participants);
    this.participantSearch = null;
    this.filteredParticipants = [];
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    event.option.value.selected = true;
    this.participants.push(event.option.value);
    this.participantsInput.nativeElement.value = "";
    this.form.get("callTo").setValue(this.participants);
    this.participantSearch = null;
    this.filteredParticipants = [];
  }

  _filter(value: string): { id: number; name: string }[] {
    const filterValue = value.toLowerCase();
    return this.callToUsers.filter(
      (participant) => participant.name.toLowerCase().indexOf(filterValue) > -1
    );
  }

  toggleSelection(event: MatAutocompleteSelectedEvent) {
    if (event.option.value.selected) {
      this.remove(event.option.value);
    } else {
      this.selected(event);
    }
  }

  highlight(name) {
    if (!this.participantSearch || this.participantSearch == "") {
      return name;
    }
    const re = new RegExp(this.participantSearch, "gi");
    const html: string = name.replace(
      re,
      `<span class='text-highlight'>${this.participantSearch}</span>`
    );

    return html;
  }

  getusersList(
    list: {
      id: number;
      name: string;
      type: string;
      selected: boolean;
      emails: string[];
    }[],
    type: string
  ) {
    let users = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].type == type) {
        users.push({
          id: list[i].id,
          name: list[i].name,
          emails: list[i].emails,
        });
      }
    }
    return users;
  }

  getEmailsList(
    list: {
      id: number;
      name: string;
      type: string;
      selected: boolean;
      emails: string[];
    }[],
    type: string
  ) {
    let emails = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].type == type) {
        if (list[i].emails.length == 0) {
          continue;
        } else if (list[i].emails.length > 1) {
          for (var j = 0; i < list[i].emails.length; j++) {
            emails.push(list[i].emails[j]);
          }
        } else {
          emails.push(list[i].emails[0]);
        }
      }
    }
    return emails;
  }
}
