import FlickrWall from '../lib/';
import {flickr_key, flickr_secret} from '../lib/config';
import fs from 'fs';
import wallpaper from 'wallpaper';

describe('FlickrWall instance test', () => {
  
  let flickrwall = new FlickrWall({flickr_key:flickr_key, flickr_secret:flickr_secret});
      
  it("Test config settgins", (done) => {
    let config = flickrwall.getConfig();
    if(config.flickr_key == undefined || config.flickr_key != flickr_key) 
      throw new Error("Error setting flickr_key");
    
    if(config.flickr_secret == undefined || config.flickr_secret != flickr_secret) 
      throw new Error("Error setting flickr_secret");
    
    if(config.image_size == undefined || config.image_size != "b") 
      throw new Error("Error setting flickr image size, default is 'b'");

    done();
  });

  it("Test before yesterday method", (done) => {
    
    let today = new Date();
    let beforeYesterday = flickrwall.beforeYesterday();
    if( (today.getDate() - beforeYesterday.getDate()) != 2) {
      throw new Error("Error getting before yesterday date");
    }
    done();
  });
  
  it("Test formatted date", (done) => {
    
    let beforeYesterday = flickrwall.beforeYesterday();
    let formattedDate = flickrwall.formattedDate(beforeYesterday);
    
    let testDate = new Date(formattedDate);
    if(testDate == "Invalid Date") {
      throw new Error("Error formatting date");
    }
    done();

  });

  it("Test temporary wallpaper folder is created", (done) => {
    
    let path = process.cwd()+"/wallpapers";
    if(fs.existsSync(path)) {
      fs.rmdirSync(path);
    }
    flickrwall.createWallpapersFolder();
    if(!fs.existsSync(path)) {
      throw new Error("Error creating temporary folder");
    }
    done();

  });

  it("Test getImageName method", (done) => {
      
    let test_name = "17025131975_9136d96f01_b.jpg";
    let photo = { 
      "id": "17025131975", 
      "owner": "95607642@N04", 
      "secret": "9136d96f01", 
      "server": "8717",
      "farm": 9, 
      "title": "Beauty", 
      "ispublic": 1, 
      "isfriend": 0,
      "isfamily": 0 
    }
    
    if(flickrwall.getImageName(photo) != test_name) {
      throw new Error("Error formatting image name");
    }
    done();
  });

  it("Test getImageUrl method", (done) => {
    let test_url = "https://farm9.staticflickr.com/8717/17025131975_9136d96f01_b.jpg";
    
    let photo = { 
      "id": "17025131975", 
      "owner": "95607642@N04", 
      "secret": "9136d96f01", 
      "server": "8717",
      "farm": 9, 
      "title": "Beauty", 
      "ispublic": 1, 
      "isfriend": 0,
      "isfamily": 0 
    }

    if(flickrwall.getImageUrl(photo) != test_url) {
      throw new Error("Error formatting image url");
    }
    done();
  });

  it("Test getInterestingPics method", (done) => {
    
    flickrwall.getInterestingPics( (photo) => {
      
      if(photo.id == undefined) throw new Error("Error getting photo id");
      if(photo.farm == undefined) throw new Error("Error getting photo farm");
      if(photo.server == undefined) throw new Error("Error getting photo server");
      if(photo.secret == undefined) throw new Error("Error getting photo secret");

      done();
      
    }, (err) => {
      throw new Error("Error getting pics from flickr");
    });    
  });
   
  
  it("Test downloadIMage method", (done) => {
    
    let photo = { 
      "id": "17025131975", 
      "owner": "95607642@N04", 
      "secret": "9136d96f01", 
      "server": "8717",
      "farm": 9, 
      "title": "Beauty", 
      "ispublic": 1, 
      "isfriend": 0,
      "isfamily": 0 
    }
 
    flickrwall.downloadImage(photo, (path) => {

      if(!fs.existsSync(path)) throw new Error("Error downloading image");
      done();

    }, (err) => { 
      throw new Error("Error downloading image");
    });
  });

  it("Test wallpaper is setted", (done) => {
      
    let image_path = process.cwd()+"/tests/wallpaper-test.jpg";
    flickrwall.setWallpaper(image_path, () => {

      wallpaper.get( (err, wallpaperPath) => {
        if(err) throw new Error(err.getMessage());
        if(wallpaperPath == undefined || wallpaperPath != image_path)
          throw new Error("Error setting desktop wallpaper");
          
        done();
      });
      
    }, (err) => {
      console.log(err);
      throw new Error("Error setting desktop wallpaper");
    });

  });
  
  it("Test whole process - setInterestingPicAsWallpaper method", (done) => {
    
    flickrwall.setInterestingPicAsWallpaper( (photo) => {

      let image_path = photo.image_path;
      
      wallpaper.get( (err, wallpaperPath) => {

        if(err) throw new Error(err.getMessage());
        if(wallpaperPath == undefined || wallpaperPath != image_path)
          throw new Error("Error setting desktop wallpaper");
         
        done();
      });

    }, (err) => {
      
      throw new Error(err.getMessage());
    });
    
  });
});
