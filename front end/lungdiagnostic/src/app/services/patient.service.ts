import { Injectable } from '@angular/core';
import {HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../shared/medicine_model';
@Injectable({
  providedIn: 'root'
})
export class PatientService {
  patient:any;
  private apiUrl ='http://127.0.0.1:8000/api/accounts/'
  constructor(private http: HttpClient) {}

  getPatients(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/patients/`);
  }

 

  getPatientById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}patients/curd/${id}/`);
  }

  updatePatient(id: number, patient: any,medicine:User): Observable<any> {
    let params = new HttpParams()
    .set('meidcine',medicine.id)
    return this.http.put<any>(`${this.apiUrl}patients/curd/${id}/`, patient,{ params: params });
  }
  upload_image(id:string,scan: any,medicine:User): Observable<any> {
    let params = new HttpParams()
    .set('meidcine',medicine.id)
    return this.http.post<any>(`${this.apiUrl}patients/analyses/${id}/`, scan,{ params: params });
  }
 get_analyse(id:string){
  return this.http.get<any>(`${this.apiUrl}patients/analyses/${id}/`)
 }
  deletePatient(id: string,medicine:User): Observable<any> {
    let params = new HttpParams()
    .set('meidcine',medicine.id)
    return this.http.delete<any>(`${this.apiUrl}patients/curd/${id}/`,{ params: params });
  }

  getPatientsWithSameMedicine(medicineId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}patients/same_medicine/?medicine_id=${medicineId}`);
  }
  get_all_analyse(id: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}patient/analysesPatient/?_id=${id}`);
  }
 all_analyse(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}patient/allAnalyse/`);
 }
}
