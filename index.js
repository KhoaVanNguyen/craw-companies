var express = require("express");
// var mysql = require("mysql");
// var request = require("request");

var app = express();
var server = require('http').createServer(app);
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var bodyParser = require('body-parser');
app.jsonParser = bodyParser.json();
app.urlencodedParser = bodyParser.urlencoded({
  extended: true
});


// The function gets a list of objects ('dataList' arg), each one would be a single row in the future-to-be CSV file
// The headers to the columns would be sent in an array ('headers' args). It is taken as the second arg
function dataToCSV(dataList, headers) {
  var allObjects = [];
  // Pushing the headers, as the first arr in the 2-dimensional array 'allObjects' would be the first row
  allObjects.push(headers);

  //Now iterating through the list and build up an array that contains the data of every object in the list, in the same order of the headers
  dataList.forEach(function (object) {
    var arr = [];
    arr.push(object.name);
    arr.push(object.agent);
    arr.push(object.phone);
    arr.push(object.href_);
    arr.push(object.address);

    // Adding the array as additional element to the 2-dimensional array. It will evantually be converted to a single row
    allObjects.push(arr)
  });

  // Initializing the output in a new variable 'csvContent'
  var csvContent = "";

  // The code below takes two-dimensional array and converts it to be strctured as CSV
  // *** It can be taken apart from the function, if all you need is to convert an array to CSV
    allObjects.forEach(function (infoArray, index) {
      //  tách địa chỉ ra 
      // var dataString = infoArray.join(",");
      
      
      // không tách địa chỉ ra 
      let address = String(infoArray[4]).replace(/,/g, '.')
      var dataString = infoArray[0] + ',' + infoArray[1] + ',' + infoArray[2] + ',' + infoArray[3] + "," + address;
      csvContent += index < allObjects.length ? dataString + "\n" : dataString;
    });
  var BOM = "\uFEFF";
  var newContent = BOM + csvContent;


  return newContent;
}

app.get("/downloadcsv", function (req, res) {

  var url = 'mongodb://localhost:27017';
  const dbName = 'crawl';
  const collectionName = "companies";
  // Connect using MongoClient
  MongoClient.connect(url, function (err, client) {
    // Create a collection we want to drop later
    const col = client.db(dbName).collection('companies');
    // Insert a bunch of documents
    col.find({}).toArray(function (err, items) {
      // console.log(items[0]['_id'].toHexString());

      let listItem = [{}];
      items.forEach(function (object) {
        var item = {
          'name': object['name'],
          'agent': object['agent'],
          'phone': object['phone'] + "",
          'address': object['address'],
          'href_': object['href_']
        };
        listItem.push(item);
  
      });

      res.writeHead(200, {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename=danh_sach_cong_ty.csv'
      });
      res.end(dataToCSV(listItem, ["Tên cty", "Người đại diện", "Phone", "Địa chỉ"]), "utf8");
      client.close();
    });

    
  });
  
});


app.listen(3000, function () {
  console.log("listening on *:3000");
});
