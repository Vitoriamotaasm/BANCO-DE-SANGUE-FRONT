import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  data: any[] = [];
  candidatesPerState: { [key: string]: number } = {};
  averageIMCByAgeGroup: { [key: string]: number } = {};
  obesityPercentage: { men: number; women: number } = { men: 0, women: 0 };
  averageAgeByBloodType: { [key: string]: number } = {};
  possibleDonors: { [key: string]: number } = {};
Object: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getData().subscribe((res: any) => {
      this.data = res;
      this.processData();
    });
  }

  processData(): void {
    this.calculateCandidatesPerState();
    this.calculateAverageIMCByAgeGroup();
    this.calculateObesityPercentage();
    this.calculateAverageAgeByBloodType();
    this.calculatePossibleDonors();
  }

  calculateCandidatesPerState(): void {
    this.candidatesPerState = {};
    this.data.forEach((candidate) => {
      const state = candidate.estado;
      this.candidatesPerState[state] = (this.candidatesPerState[state] || 0) + 1;
    });
  }

  calculateAverageIMCByAgeGroup(): void {
    const ageGroups: { [key: string]: { totalIMC: number; count: number } } = {};
    this.data.forEach((candidate) => {
      const ageGroup = Math.floor(candidate.idade / 10) * 10;
      const imc = candidate.peso / (candidate.altura * candidate.altura);
      if (!ageGroups[ageGroup]) {
        ageGroups[ageGroup] = { totalIMC: 0, count: 0 };
      }
      ageGroups[ageGroup].totalIMC += imc;
      ageGroups[ageGroup].count++;
    });
    for (const group in ageGroups) {
      this.averageIMCByAgeGroup[group] = ageGroups[group].totalIMC / ageGroups[group].count;
    }
  }

  calculateObesityPercentage(): void {
    let obeseMen = 0;
    let totalMen = 0;
    let obeseWomen = 0;
    let totalWomen = 0;
    this.data.forEach((candidate) => {
      const imc = candidate.peso / (candidate.altura * candidate.altura);
      if (candidate.sexo === 'M') {
        totalMen++;
        if (imc > 30) obeseMen++;
      } else if (candidate.sexo === 'F') {
        totalWomen++;
        if (imc > 30) obeseWomen++;
      }
    });
    this.obesityPercentage.men = (obeseMen / totalMen) * 100;
    this.obesityPercentage.women = (obeseWomen / totalWomen) * 100;
  }

  calculateAverageAgeByBloodType(): void {
    const bloodTypeAges: { [key: string]: { totalAge: number; count: number } } = {};
    this.data.forEach((candidate) => {
      const bloodType = candidate.tipo_sanguineo;
      if (!bloodTypeAges[bloodType]) {
        bloodTypeAges[bloodType] = { totalAge: 0, count: 0 };
      }
      bloodTypeAges[bloodType].totalAge += candidate.idade;
      bloodTypeAges[bloodType].count++;
    });
    for (const bloodType in bloodTypeAges) {
      this.averageAgeByBloodType[bloodType] =
        bloodTypeAges[bloodType].totalAge / bloodTypeAges[bloodType].count;
    }
  }

  calculatePossibleDonors(): void {
    const bloodTypeCompatibility: { [key: string]: string[] } = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-'],
    };
    this.possibleDonors = {};
    this.data.forEach((candidate) => {
      const bloodType = candidate.tipo_sanguineo;
      if (!this.possibleDonors[bloodType]) {
        this.possibleDonors[bloodType] = 0;
      }
      this.possibleDonors[bloodType]++;
    });
  }
}