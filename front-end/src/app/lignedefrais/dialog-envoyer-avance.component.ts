import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LignedefraisService } from './lignedefrais.service';

import { ILignedefrais } from './lignedefrais.interface';


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './dialog-envoyer-avance.html',
  styleUrls: ['./lignedefrais.component.css']
})
export class DialogEnvoyerAvance implements OnInit{
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource;
  displayedColumns: string[] = ['mission', 'libelle', 'montant_estime', 'montant_avance'];
  _avanceValid:boolean = true;

  constructor(
    public dialogRef: MatDialogRef<DialogEnvoyerAvance>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private lignedefraisService : LignedefraisService) {}
    
  ngOnInit() {
    console.log(this.data)
    console.log('avance')
    this.dataSource = new MatTableDataSource<ILignedefrais>(this.data.liste);
    this.dataSource.paginator = this.paginator;
  }

  onClick(): void {
    this.data.liste.forEach(element => {
      console.log(element);
      this.lignedefraisService.deleteLignedefrais({id : element.id_ldf});
      this.lignedefraisService.createAvance({
        id_ndf : this.data.ndf,
        id_mission : element.id_mission,
        libelle : element.libelle,
        montant_estime : element.montant_estime,
        montant_avance : element.montant_avance,
        commentaire : element.commentaire
      });
    });
  }

  onChange() {
    for(var i=0; i < this.data.liste.length; i++) {
      if(!this.montantValid(this.data.liste[i].montant_avance)
        || this.data.liste[i].montant_avance > this.data.liste[i].montant_estime) {
        this._avanceValid = false;
        break;
      }
      this._avanceValid = true;
    }
  }
  
  montantValid(montant : String) : boolean {
    if(String(montant).match('\\d+(\.\\d{1,2})?'))
      return (montant != '') && (String(montant).match('\\d+(\.\\d{1,2})?')[0] == montant);
    else
      return false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}