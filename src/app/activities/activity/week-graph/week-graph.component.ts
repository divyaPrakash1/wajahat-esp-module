import { Component, OnInit, Input } from "@angular/core";
import * as Highcharts from "highcharts";
import { $ } from "protractor";
declare var require: any;
let Boost = require("highcharts/modules/boost");
let noData = require("highcharts/modules/no-data-to-display");
let More = require("highcharts/highcharts-more");

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
  selector: "xcdrs-week-graph",
  templateUrl: "./week-graph.component.html",
  styleUrls: ["./week-graph.component.scss"],
})
export class WeekGraphComponent implements OnInit {
  @Input() indicators: Array<any>;
  @Input() weekNumber: number;
  @Input() weekIdx: number;
  @Input() effieciency: boolean;
  public options: any;
  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.effieciency) {
        this.options = {
          colors: ["#00a3ff"],
          tooltip: { 
            enabled: true,
          //   backgroundColor: {
          //     linearGradient: [0, 0, 0, 60],
          //     stops: [
          //         [0, '#FFFFFF'],
          //         [1, '#E0E0E0']
          //     ]
          // },
          borderWidth: 1,
          borderColor: '#AAA',
          cursor:Highcharts.Pointer
           },
          chart: {
            type: "spline",
            renderTo: "efficiency-chart",
          },
          title: {
            text: "",
          },
          subtitle: {
            text: "",
          },
          xAxis: {
            margin: 3,
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: "transparent",
            minorTickLength: 0,
            tickLength: 0,
            labels: {
              enabled: false,
            },
            categories: this.getActivityCount()
          },
          yAxis: {
            title: false,
            opposite: true,
            gridLineDashStyle: "longdash",
            tickInterval: 2,

            min: 0,
            labels: {
              style: {
                color: "#94959c",
              },
            },
          },
          plotOptions: {
            series: {
              pointStart: 1,
            },
            line: {
              dataLabels: {
                enabled: false,
              },
              enableMouseTracking: false,
              width: 1,
            },
          },
          curveType: 'function',

          legend: {
            enabled: false,
          },
          series: [
            {
              name: "Efforts",
              data: this.getEffortsIndicators(),
            },
          ],
        };
      } else
        this.options = {
          colors: ["#00a3ff"],
          chart: {
            type: "line",
            renderTo: "container-" + this.weekIdx,
          },
          title: {
            text: "",
          },
          subtitle: {
            text: "",
          },
          xAxis: {
            type: "datetime",
            categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            tickInterval: 1,
            max: 6,
            min: 0,
            labels: {
              style: {
                color: "#94959c",
              },
            },
          },
          yAxis: {
            labels: "",
            title: {
              text: "",
            },
          },
          plotOptions: {
            // series: {
            //   pointStart: 0,
            // },
            line: {
              dataLabels: {
                enabled: true,
                color: "#00a3ff",
                // position: "top",
                // x: 0,
                // y: 0,
              },
              enableMouseTracking: false,
              // width: 1,
            },
          },

          legend: {
            enabled: false,
          },
          series: [
            {
              name: "",
              data: this.getIndicators(),
            },
          ],
        };
      Highcharts.chart("container-" + this.weekIdx, this.options);
    }, 1000);
  }
  getEffortsIndicators(): void {
    var indicatorsData: any = [];
    this.indicators.forEach((indicator: any) => {
      // if(this.effieciency) indicatorsData.push(Math.round(indicator.EffortSum / 60));
      let indiHr = Math.floor(indicator.EffortSum / 60);
      let indiMin = (indicator.EffortSum % 60) / 60;
      indiHr = indiHr + indiMin;
      let indiHrTemp = Number(indiHr).toFixed(2);
      indiHr = +indiHrTemp;
      indiHr = indiHr > 19 ? 19 : indiHr; // effort can't be more than 19 for one day
      if(this.effieciency) indicatorsData.push(indiHr);
      else indicatorsData.push(indicator.count);
    });
    return indicatorsData;
  }

  getIndicators(): any[] {
    var indicatorsData = [];
    this.indicators.forEach((indicator: any) => {
      if(this.effieciency) indicatorsData.push(indicator && (indicator.Count != 0 || indicator.Count == 0) ? indicator.Count : indicator.count);
      else indicatorsData.push(indicator.count);
    });
    return indicatorsData;
  }

  getMaxCountFromIndicator(): any {
    let indicator = JSON.parse(JSON.stringify(this.indicators));
    indicator.sort((a: any, b: any) => {return b.Count - a.Count});
    return indicator[0].Count > 4 ? 5 : 2;
  }

  getActivityCount(): void {
    let count: any = [];
    this.indicators.forEach((indicator: any, index: number) => {
      count.push(`Activity: ${indicator.Count}`);
      if(index == 0) {
        count.push(`Activity: ${indicator.Count}`);
      }
    });
    console.log("count", count);
    return count;
  }
}
