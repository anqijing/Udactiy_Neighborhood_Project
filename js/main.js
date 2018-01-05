var map;
var infowindow;

// client id and secret for foursquare API
var client_id = '4VKSBJOLGRAD2A2BYEJW0PNNYB1DEMUNZPF4QCXA4SP0YWWN';
var client_secret = 'Y1LF3UAJBOS0MWX24UOD3YFCAUR3JUY2KG0TXDWF3SFTVLUS';

var locations = [
{
  title: "Burrito Libre", 
  location: {
    lat : 53.521702,
    lng : -113.520438
  }
},
{
  title: "Earls kitchen + Bar",
  location : {
   lat : 53.5227584,
   lng : -113.5204629
 }
},
{
  title: "Tim Hortons",
  location : {
   lat : 53.5204899,
   lng : -113.5205088
 }
},
{
  title: "Sherlock Holmes Pub",
  location : {
   lat : 53.5216542,
   lng : -113.5204366
 }
},
{
  title: "Remedy Cafe",
  location : {
   lat : 53.5219829,
   lng : -113.5129133
 }
},
{
  title: "Boston Pizza",
  location : {
   lat : 53.51837980000001,
   lng : -113.5114068
 }
},
{
  title: "Second Cup",
  location: {
    lat : 53.5196155,
    lng : -113.5207875
  }
}
];


// Model 
var Location = function(data){
  var self =this;
  // The boolean value indicates if the marker should be shown.
  // Default value is true
  self.show = ko.observable(true);
  self.title = data.title;
  self.location = data.location;
  self.marker = new google.maps.Marker({
    map: map,
    position: data.location,
    title: data.title,
    animation: google.maps.Animation.DROP
  });

  self.content = '';

  self.marker.setMap(map);

}

// ViewModel
var ViewModel = function() {

  var self = this;
  // create map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 53.521322, lng: -113.520044},
    zoom: 15
  });

  infowindow = new google.maps.InfoWindow();

  // this.markers = ko.observableArray();
  self.locationList = ko.observableArray();

  this.populateContent = function(location){
    populateInfoWindow(location.marker);
  }

  this.showInfoWindow = function(location){
    if (infowindow.marker != location.marker){
      // clear content
      infowindow.setContent('');
      self.populateContent(location);
      infowindow.open(map, location.marker);
    }
    //console.log(infowindow.content)
    
  }

  locations.forEach(function(item){
    var location = new Location(item);
    // add Listener to marker
    location.marker.addListener('click',function(){
      self.showInfoWindow(location);
    });
    self.locationList.push(location);
  });


  // Show information window 
  self.showInfo = function(item){
    populateInfoWindow(item.marker);
  }

  // Query value
  self.query = ko.observable("");
  // Get selectedItem based on the value of query. 
  self.selectedItem = ko.computed(function(){
    var filter = self.query().toLowerCase();
    if (!filter) {
      ko.utils.arrayForEach(self.locationList(), function(item) {
        item.show(true);
      });
      return self.locationList();
    } else {
      return ko.utils.arrayFilter(self.locationList(), function(item) {
        var selected = item.title.toLowerCase().indexOf(filter) >= 0;
        item.show(selected);
        console.log(item.show());
        return selected;        
      });    
    }
  }, self);

  // If the show value of the item in this.locationList is ture, set marker
  // otherwise, set marker null.
  self.showmarker = ko.computed(function(){
    ko.utils.arrayForEach(self.locationList(), function(item) {
      if(item.show()==true){
        item.marker.setMap(map);
      }
      else{
        item.marker.setMap(null);
      }
    });
  }, self);

};

  // Populate infomation window
  function populateInfoWindow (marker) {
    var content= '<h4>'+marker.title+'</h4>' ;
    var request_url_1 = "https://api.foursquare.com/v2/venues/search?"+"ll="+marker.getPosition().lat()+","+marker.getPosition().lng()+
    "&limit=1&client_id="+client_id+"&client_secret="+client_secret+"&v=20180201";
    console.log(request_url_1);
    // two getJSON calls, the second one depends on the result of the first getJSON call 
    $.when($.getJSON(request_url_1)).then(function( data, xhr, settings ) {
      if (typeof data.response.venues[0].contact.formattedPhone != 'undefined') {
        content = content + '<br> <p> Phone: ' + data.response.venues[0].contact.formattedPhone + '</p>'
      }
      if (typeof data.response.venues[0].location.formattedAddress != 'undefined') {
        content = content + '<br> Address: '+ data.response.venues[0].location.formattedAddress+ '</p>';
      }
      console.log(data.response.venues[0].contact);
      // generate the second request url based on the foursquare id from the first call
      var request_url_2 ='https://api.foursquare.com/v2/venues/'+ data.response.venues[0].id +'/photos?'+ "limit=1&client_id="+client_id+"&client_secret="+client_secret+"&v=20180201"; 
      
      $.getJSON(request_url_2).done(function(result2){
        if (typeof result2.response.photos.items[0]!= 'undefined') {
          var photo_url = result2.response.photos.items[0].prefix+"200x200"+result2.response.photos.items[0].suffix;
          content = content + '<br>' +'<img src=' + photo_url + '>' ;
        }
        console.log(content);
        infowindow.setContent(content);
      //return content;
      //infowindow.setContent(content);
    }).fail(function() {
        //infowindow.setContent(content);
        alert("Something wrong with Foursquare API call. Please refresh the page and try again.");
        //return content;
      });

  });
}

function initmap(){
    ko.applyBindings(new ViewModel());
}
