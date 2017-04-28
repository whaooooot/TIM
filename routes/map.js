module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();

  //구글지도 api
   app.get('/map', function(req, res){
   var output=`
   <!DOCTYPE html>
<html>

<body>

   <h1>Tim Google Map</h1>

   <div id="googleMap" style="width:60%;height:600px;"></div> <!--중심에서크기가로세로-->

   <script>
       function myMap() {
           var mapProp = {
               center: new google.maps.LatLng(51.508742, -0.120850), <!--런던기준중심-->
               zoom: 5,
           };
           var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
       }
   </script>

   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDq-v531pl0t0Ttfz8ABn3nckwT373jaRA&callback=myMap"></script>

</body>

</html>
      `
      res.send(output);
      });

  return route;

};
