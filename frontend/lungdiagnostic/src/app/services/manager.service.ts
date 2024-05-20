import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private serverUrl ='http://127.0.0.1:8000/api/accounts/'; // Replace with your actual API server URL

  constructor(private http: HttpClient) {}

  getAllMedicines(medicineId: string):Observable<any> {
    const url = `${this.serverUrl}medicines/?medicine_id=${medicineId}`;
    return this.http.get(url);
  }

  updateMedicine(id: string, data: any): Observable<any> {
    const url = `${this.serverUrl}medicines/${id}/`;
    return this.http.put(url, data);
  }
  getMedicine(id: string ): Observable<any> {
    const url = `${this.serverUrl}medicines/${id}/`;
    return this.http.get(url);
  }
  deleteMedicine(id: string): Observable<any> {
    const url = `${this.serverUrl}medicines/${id}/`;
    return this.http.delete(url);
  }
}