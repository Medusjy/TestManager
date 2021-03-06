import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { ProfileServiceService } from '../services/profile-service.service';
import { finalize } from 'rxjs/operators'
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'website-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css']
})
export class ProfilePage implements OnInit {

  name: any = "Ad"
  surname: any = "Soyad"
  //school: any = "Okulu"
  class: any = ""

  pPhoto = true
  picturePath: any
  uploadBar = false
  uploadData: any
  uploadPercent: Observable<number>;
  downloadURL: any;

  sArray: any[] = [];  

  constructor(private ps: ProfileServiceService, private storage: AngularFireStorage, private aut: AngularFireAuth) { }

  ngOnInit(): void {
    this.setProfileInfos();
  }

  setProfileInfos() {
    this.ps.getProfileInfos().then(t => {
      t.subscribe((s: any) => {
        this.name = s.data().name, this.surname = s.data().surname, this.class = s.data().class, this.picturePath = s.data().picture
      })
    });

    this.ps.getSavedQuestions().then(t => t.subscribe(s => { s.forEach(f => { this.sArray.push({ data: f.data(), id: f.id }) }) }));

    this.picturePath ? this.pPhoto = false : this.pPhoto = true;
  }

  saveChanges() {
    if (!this.name || !this.surname)
      alert("İsim Soyisim boş bırakılamaz!");
    else if (!this.class)
      alert("Sınıf boş bırakılamaz!");
    else {
      let data: string[] = [this.name, this.surname, this.class, this.picturePath];
      this.ps.setProfileInfos(data).then(t => { alert("Değişiklikler Kaydedildi.") });
    }
  }

  takeProfilePhoto() {
    alert("Yakında Sizlerle... :D");
  }

  deleteSQ(id: string) {
    this.ps.deleteSavedQuestion(id);
    this.sArray = [];
    this.ps.getSavedQuestions().then(t => t.subscribe(s => { s.forEach(f => { this.sArray.push({ data: f.data(), id: f.id }) }) }));
  }
 

  async upload(event: any) {
    const file = event.target.files[0];
    const fileName = "/users/" + await this.ps.getCurrentUid() + "/profilePicture/profileImg";
    const ref = this.storage.ref(fileName);
    const task = ref.put(file);

    this.uploadBar = true;
    this.uploadPercent = task.percentageChanges();
    this.uploadPercent.subscribe(s => this.uploadData = s.toFixed());

    task.snapshotChanges().pipe(finalize(() => ref.getDownloadURL().subscribe(s => this.downloadURL = s))).subscribe()
  }

  setProfilePhoto() {
    this.pPhoto = true;
    this.uploadBar = false;
    this.picturePath = this.downloadURL;
    this.ps.updateProfilePicturePath(this.picturePath);
  }

  logOut() {
    this.pPhoto = false;
    this.name = "Ad";
    this.surname = "Soyad";
    //this.school = "Okulu";
    this.class = "";
    this.aut.signOut();
    alert("Çıkış Yapıldı.")
  }
}
