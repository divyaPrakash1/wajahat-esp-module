import { Injectable } from "@angular/core";
import { FileItem } from "./models/file-item-activity";
import * as moment from "moment";
import { ArabicNumberPipe } from "../shared/pipes/number-activity.pipe"
import { Status } from "../activity/enums";
@Injectable({ 
  providedIn: "root"
}) 
export class ActivityUtilsService {
  private isArabic: boolean = false;
  numberPipe:any;
  private countries_list: any[] = [
    { name: "Afghanistan", code: "AF" },
    { name: "Aland Islands", code: "AX" },
    { name: "Albania", code: "AL" },
    { name: "Algeria", code: "DZ" },
    { name: "American Samoa", code: "AS" },
    { name: "AndorrA", code: "AD" },
    { name: "Angola", code: "AO" },
    { name: "Anguilla", code: "AI" },
    { name: "Antarctica", code: "AQ" },
    { name: "Antigua and Barbuda", code: "AG" },
    { name: "Argentina", code: "AR" },
    { name: "Armenia", code: "AM" },
    { name: "Aruba", code: "AW" },
    { name: "Australia", code: "AU" },
    { name: "Austria", code: "AT" },
    { name: "Azerbaijan", code: "AZ" },
    { name: "Bahamas", code: "BS" },
    { name: "Bahrain", code: "BH" },
    { name: "Bangladesh", code: "BD" },
    { name: "Barbados", code: "BB" },
    { name: "Belarus", code: "BY" },
    { name: "Belgium", code: "BE" },
    { name: "Belize", code: "BZ" },
    { name: "Benin", code: "BJ" },
    { name: "Bermuda", code: "BM" },
    { name: "Bhutan", code: "BT" },
    { name: "Bolivia", code: "BO" },
    { name: "Bosnia and Herzegovina", code: "BA" },
    { name: "Botswana", code: "BW" },
    { name: "Brazil", code: "BR" },
    { name: "Brunei Darussalam", code: "BN" },
    { name: "Bulgaria", code: "BG" },
    { name: "Burkina Faso", code: "BF" },
    { name: "Burundi", code: "BI" },
    { name: "Cambodia", code: "KH" },
    { name: "Cameroon", code: "CM" },
    { name: "Canada", code: "CA" },
    { name: "Cape Verde", code: "CV" },
    { name: "Cayman Islands", code: "KY" },
    { name: "Central African Republic", code: "CF" },
    { name: "Chad", code: "TD" },
    { name: "Chile", code: "CL" },
    { name: "China", code: "CN" },
    { name: "Christmas Island", code: "CX" },
    { name: "Cocos (Keeling) Islands", code: "CC" },
    { name: "Colombia", code: "CO" },
    { name: "Comoros", code: "KM" },
    { name: "Congo", code: "CG" },
    { name: "Congo, The Democratic Republic of the", code: "CD" },
    { name: "Cook Islands", code: "CK" },
    { name: "Costa Rica", code: "CR" },
    { name: 'Cote D"Ivoire', code: "CI" },
    { name: "Croatia", code: "HR" },
    { name: "Cuba", code: "CU" },
    { name: "Cyprus", code: "CY" },
    { name: "Czech Republic", code: "CZ" },
    { name: "Denmark", code: "DK" },
    { name: "Djibouti", code: "DJ" },
    { name: "Dominica", code: "DM" },
    { name: "Dominican Republic", code: "DO" },
    { name: "Ecuador", code: "EC" },
    { name: "Egypt", code: "EG" },
    { name: "El Salvador", code: "SV" },
    { name: "Equatorial Guinea", code: "GQ" },
    { name: "Eritrea", code: "ER" },
    { name: "Estonia", code: "EE" },
    { name: "Ethiopia", code: "ET" },
    { name: "Falkland Islands (Malvinas)", code: "FK" },
    { name: "Faroe Islands", code: "FO" },
    { name: "Fiji", code: "FJ" },
    { name: "Finland", code: "FI" },
    { name: "France", code: "FR" },
    { name: "French Polynesia", code: "PF" },
    { name: "Gabon", code: "GA" },
    { name: "Gambia", code: "GM" },
    { name: "Georgia", code: "GE" },
    { name: "Germany", code: "DE" },
    { name: "Ghana", code: "GH" },
    { name: "Gibraltar", code: "GI" },
    { name: "Greece", code: "GR" },
    { name: "Greenland", code: "GL" },
    { name: "Grenada", code: "GD" },
    { name: "Guam", code: "GU" },
    { name: "Guatemala", code: "GT" },
    { name: "Guinea", code: "GN" },
    { name: "Guinea-Bissau", code: "GW" },
    { name: "Guyana", code: "GY" },
    { name: "Haiti", code: "HT" },
    { name: "Holy See (Vatican City State)", code: "VA" },
    { name: "Honduras", code: "HN" },
    { name: "Hong Kong", code: "HK" },
    { name: "Hungary", code: "HU" },
    { name: "Iceland", code: "IS" },
    { name: "India", code: "IN" },
    { name: "Indonesia", code: "ID" },
    { name: "Iran, Islamic Republic Of", code: "IR" },
    { name: "Iraq", code: "IQ" },
    { name: "Ireland", code: "IE" },
    { name: "Isle of Man", code: "IM" },
    { name: "Israel", code: "IL" },
    { name: "Italy", code: "IT" },
    { name: "Jamaica", code: "JM" },
    { name: "Japan", code: "JP" },
    { name: "Jersey", code: "JE" },
    { name: "Jordan", code: "JO" },
    { name: "Kazakhstan", code: "KZ" },
    { name: "Kenya", code: "KE" },
    { name: "Kiribati", code: "KI" },
    { name: "Korea, Democratic People'S Republic of", code: "KP" },
    { name: "Korea, Republic of", code: "KR" },
    { name: "Kuwait", code: "KW" },
    { name: "Kyrgyzstan", code: "KG" },
    { name: 'Lao People"S Democratic Republic', code: "LA" },
    { name: "Latvia", code: "LV" },
    { name: "Lebanon", code: "LB" },
    { name: "Lesotho", code: "LS" },
    { name: "Liberia", code: "LR" },
    { name: "Libyan Arab Jamahiriya", code: "LY" },
    { name: "Liechtenstein", code: "LI" },
    { name: "Lithuania", code: "LT" },
    { name: "Luxembourg", code: "LU" },
    { name: "Macao", code: "MO" },
    { name: "Macedonia, The Former Yugoslav Republic of", code: "MK" },
    { name: "Madagascar", code: "MG" },
    { name: "Malawi", code: "MW" },
    { name: "Malaysia", code: "MY" },
    { name: "Maldives", code: "MV" },
    { name: "Mali", code: "ML" },
    { name: "Malta", code: "MT" },
    { name: "Marshall Islands", code: "MH" },
    { name: "Mauritania", code: "MR" },
    { name: "Mauritius", code: "MU" },
    { name: "Mayotte", code: "YT" },
    { name: "Mexico", code: "MX" },
    { name: "Micronesia, Federated States of", code: "FM" },
    { name: "Moldova, Republic of", code: "MD" },
    { name: "Monaco", code: "MC" },
    { name: "Mongolia", code: "MN" },
    { name: "Montserrat", code: "MS" },
    { name: "Morocco", code: "MA" },
    { name: "Mozambique", code: "MZ" },
    { name: "Myanmar", code: "MM" },
    { name: "Namibia", code: "NA" },
    { name: "Nauru", code: "NR" },
    { name: "Nepal", code: "NP" },
    { name: "Netherlands", code: "NL" },
    { name: "Netherlands Antilles", code: "AN" },
    { name: "New Caledonia", code: "NC" },
    { name: "New Zealand", code: "NZ" },
    { name: "Nicaragua", code: "NI" },
    { name: "Niger", code: "NE" },
    { name: "Nigeria", code: "NG" },
    { name: "Niue", code: "NU" },
    { name: "Norfolk Island", code: "NF" },
    { name: "Northern Mariana Islands", code: "MP" },
    { name: "Norway", code: "NO" },
    { name: "Oman", code: "OM" },
    { name: "Pakistan", code: "PK" },
    { name: "Palau", code: "PW" },
    { name: "Palestinian Territory, Occupied", code: "PS" },
    { name: "Panama", code: "PA" },
    { name: "Papua New Guinea", code: "PG" },
    { name: "Paraguay", code: "PY" },
    { name: "Peru", code: "PE" },
    { name: "Philippines", code: "PH" },
    { name: "Pitcairn", code: "PN" },
    { name: "Poland", code: "PL" },
    { name: "Portugal", code: "PT" },
    { name: "Puerto Rico", code: "PR" },
    { name: "Qatar", code: "QA" },
    { name: "Romania", code: "RO" },
    { name: "Russian Federation", code: "RU" },
    { name: "RWANDA", code: "RW" },
    { name: "Saint Helena", code: "SH" },
    { name: "Saint Kitts and Nevis", code: "KN" },
    { name: "Saint Lucia", code: "LC" },
    { name: "Saint Pierre and Miquelon", code: "PM" },
    { name: "Saint Vincent and the Grenadines", code: "VC" },
    { name: "Samoa", code: "WS" },
    { name: "San Marino", code: "SM" },
    { name: "Sao Tome and Principe", code: "ST" },
    { name: "Saudi Arabia", code: "SA" },
    { name: "Senegal", code: "SN" },
    { name: "Serbia and Montenegro", code: "CS" },
    { name: "Seychelles", code: "SC" },
    { name: "Sierra Leone", code: "SL" },
    { name: "Singapore", code: "SG" },
    { name: "Slovakia", code: "SK" },
    { name: "Slovenia", code: "SI" },
    { name: "Solomon Islands", code: "SB" },
    { name: "Somalia", code: "SO" },
    { name: "South Africa", code: "ZA" },
    { name: "Spain", code: "ES" },
    { name: "Sri Lanka", code: "LK" },
    { name: "Sudan", code: "SD" },
    { name: "Suriname", code: "SR" },
    { name: "Swaziland", code: "SZ" },
    { name: "Sweden", code: "SE" },
    { name: "Switzerland", code: "CH" },
    { name: "Syrian Arab Republic", code: "SY" },
    { name: "Taiwan, Province of China", code: "TW" },
    { name: "Tajikistan", code: "TJ" },
    { name: "Tanzania, United Republic of", code: "TZ" },
    { name: "Thailand", code: "TH" },
    { name: "Timor-Leste", code: "TL" },
    { name: "Togo", code: "TG" },
    { name: "Tokelau", code: "TK" },
    { name: "Tonga", code: "TO" },
    { name: "Trinidad and Tobago", code: "TT" },
    { name: "Tunisia", code: "TN" },
    { name: "Turkey", code: "TR" },
    { name: "Turkmenistan", code: "TM" },
    { name: "Turks and Caicos Islands", code: "TC" },
    { name: "Tuvalu", code: "TV" },
    { name: "Uganda", code: "UG" },
    { name: "Ukraine", code: "UA" },
    { name: "United Arab Emirates", code: "AE" },
    { name: "United Kingdom", code: "GB" },
    { name: "United States", code: "US" },
    { name: "Uruguay", code: "UY" },
    { name: "Uzbekistan", code: "UZ" },
    { name: "Vanuatu", code: "VU" },
    { name: "Venezuela", code: "VE" },
    { name: "Viet Nam", code: "VN" },
    { name: "Virgin Islands, U.S.", code: "VI" },
    { name: "Wallis and Futuna", code: "WF" },
    { name: "Yemen", code: "YE" },
    { name: "Zambia", code: "ZM" },
    { name: "Zimbabwe", code: "ZW" }
  ];

  constructor() {
    this.getLanguage();
    this.numberPipe = new ArabicNumberPipe();
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }
  formatFileSize(bytes, decimalPoint?) {
    if (bytes == 0) return "0 Bytes";
    let k = 1024,
      dm = decimalPoint || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  getCountryNameByCode = function(code) {
    for (let i = 0; i < this.countries_list.length; i++) {
      if (this.countries_list[i].code == code) {
        return this.countries_list[i].name;
      }
    }
    return "";
  };

  getActivityStatus(status: number, actualVal: number, isShared: boolean) {
    if (isShared) {
      return status;
    } else {
      if (status == 4 || status == 2) {
        return status;
      } else if (actualVal == null) {
        return Status.Open;
      } else {
        return Status.InProgress;
      }
    }
  }

  mapOrder<T extends any[]>(array: T, order: string[], key: string): T {
    array.sort((a, b) => {
      const A = a[key];
      const B = b[key];
      return order.indexOf(A) > order.indexOf(B) ? 1 : -1;
    });
    return array;
  }

  getFormattedIdenedi(id: string): string {
    if (!id) {
      return "";
    }
    if (id.length >= 11) {
      if (id.endsWith("00")) {
        id = id.substr(0, id.length - 2);
      }
      const idenedi = id.split("");
      idenedi.splice(3, 0, " "); // GRE XXXXXXXX
      idenedi.splice(8, 0, "-"); // GRE XXXXXXXX
      idenedi.splice(11, 0, "-"); // GRE XXXX-XXXX
      return idenedi.join("");
    }
    return id;
  }

  // 20190927 to 2019-09-27
  addHypenInDateString(date: string) {
    if (date && date != "") {
      return date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
    }
    return "";
  }

  getDeepCopy(data) {
    if (data) {
      return JSON.parse(JSON.stringify(data));
    }
    return null;
  }

  convertToKB(value) {
    let kb = 0;
    if (value < 1000) {
      return value + " B";
    }
    kb = +(value / 1024).toFixed(1);
    if (kb > 999) {
      return (kb / 1000).toFixed(1) + " MB";
    }
    return kb + " KB";
  }

  appendHttpIfRequired(href: string) {
    if (href && href.length > 0) {
      const m = href.match(/http:|https:/i);
      if (
        m == null &&
        href.indexOf("tel:") == -1 &&
        href.indexOf("sms:") == -1 &&
        href.indexOf("mailto:") == -1
      ) {
        href = "http://" + href;
      }
    }
    return href;
  }

  extractUrlsFromText(str: string) {
    if (!str) {
      return [];
    }
    const regex = /(https:\/\/|http:\/\/|www[.])[-A-Za-z0-9+&amp;@#/%?=~_()|!:,.;]*[-A-Za-z0-9+&amp;@#/%=~_()|]/gi;
    return str.match(regex);
  }

  getRandomId(prefix?: string): string {
    let id: string = btoa(Math.random().toString()).substring(0, 12);
    if (prefix) return prefix + id;
    return id;
  }

  setFileBase64Data(file: FileItem, data: any) {
    file.binaryData = data;
    file.DownloadUrl = data;
    file.ContentType = "image/png";
    const blobBin = atob(data.split(",")[1]);
    const array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const fileDate = new Blob([new Uint8Array(array)], { type: "image/png" });
    file.FileData = fileDate;
  }

  getMobileOperatingSystem() {
    const userAgent = navigator.userAgent || navigator.vendor;

    // Windows Phone must come first because its UA also contains "Android"
    // if (/windows phone/i.test(userAgent)) {
    //     return "Windows Phone";
    // }

    if (/android/i.test(userAgent)) {
      return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return "iOS";
    }

    return "unknown";
  }

  getDueDateTimeAgo(date: string, isTacticDetail?: boolean) {
    let now = moment(new Date());
    let dueDate = moment(new Date(date));
    let currentMonthDaysRange = moment(now).daysInMonth();
    let duration = moment.duration(now.diff(dueDate));
    let days = Math.floor(duration.asDays());

    if(!this.isArabic) {
      //day
      if (days == 0) {
          return "Today";
      } else if (days == 1) {
          return isTacticDetail ? "Day Overdue" : "Day ago";
      }
      //days less than week
      else if (days < 7 && days > 1) {
          return this.numberPipe.transform(days) + (isTacticDetail ? " days Overdue" : " days ago");
      }
      //weeks
      else if (days >= 7 && days < currentMonthDaysRange) {
        let week = now.diff(dueDate, "week");
          return week <= 1
            ? isTacticDetail
              ? " week Overdue"
              : " week ago"
            : this.numberPipe.transform(week) + (isTacticDetail ? " weeks Overdue" : " weeks ago");
      }
      //months
      else if (days >= currentMonthDaysRange && days < 365) {
        let month = now.diff(dueDate, "month");
          return month <= 1
            ? isTacticDetail
              ? " month Overdue"
              : "Month ago"
            : this.numberPipe.transform(month) + (isTacticDetail ? " months Overdue" : " months ago");
      }
      //years
      else {
        let year = now.diff(dueDate, "year");
          return year <= 1 ? "Year ago" : this.numberPipe.transform(year) + " years ago";
      }
    } else {
      if (days == 0) {
          return "اليوم";
      } else if (days == 1) {
          return isTacticDetail ? "متأخر ب يوم" : "أيام مضت";
      }
      //days less than week
      else if (days < 7 && days > 1) {
          return this.numberPipe.transform(days) + (isTacticDetail ? " متأخر ب أيام" : " أيام مضت");
      }
      //weeks
      else if (days >= 7 && days < currentMonthDaysRange) {
        let week = now.diff(dueDate, "week");
          return week <= 1 ? (isTacticDetail ? " متأخر بأسبوع" : " منذ أسبوع") : this.numberPipe.transform(week) + (isTacticDetail ? " متأخر بأسابيع " : " منذ أسابيع")
        }
      //months
      else if (days >= currentMonthDaysRange && days < 365) {
        let month = now.diff(dueDate, "month");
          return month <= 1 ? (isTacticDetail ? " متأخر بشهر" : "منذ شهر") : this.numberPipe.transform(month) + (isTacticDetail ? " متأخر بأشهر" : " منذ أشهر");
        }

      //years
      else {
        let year = now.diff(dueDate, "year");
          return year <= 1 ? "منذ سنة" : this.numberPipe.transform(year) + " منذ سنين";
      }
    }
  }

  getDueDateLabel(date: string) {
    let label = "";
    let currentDate = moment(new Date());
    let dueDate = moment(new Date(date));

    if (dueDate.format("LL") == currentDate.format("LL")) {
      label = "Due Today";
    } else if (dueDate.isBefore(currentDate)) {
      label = "Overdue";
    } else {
      label = "";
    }
    return label;
  }

  getTimeAgo(date: any) {
    var now = moment(new Date());
    let commentDate:any = moment.utc(date).local();
    var duration = moment.duration(now.diff(commentDate));
    var minutes = duration.asMinutes();

    //seconds
    if (minutes < 1) {
      return moment(date)
        .startOf("second")
        .fromNow();
    }
    //minutes
    else if (minutes < 60 && minutes >= 1) {
      return moment(date)
        .startOf("minute")
        .fromNow();
    }
    //hours
    else if (minutes < 1440 && minutes >= 60) {
      return moment(date)
        .startOf("hour")
        .fromNow();
    }
    //days
    else if (minutes <= 43799 && minutes >= 1440) {
      return moment(date)
        .startOf("day")
        .fromNow();
    } else {
      return moment(commentDate);
    }
  }

  getImageFileTypes() {
    return [".png", ".svg", ".jpg"];
  }

  getVideoFileTypes() {
    return [];
  }
}
