var FlickrWallApi = require('../node');
var config = require('../node/config');
var shell = require('shell');
var flickrwall = new FlickrWallApi(config);
var wallpaper;

var setBtt       = document.getElementById("setBtt");
var randomBtt    = document.getElementById("randomBtt");
var githubBtt    = document.getElementById("githubBtt");
var wallpaperImg = document.getElementById("wallpaperImg");

flickrwall.currentWallpaper(function(path){
  console.log(path);
  wallpaperImg.src = path;
}, function(err) {
  console.log(err.getMessage()); 
});

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
    flickrwall.downloadImage(wallpaper, function(path){
    flickrwall.setWallpaper(path, function() {
    }, function(err) { console.log(err.getMessage());});
    }, function(err) { console.log(err.getMessage());});
  }catch(e){
    console.log(e.getMessage());  
  }
});

githubBtt.addEventListener("click", function(){
  shell.open("https://github.com/Urucas/flickrwallpaper-dot-app");
});
