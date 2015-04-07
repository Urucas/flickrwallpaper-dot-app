var FlickrWallApi = require('../node');
var config = require('../node/config');
var flickrwall = new FlickrWallApi(config);
var wallpaper;

var setBtt       = document.getElementById("setBtt");
var randomBtt    = document.getElementById("randomBtt");
var wallpaperImg = document.getElementById("wallpaperImg");
 
randomBtt.addEventListener('click', function() {
  flickrwall.getInterestingPics(function(photo){
    wallpaper = photo;
    wallpaperImg.src = flickrwall.getImageUrl(photo);

  }, function(err) {
    console.log(err.getMessage());
  });
});

setBtt.addEventListener("click", function(){
  if(wallpaper == undefined) {
    alert("Please get a random picture first");
    return;
  }
  try {
    flickrwall.setWallpaper(wallpaper, function(path){
      console.log(path);
    }, function(err) {
      console.log(err.getMessage());
    });
  }catch(e){}
});

