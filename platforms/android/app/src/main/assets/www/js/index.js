/*
Dan Ellis 2020
 */


var data = {}

var app = {
  macAddress: undefined, //"AA:BB:CC:DD:EE:FF", // get your mac address from bluetoothSerial.list
  chars: "",
  data:{},

  /*
      Application constructor
   */
  initialize: function() {
    app.display('initialising');
    this.bindEvents();
    console.log("Starting SimpleSerial app");
  },
  /*
      bind any events that are required on startup to listeners:
  */
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    connectButton.addEventListener('touchend', app.manageConnection, false);
  },

  /*
      this runs when the device is ready for user interaction:
  */
  onDeviceReady: function() {
    // check to see if Bluetooth is turned on.
    // this function is called only
    //if isEnabled(), below, returns success:
    var listPorts = function() {
      // list the available BT ports:
      bluetoothSerial.list(
        function(results) {
          results = results.filter(d => {
            return d.class === 7936
          })
          /// add menu
          var ddl = document.getElementById("addr");
          results.forEach(function(d) {
            var option = document.createElement("OPTION");
            option.innerHTML = d.name;
            option.value = d.id;
            ddl.options.add(option);
          });
          app.macAddress = ddl.value
          ddl.onchange = function(e) {
            app.macAddress = ddl.value
          };
        },
        function(error) {
          app.display(JSON.stringify(error));
        }
      );
    }

    // if isEnabled returns failure, this function is called:
    var notEnabled = function() {
      app.display("Bluetooth is not enabled.")
    }

    // check if Bluetooth is on:
    bluetoothSerial.isEnabled(
      listPorts,
      notEnabled
    );




    navigator.geolocation.watchPosition(app.onSuccess, app.showError,
      {enableHighAccuracy: true,
       timeout: 5000,
       maximumAge: 30000}
    );


  },

  onSuccess:function(position) {

      this.data['phone']=[new Date().toLocaleString(),position.coords.latitude ,position.coords.longitude,parseInt(position.coords.altitude),parseInt(position.coords.accuracy)]

   },

  /*
      Connects if not connected, and disconnects if connected:
  */
  manageConnection: function() {

    // connect() will get called only if isConnected() (below)
    // returns failure. In other words, if not connected, then connect:
    var connect = function() {
      // if not connected, do this:
      // clear the screen and display an attempt to connect
      app.clear();
      app.clear('res');
      app.display("Attempting to connect. " +
        "Make sure the serial port is open on the target device.");
      // attempt to connect:
      bluetoothSerial.connect(
        app.macAddress, // device to connect to
        app.openPort, // start listening if you succeed
        app.showError // show the error if you fail
      );
    };

    // disconnect() will get called only if isConnected() (below)
    // returns success  In other words, if  connected, then disconnect:
    var disconnect = function() {
      app.display("attempting to disconnect");
      // if connected, do this:
      bluetoothSerial.disconnect(
        app.closePort, // stop listening to the port
        app.showError // show the error if you fail
      );
    };

    // here's the real action of the manageConnection function:
    bluetoothSerial.isConnected(disconnect, connect);
  },
  /*
      subscribes to a Bluetooth serial listener for newline
      and changes the button:
  */
  openPort: function() {
    // if you get a good Bluetooth serial connection:
    app.display("Connected to: " + app.macAddress);
    // change the button's name:
    connectButton.innerHTML = "Disconnect";
    // set up a listener to listen for newlines
    // and display any new data that's come in since
    // the last newline:
    bluetoothSerial.subscribe('\n', app.recieve)
  },

  /*
      unsubscribes from any Bluetooth serial listener and changes the button:
  */
  closePort: function() {
    // if you get a good Bluetooth serial connection:
    app.display("Disconnected from: " + app.macAddress);
    // change the button's name:
    connectButton.innerHTML = "Connect";
    // unsubscribe from listening:
    bluetoothSerial.unsubscribe(
      function(data) {
        app.display(data);
      },
      app.showError
    );
  },
  /*
      appends @error to the message div:
  */
  showError: function(error) {
    app.display('error:'+error);
  },

  /*
      appends @message to the message div:
  */
  display: function(message,id="message") {
    var display = document.getElementById(id), // the message div
      lineBreak = document.createElement("br"), // a line break
      label = document.createTextNode(message); // create the label

    display.appendChild(lineBreak); // add a line break
    display.appendChild(label); // add the message node
  },
  /*
      clears the message div:
  */
  clear: function(id="message") {
    var display = document.getElementById(id);
    display.innerHTML = "";
  },

  recieve: function(rdata) {
    app.clear('res');


    app.display('PHONE','res');

    'Date Latitude Longitude Altitude Accuracy'.split(' ').forEach((d,i)=>{
      app.display(d+': '+this.data['phone'][i],'res')
    })

    app.display('<br> SENSOR','res');

    rdata=rdata.split('_')
    'GPS Latitude Longitude Altitude NSat PM1 PM2 PM10'.split(' ').forEach((d,i)=>{
      app.display(d+': '+rdata[i],'res')
    })


/* correct lat lon
    add RH and T
    map?
    */




    // app.display(JSON.stringify(rdata),'res');

    //app.display(''+app.position.coords.longitude +'_'+app.position.coords.latitude );
    app.display(new Date().toLocaleString(),'res');
    //lon * 111319.488
    //lat * 111111 metres
  },
}; // end of app







//
//
// //map
//    let mapContainer = document.getElementById('mapcontainer')
//    // create leaflet map with attributions
//    let map = L.map(mapContainer)//.setView([34.1, -118.25], 12);
// alert(map)
//
//    let osmLayer = L.tileLayer(
//      // 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}@2x.png')
//      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
//      {
//        attribution:
//          // '&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>',
//          'CEMAC',
//        detectRetina: false,
//        maxZoom: 18,
//        minZoom: 10,
//        noWrap: false,
//        subdomains: 'abc'
//      }
//    ).addTo(map);
//
// alert(osmLayer)
//
//
// map.locate({setView: true, maxZoom: 16});
//
//
// function onLocationFound(e) {
//     var radius = e.accuracy;
//
//     L.marker(e.latlng).addTo(map)
//         .bindPopup("You are within " + radius + " meters from this point").openPopup();
//
//     L.circle(e.latlng, radius).addTo(map);
// }
//
// map.on('locationfound', onLocationFound);
// function onLocationError(e) {
//     alert(e.message);
// }
//
// map.on('locationerror', onLocationError);
//
//









//
//     //recorder
//     this.file = "";
//     this.position = "";
//     this.oldpos="";
//
//     window.resolveLocalFileSystemURL(
//       cordova.file.externalDataDirectory,
//       function(dir) {
//         //alert("got main dir" + JSON.stringify(dir));
//         dir.getFile("sensortest.csv", { create: true, exclusive: false }, function(
//           file
//         ) {
//           //alert("got the file"+ JSON.stringify(file));
//           this.file = file;
//         });
//       }
//     );
//
//
//
//
//
//
//
//
//
// function save(str, file) {
//   if (!file) return;
//   //alert(str+JSON.stringify(writer))
//   //console.log("Writing "+log);
//   file.createWriter(function(writer) {
//     writer.seek(writer.length);
//     var blob = new Blob([str], { type: "text/plain" });
//     writer.write(blob);
//     //alert("ok, in theory i worked");
//   }, this.onError);
// }
