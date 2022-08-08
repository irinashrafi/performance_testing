/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.4125, "KoPercent": 1.5875};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1659375, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.015, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.0535, 500, 1500, "Create Student"], "isController": false}, {"data": [0.117, 500, 1500, "Get Specific Student"], "isController": false}, {"data": [0.014, 500, 1500, "Update Student"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.1085, 500, 1500, "DELETE Student"], "isController": false}, {"data": [0.017, 500, 1500, "Get Student"], "isController": false}, {"data": [0.0025, 500, 1500, "FINAL STUDENT DETAILS"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8000, 127, 1.5875, 23622.28412499996, 0, 327306, 10759.0, 69793.8, 94866.74999999997, 113776.94, 22.49370879082257, 39.474899305506746, 5.356869060255023], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 1000, 30, 3.0, 28118.59200000001, 74, 327306, 35178.0, 49591.9, 50068.65, 82271.10000000024, 2.8422737052732705, 1.008835074581262, 1.5231755889191116], "isController": false}, {"data": ["Create Student", 1000, 19, 1.9, 11382.986999999996, 444, 318885, 10310.5, 17760.6, 19356.949999999997, 26393.870000000017, 3.133735287112827, 1.596472873212204, 0.960685723955526], "isController": false}, {"data": ["Get Specific Student", 1000, 13, 1.3, 7276.526999999997, 104, 317352, 6552.0, 10230.8, 10601.0, 15151.210000000006, 3.1456234940327525, 2.0246049932447736, 0.5028973404146561], "isController": false}, {"data": ["Update Student", 1000, 22, 2.2, 46377.93999999997, 68, 113991, 44444.0, 93383.2, 103950.2, 112225.43000000001, 2.865879696102117, 0.9611555979228105, 0.9674946775240519], "isController": false}, {"data": ["Debug Sampler", 1000, 0, 0.0, 0.5800000000000002, 0, 21, 0.0, 1.0, 1.0, 16.0, 3.150817006849876, 0.9915073419944042, 0.0], "isController": false}, {"data": ["DELETE Student", 1000, 20, 2.0, 29535.696999999996, 68, 114242, 3343.0, 105938.9, 113522.45, 114161.99, 2.8763900154749784, 0.949284547421604, 0.7067801501403678], "isController": false}, {"data": ["Get Student", 1000, 3, 0.3, 12502.223000000013, 102, 65571, 12907.5, 18409.5, 22381.499999999993, 44825.73, 3.1454849708728094, 34.00041328723625, 0.48388248586104504], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 1000, 20, 2.0, 53783.727, 72, 118621, 50915.0, 103241.09999999999, 110195.1, 116918.72, 2.833696046427276, 2.102798943421008, 0.46959933397516546], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 19, 14.960629921259843, 0.2375], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 36, 28.346456692913385, 0.45], "isController": false}, {"data": ["405/Method Not Allowed", 38, 29.921259842519685, 0.475], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, 1.5748031496062993, 0.025], "isController": false}, {"data": ["404/Not Found", 19, 14.960629921259843, 0.2375], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 13, 10.236220472440944, 0.1625], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8000, 127, "405/Method Not Allowed", 38, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 36, "400/Bad Request", 19, "404/Not Found", 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 13], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 1000, 30, "400/Bad Request", 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 9, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 2, "", "", "", ""], "isController": false}, {"data": ["Create Student", 1000, 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 9, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 8, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, "", "", "", ""], "isController": false}, {"data": ["Get Specific Student", 1000, 13, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Update Student", 1000, 22, "405/Method Not Allowed", 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["DELETE Student", 1000, 20, "405/Method Not Allowed", 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Student", 1000, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 1000, 20, "404/Not Found", 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
