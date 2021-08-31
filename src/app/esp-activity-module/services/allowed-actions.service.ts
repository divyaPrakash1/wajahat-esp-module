import { Injectable } from "@angular/core";
import { EntityTypes, Actions, BackendAllowedActions, Status } from "../enums/enums";
// import { EntityTypes, Actions, BackendAllowedActions, Status } from "../enums";
@Injectable({
  providedIn: "root",
})
export class AllowedActionsService {
  constructor() {}

  getDefaultActions() {
    let defaultActions:any[] = [];
    defaultActions[0] = {
      Id: 11,
      Name: "LogActual",
      Label: "Log Actual",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };

    defaultActions[1] = {
      Id: 2,
      Name: "Update",
      Label: "Edit",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[2] = {
      Id: 14,
      Name: "manageTags",
      Label: "Manage Tags",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[3] = {
      Id: 3,
      Name: "Delete",
      Label: "Delete",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[4] = {
      Id: 5,
      Name: "Reactivate",
      Label: "Reactivate",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[5] = {
      Id: 4,
      Name: "Deactivate",
      Label: "Deactivate",
      IsActive: false,
      itemStyle: { width: "16px", height: "16px" },
    };
    defaultActions[6] = {
      Id: 6,
      Name: "Move",
      Label: "Move",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[7] = {
      Id: 8,
      Name: "Sign",
      Label: "Sign",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[8] = {
      Id: 9,
      Name: "Revoke",
      Label: "Revoke",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[9] = {
      Id: 10,
      Name: "Copy",
      Label: "Copy",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[10] = {
      Id: 11,
      Name: "Close",
      Label: "Close",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };
    defaultActions[11] = {
      Id: 12,
      Name: "Reopen",
      Label: "Reopen",
      IsActive: false,
      itemStyle: { width: "15px", height: "15px" },
    };

    return defaultActions;
  }

  getActions(allowedActions:any) {
    let defaultActions = this.getDefaultActions();

    for (let i = 0; i < allowedActions.length; i++) {
      defaultActions.push({
        Id: allowedActions[i].Id,
        Name: allowedActions[i].Name,
        IsActive: null,
        itemStyle: null,
      });
    }
    return defaultActions;
  }

  isAllowAction(allowActions:any, actionId:any) {
    for (let i = 0; i < allowActions.length; i++) {
      if (allowActions[i].Id === actionId) {
        return true;
      }
    }
    return false;
  }


  getDefaultAllowedActions() {
    let allowedActions = [];
    allowedActions.push({
      id: Actions.read,
      name: this.getActionByValue(Actions.read),
      isShow: false,
      isEnabled: false,
      label: "Read",
    });

    allowedActions.push({
      id: Actions.logActual,
      name: this.getActionByValue(Actions.logActual),
      isShow: true,
      isEnabled: false,
      label: "Log Actual",
    });

    allowedActions.push({
      id: Actions.close,
      name: this.getActionByValue(Actions.close),
      isShow: false,
      isEnabled: false,
      label: "Close",
    });

    allowedActions.push({
      id: Actions.reopen,
      name: this.getActionByValue(Actions.reopen),
      isShow: false,
      isEnabled: false,
      label: "Reopen",
    });

    allowedActions.push({
      id: Actions.edit,
      name: this.getActionByValue(Actions.edit),
      isShow: true,
      isEnabled: false,
      label: "Edit",
    });

    allowedActions.push({
      id: Actions.delete,
      name: this.getActionByValue(Actions.delete),
      isShow: true,
      isEnabled: false,
      label: "Delete",
    });
    allowedActions.push({
      id: Actions.create,
      name: this.getActionByValue(Actions.create),
      isShow: false,
      isEnabled: false,
      label: "Create",
    });

    return allowedActions;
  }

  getActionByValue(actionValue:any) {
    for (let action in Actions) {
      if (actionValue == Actions[action]) {
        return action;
      }
    }
    return null;
  }

  updateAllowedActionsRegardingBackend(
    serverAllowedAction:any,
    defaultActions:any,
    entityType:any,
    status:any
  ) {
    for (let i = 0; i < defaultActions.length; i++) {
      let defaultAction: {
        id: number;
        name: string;
        isShow: boolean;
        isEnabled: boolean;
        label: string;
      };
      defaultAction = defaultActions[i];
      switch (entityType) {
        case EntityTypes.Indicator: {
          switch (defaultAction.id) {
            case Actions.read:
              switch (serverAllowedAction.Id) {
                case BackendAllowedActions.read:
                  defaultAction.isShow = false;
                  break;
              }
              break;
            case Actions.create:
              switch (serverAllowedAction.Id) {
                case BackendAllowedActions.create:
                  if (defaultAction.id == Actions.create) {
                    defaultAction.isShow = false;
                  } else {
                    defaultAction.isShow = true;
                    defaultAction.isEnabled = true;
                  }
                  break;
              }
              break;
            case Actions.edit:
              switch (serverAllowedAction.Id) {
                case BackendAllowedActions.update:
                  defaultAction.isShow = true;
                  defaultAction.isEnabled = true;
                  break;
              }
              break;
            case Actions.close:
              if (entityType == EntityTypes.Indicator) {
                switch (serverAllowedAction.Id) {
                  case BackendAllowedActions.specialRight:
                    // if (
                    //   defaultAction.id == Actions.reopen &&
                    //   (status == 2 || status == 3 || status == 4)
                    // ) {
                    //   defaultAction.isShow = true;
                    //   defaultAction.isEnabled = true;
                    //   defaultActions.find(function (x) {
                    //     return x.id == Actions.close;
                    //   }).isShow = false;
                    // } else if (
                    //   defaultAction.id == Actions.close &&
                    //   status != 2 &&
                    //   status != 3 &&
                    //   status != 4
                    // ) {
                    //   defaultAction.isShow = true;
                    //   defaultAction.isEnabled = true;
                    //   defaultActions.find(function (x) {
                    //     return x.id == Actions.reopen;
                    //   }).isShow = false;
                    // }

                    break;
                }
              }
              break;
            case Actions.delete:
              switch (serverAllowedAction.Id) {
                case BackendAllowedActions.delete:
                  if (status == -1) {
                    defaultAction.isShow = false;
                  } else {
                    defaultAction.isShow = true;
                    defaultAction.isEnabled = true;
                  }
                  break;
              }
              break;
            case Actions.logActual:
              switch (serverAllowedAction.Id) {
                case BackendAllowedActions.specialRight:
                  defaultAction.isShow = true;
                  defaultAction.isEnabled = true;
                  break;
              }
              break;
          }
          break;
        }
      }
    }
  }


  getAllowedActions(
    ownerId:any,
    creatorId:any,
    loggedInId:any,
    status:any,
    serverAllowedAction:any,
    isAccepted:any,
    isReassigned:any,
    isEngProActivity:any,
    dueDate:any,
    maxClaims:any,
    totalClaims:any,
    preUrl:any
  ) {
    let actions = [];
    if(!!preUrl && preUrl!=null){
      //case#1 : Accessed From Stack of Card means not claimed yet and  I am owner and I am not the creator.
      if(preUrl == "/pages/activities?activeTab=0" || preUrl == "/pages/activities" || preUrl == "/pages/activities/new/assigned"){
        actions.push({
          id: Actions.read,
          name: this.getActionByValue(Actions.read),
          isShow: false,
          label: "Read",
        });
        actions.push({
          id: Actions.claim,
          name: this.getActionByValue(Actions.claim),
          isShow: true,
          label: "Claim",
        });
        actions.push({
          id: Actions.decideLater,
          name: this.getActionByValue(Actions.decideLater),
          isShow: true,
          label: "Decide Later",
        });
      }else{ //Accessed from shared list means I am the creator:
        actions.push({
          id: Actions.read,
          name: this.getActionByValue(Actions.read),
          isShow: false,
          label: "Read",
        });
        if(status == Status.InProgress){
          //if( maxClaims ==null ||  maxClaims != null && totalClaims < maxClaims){

          //}
          if(  maxClaims ==null || maxClaims != null && totalClaims != null && totalClaims < maxClaims){
            actions.push({
              id: Actions.share,
              name: this.getActionByValue(Actions.share),
              isShow: true,
              label: "Share",
            });
            actions.push({
              id: Actions.stopClaim,
              name: this.getActionByValue(Actions.stopClaim),
              isShow: true,
              label: "Stop Claiming",
            });
           }

        actions.push({
          id: Actions.sendReminder,
          name: this.getActionByValue(Actions.sendReminder),
          isShow: true,
          label: "Send Reminder",
        });

        // actions.push({
        //   id: Actions.expandDueDate,
        //   name: this.getActionByValue(Actions.expandDueDate),
        //   isShow: true,
        //   label: "Expand Due Date",
        // });

          actions.push({
            id: Actions.completeClaim,
            name: this.getActionByValue(Actions.completeClaim),
            isShow: true,
            label: "Complete Claimed Activities",
          });
          actions.push({
            id: Actions.cancelActivity,
            name: this.getActionByValue(Actions.cancleClaim),
            isShow: true,
            label: "Cancel Claimed Activities",
          });

        }else{
          actions.push({
            id: Actions.edit,
            name: this.getActionByValue(Actions.edit),
            isShow: true,
            label: "Edit",
          });
          actions.push({
            id: Actions.delete,
            name: this.getActionByValue(Actions.delete),
            isShow: true,
            label: "Delete",
          });
          if(  maxClaims ==null || maxClaims != null && totalClaims != null && totalClaims < maxClaims){
          actions.push({
            id: Actions.share,
            name: this.getActionByValue(Actions.share),
            isShow: true,
            label: "Share",
          });
          }
        }
      }
    }else{

      //Activities created by logged in user for  self
      if (ownerId == creatorId && ownerId == loggedInId) {
        switch (status) {
          case Status.Open:
          case Status.InProgress:
              actions.push({
                id: Actions.read,
                name: this.getActionByValue(Actions.read),
                isShow: false,
                label: "Read",
              });
              if (dueDate == null) {//for backlog
                actions.push({
                  id: Actions.plan,
                  name: this.getActionByValue(Actions.plan),
                  isShow: true,
                  label: "Plan",
                });
                actions.push({
                  id: Actions.doToday,
                  name: this.getActionByValue(Actions.doToday),
                  isShow: true,
                  label: "Do Today",
                });
                actions.push({
                  id: Actions.schedule,
                  name: this.getActionByValue(Actions.schedule),
                  isShow: true,
                  label: "Schedule",
                });
                actions.push({
                  id: Actions.edit,
                  name: this.getActionByValue(Actions.edit),
                  isShow: true,
                  label: "Edit",
                });
              }

              if (!!dueDate && dueDate != null) {
                actions.push({
                  id: Actions.completeActivity,
                  name: this.getActionByValue(Actions.completeActivity),
                  isShow: true,
                  label: "Complete Activity",
                });
                actions.push({
                  id: Actions.cancelActivity,
                  name: this.getActionByValue(Actions.cancelActivity),
                  isShow: true,
                  label: "Cancel Activity",
                });
                actions.push({
                  id: Actions.edit,
                  name: this.getActionByValue(Actions.edit),
                  isShow: true,
                  label: "Edit",
                });
                actions.push({
                  id: Actions.unplan,
                  name: this.getActionByValue(Actions.unplan),
                  isShow: true,
                  label: "Return to Backlog",
                });
              }

              actions.push({
                id: Actions.delete,
                name: this.getActionByValue(Actions.delete),
                isShow: true,
                label: "Delete",
              });

            break;
          case Status.Done:
          case Status.Cancelled:

              actions.push({
                id: Actions.read,
                name: this.getActionByValue(Actions.read),
                isShow: false,
                label: "Read",
              });

              actions.push({
                id: Actions.reopen,
                name: this.getActionByValue(Actions.reopen),
                isShow: true,
                label: "Reopen",
              });
            break;
          default:
            break;
        }
      }

      //Activities Assigned to logged in user
      if (ownerId == loggedInId && loggedInId != creatorId) {
        if (isAccepted) {
          if(status ==  Status.Open || status == Status.InProgress){
            actions.push({
              id: Actions.read,
              name: this.getActionByValue(Actions.read),
              isShow: false,
              label: "Read",
            });
            if (!!dueDate && dueDate != null) {
              actions.push({
                id: Actions.completeActivity,
                name: this.getActionByValue(Actions.completeActivity),
                isShow: true,
                label: "Complete Activity",
              });
              actions.push({
                id: Actions.cancelActivity,
                name: this.getActionByValue(Actions.cancelActivity),
                isShow: true,
                label: "Cancel Activity",
              });
            }
          }
        }
        else {

            actions.push({
              id: Actions.read,
              name: this.getActionByValue(Actions.read),
              isShow: false,
              label: "Read",
            });
            actions.push({
              id: Actions.accept,
              name: this.getActionByValue(Actions.accept),
              isShow: true,
              label: "Accept",
            });
            actions.push({
              id: Actions.reject,
              name: this.getActionByValue(Actions.reject),
              isShow: true,
              label: "Reject",
            });

        }
      }

      //Activities assigned by me to someone else
      if (ownerId != loggedInId && loggedInId == creatorId) {
        if (isAccepted && !isReassigned) {
          switch (status) {
            case Status.Open:
            case Status.InProgress:

                actions.push({
                  id: Actions.read,
                  name: this.getActionByValue(Actions.read),
                  isShow: false,
                  label: "Read",
                });
                actions.push({
                  id: Actions.sendReminder,
                  name: this.getActionByValue(Actions.sendReminder),
                  isShow: true,
                  label: "Send Reminder",
                });
                actions.push({
                  id: Actions.expandDueDate,
                  name: this.getActionByValue(Actions.expandDueDate),
                  isShow: true,
                  label: "Extend Due Date",
                });
                if (!!dueDate && dueDate != null) {
                  actions.push({
                    id: Actions.completeActivity,
                    name: this.getActionByValue(Actions.completeActivity),
                    isShow: true,
                    label: "Complete Activity",
                  });
                  actions.push({
                    id: Actions.cancelActivity,
                    name: this.getActionByValue(Actions.cancelActivity),
                    isShow: true,
                    label: "Cancel Activity",
                  });
                }

              break;
            case Status.Done:

                actions.push({
                  id: Actions.read,
                  name: this.getActionByValue(Actions.read),
                  isShow: false,
                  label: "Read",
                });
                actions.push({
                  id: Actions.reopen,
                  name: this.getActionByValue(Actions.reopen),
                  isShow: true,
                  label: "Reopen",
                });
                actions.push({
                  id: Actions.approve,
                  name: this.getActionByValue(Actions.approve),
                  isShow: true,
                  label: "Approve",
                });
                actions.push({
                  id: Actions.reject,
                  name: this.getActionByValue(Actions.reject),
                  isShow: true,
                  label: "Reject",
                });

              break;
            case Status.Cancelled:
              // if (!isEngProActivity && !!serverAllowedAction) {
              //   serverAllowedAction.forEach((action) => {
              //     switch (action.Id) {
              //       case BackendAllowedActions.read:
              //         actions.push({
              //           id: Actions.read,
              //           name: this.getActionByValue(Actions.read),
              //           isShow: false,
              //           label: "Read",
              //         });
              //         break;
              //       case BackendAllowedActions.update:
              //         actions.push({
              //           id: Actions.approve,
              //           name: this.getActionByValue(Actions.approve),
              //           isShow: true,
              //           label: "Approve",
              //         });
              //         actions.push({
              //           id: Actions.reopen,
              //           name: this.getActionByValue(Actions.reopen),
              //           isShow: true,
              //           label: "Reopen",
              //         });
              //         actions.push({
              //           id: Actions.reassign,
              //           name: this.getActionByValue(Actions.reassign),
              //           isShow: true,
              //           label: "Reassign",
              //         });
              //         break;
              //     }
              //   });
              // } else {
                actions.push({
                  id: Actions.read,
                  name: this.getActionByValue(Actions.read),
                  isShow: false,
                  label: "Read",
                });
                actions.push({
                  id: Actions.approve,
                  name: this.getActionByValue(Actions.approve),
                  isShow: true,
                  label: "Approve",
                });
                actions.push({
                  id: Actions.reopen,
                  name: this.getActionByValue(Actions.reopen),
                  isShow: true,
                  label: "Reopen",
                });
                actions.push({
                  id: Actions.reassign,
                  name: this.getActionByValue(Actions.reassign),
                  isShow: true,
                  label: "Reassign",
                });
              // }

              break;
            case Status.StemeXeRejected:

                actions.push({
                  id: Actions.read,
                  name: this.getActionByValue(Actions.read),
                  isShow: false,
                  label: "Read",
                });
                actions.push({
                  id: Actions.edit,
                  name: this.getActionByValue(Actions.edit),
                  isShow: true,
                  label: "Edit",
                });


              break;
            default:
              break;
          }
        } else {
          if (!isReassigned) {

              actions.push({
                id: Actions.read,
                name: this.getActionByValue(Actions.read),
                isShow: false,
                label: "Read",
              });
              actions.push({
                id: Actions.edit,
                name: this.getActionByValue(Actions.edit),
                isShow: true,
                label: "Edit",
              });
              actions.push({
                id: Actions.delete,
                name: this.getActionByValue(Actions.delete),
                isShow: true,
                label: "Delete",
              });

          } else {
            if (status == Status.Cancelled) {

                    actions.push({
                      id: Actions.read,
                      name: this.getActionByValue(Actions.read),
                      isShow: false,
                      label: "Read",
                    });

                    actions.push({
                      id: Actions.reopen,
                      name: this.getActionByValue(Actions.reopen),
                      isShow: true,
                      label: "Reopen",
                    });

            }
          }
        }
      }
    }


    return actions;
  }
}
