import { Component, OnInit,Input } from '@angular/core';
import {ChartDataSets,ChartOptions}from "chart.js"
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() title: string;
  constructor() { }
  barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  ];
  barChartOptions: ChartOptions = {
    responsive: true,
  };
  ngOnInit(): void {
  }

}
