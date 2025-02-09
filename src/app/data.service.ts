import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
private dataUrl = 'assets/data.json' //nao esquecer de adicionar o json

  constructor(private http: HttpClient) {}

  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(this.dataUrl);
  }
}

getCandidatesByState(): Observable<{ [key: string]: number }> {
  return this.getCandidates().pipe(
    map(candidates => {
      const states: { [key: string]: number } = {};
      candidates.forEach(candidate => {
        const state = candidate.estado;
        states[state] = (states[state] || 0) + 1;
      });
      return states;
      });
    })
  )
}

getAverageIMCByAgeGroup(): Observable<{ [key: string]: number }> {
  return this.getCandidates().pipe(
    map(candidates => {
      const ageGroups: { [key: string]: { totalIMC: number, count: number } } = {};
      candidates.forEach(candidate => {
        const age = candidate.idade;
        const ageGroup = `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 10}`;
        const imc = candidate.peso / Math.pow(candidate.altura, 2);
        if (!ageGroups[ageGroup]) {
          ageGroups[ageGroup] = { totalIMC: 0, count: 0 };
        }
        ageGroups[ageGroup].totalIMC += imc;
        ageGroups[ageGroup].count += 1;
      });
      const averageIMC: { [key: string]: number } = {};
      Object.keys(ageGroups).forEach(key => {
        averageIMC[key] = ageGroups[key].totalIMC / ageGroups[key].count;
      });
      return averageIMC;
    })
  );
}

getObesityPercentageByGender(): Observable<{ male: number, female: number }> {
  return this.getCandidates().pipe(
    map(candidates => {
      let maleObesityCount = 0;
      let femaleObesityCount = 0;
      let maleCount = 0;
      let femaleCount = 0;
      candidates.forEach(candidate => {
        const imc = candidate.peso / Math.pow(candidate.altura, 2);
        if (candidate.genero === 'Masculino') {
          maleCount++;
          if (imc > 30) maleObesityCount++;
        } else if (candidate.genero === 'Feminino') {
          femaleCount++;
          if (imc > 30) femaleObesityCount++;
        }
      });
      return {
        male: (maleObesityCount / maleCount) * 100,
        female: (femaleObesityCount / femaleCount) * 100
      };
    })
  );
}

getAverageAgeByBloodType(): Observable<{ [key: string]: number }> {
  return this.getCandidates().pipe(
    map(candidates => {
      const bloodTypes: { [key: string]: { totalAge: number, count: number } } = {};
      candidates.forEach(candidate => {
        const bloodType = candidate.tipo_sanguineo;
        if (!bloodTypes[bloodType]) {
          bloodTypes[bloodType] = { totalAge: 0, count: 0 };
        }
        bloodTypes[bloodType].totalAge += candidate.idade;
        bloodTypes[bloodType].count += 1;
      });
      const averageAge: { [key: string]: number } = {};
      Object.keys(bloodTypes).forEach(key => {
        averageAge[key] = bloodTypes[key].totalAge / bloodTypes[key].count;
      });
      return averageAge;
    })
  );
}

getPossibleDonorsByBloodType(): Observable<{ [key: string]: number }> {
  return this.getCandidates().pipe(
    map(candidates => {
      const bloodTypeCompatibility: { [key: string]: string[] } = {
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'A-': ['A-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'B-': ['B-', 'O-'],
        'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB-': ['A-', 'B-', 'AB-', 'O-'],
        'O+': ['O+', 'O-'],
        'O-': ['O-']
      };
      const possibleDonors: { [key: string]: number } = {};
      candidates.forEach(candidate => {
        const bloodType = candidate.tipo_sanguineo;
        if (!possibleDonors[bloodType]) {
          possibleDonors[bloodType] = 0;
        }
        possibleDonors[bloodType] += 1;
      });
      const result: { [key: string]: number } = {};
      Object.keys(bloodTypeCompatibility).forEach(key => {
        result[key] = bloodTypeCompatibility[key].reduce((acc, type) => acc + (possibleDonors[type] || 0), 0);
      });
      return result;
      })
    );
  }
}
