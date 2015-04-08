// es6 runtime requirements
require('babel/polyfill');
import wallpaper from 'wallpaper';
import request from 'request';
import fs from 'fs';

export default class FlickrWall{
  
  constructor(config) {
    this.config = config;
    this.config.image_size = config.image_size || "b";
    this.config.per_page = (~~config.per_page) || 50;
  }
    
  getConfig() {
    return this.config;
  }

  beforeYesterday() {
    let today     = new Date();
    let beforeYesterday = new Date();
    beforeYesterday.setDate(today.getDate()-2);
    return beforeYesterday;
  }

  createWallpapersFolder() {
    let path = process.cwd()+"/wallpapers";
    try { fs.mkdirSync(path); }catch(e){};
  }

  formattedDate(date) {
    return [
      date.getFullYear(),
      (date.getMonth()+1) < 10 ? "0"+(date.getMonth()+1) : (date.getMonth()+1),
      (date.getDate()) < 10 ? "0"+(date.getDate()) : date.getDate()
    ].join("-");
  }

  getImageUrl(photo) {
    // https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
    return ["https://farm",photo.farm,".staticflickr.com/",photo.server,"/",photo.id,"_",photo.secret,"_"+this.config.image_size+".jpg"].join("");
  }

  getImageName(photo) {
    return [photo.id,"_",photo.secret,"_"+this.config.image_size+".jpg"].join("");
  }
 
  getRandomPhoto(photos) {
    return photos[Math.floor(Math.random()*photos.length)];
  }

  getInterestingPics(cb, fail) {
    
    let self = this;

    let beforeYesterday = this.beforeYesterday();
    let formattedDate = this.formattedDate(beforeYesterday);
    
    let url = "https://api.flickr.com/services/rest/";
    let qs  = {
      method: "flickr.interestingness.getList",
      api_key: this.config.flickr_key,
      date: formattedDate,
      extras: "tags:nature",
      per_page: self.config.per_page,
      page: 0,
      format: "json",
      nojsoncallback:1
    }

    request.get({url:url, qs:qs}, (error, response, body) => {
        
      if(error) return fail(error);
      if(response.statusCode != 200) return fail(body);
        
      try { var jsonResponse = JSON.parse(body); }
      catch(e){ return fail(new Error("Error parsing response")); }
        
      if(jsonResponse.stat != "ok") return fail(jsonResponse);

      try {
        
        let photos = jsonResponse.photos.photo;
        var photo = self.getRandomPhoto(photos);
        
        if(photo == undefined) return fail("Error parsing response");

        return cb(photo);
        
      }catch(e) { return fail(jsonResponse); }

    });
  
  }

  downloadImage(photo, cb, fail) {

    let self = this;
    let filename = self.getImageName(photo);
    let url      = self.getImageUrl(photo);

    self.createWallpapersFolder();
    let path = process.cwd()+"/wallpapers/"+filename;
    
    request.head(url, (error, response, body) => {
         
      if(error) return fail(error.getMessage);
      if(response.statusCode != 200) return fail(body);

      let type = response.headers['content-type'];
      if(type != 'image/jpeg') return fail("Response content-type is not image/jpeg");
        
      request(url).pipe(fs.createWriteStream(path)).on('close', (e) => {
        return cb(path);
      });
    });
  }
 
  currentWallpaper(cb, fail) {
    
    wallpaper.get( (err, path) => {
      if(err) return fail(err);
      cb(path);
    });
  }

  setWallpaper(image_path, cb, fail) {
    
    if(!fs.existsSync(image_path))
      return fail("Image path doesnt exists");

    wallpaper.set(image_path, (err) => {
      if(err) return fail(err.getMessage());
      cb();
    });
  }

  setInterestingPicAsWallpaper(cb, fail) {
    
    let self = this;
    
    // get photo from flickr
    self.getInterestingPics( (photo) =>{
      
    // download the photo from flickr
    self.downloadImage(photo, (image_path) => {
        
    photo.image_path = image_path;
    
    // set the photo as wallpaper
    self.setWallpaper(image_path, () => {
      cb(photo);
          
    }, (err) => { fail(err); });
    }, (err) => { fail(err); });
    }, (err) => { fail(err); });
    
  }
  
}
