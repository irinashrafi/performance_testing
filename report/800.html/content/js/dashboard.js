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

    var data = {"OkPercent": 99.328125, "KoPercent": 0.671875};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.176796875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.055625, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.08375, 500, 1500, "Create Student"], "isController": false}, {"data": [0.15875, 500, 1500, "Get Specific Student"], "isController": false}, {"data": [0.03125, 500, 1500, "Update Student"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.055, 500, 1500, "DELETE Student"], "isController": false}, {"data": [0.02875, 500, 1500, "Get Student"], "isController": false}, {"data": [0.00125, 500, 1500, "FINAL STUDENT DETAILS"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6400, 43, 0.671875, 16724.058125000036, 0, 94547, 7908.0, 49002.600000000064, 71744.6, 85731.93, 39.081344153980496, 67.9689074321725, 9.330277336331605], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 800, 11, 1.375, 16035.728750000004, 134, 77381, 20319.5, 24440.6, 24548.9, 24647.94, 5.1684594760474205, 1.7952573327518817, 2.7765769353458025], "isController": false}, {"data": ["Create Student", 800, 4, 0.5, 6698.854999999997, 398, 17795, 7189.0, 10889.7, 13656.299999999997, 16042.85, 40.59471253869183, 19.193687522200232, 12.622418429999492], "isController": false}, {"data": ["Get Specific Student", 800, 4, 0.5, 6043.502500000003, 46, 21254, 5661.0, 11886.7, 12594.9, 14527.6, 20.93747546389594, 9.973210663717971, 3.376474619853961], "isController": false}, {"data": ["Update Student", 800, 13, 1.625, 32118.812500000055, 158, 84731, 22923.0, 71462.0, 78974.65, 83453.04000000001, 4.968728067723764, 1.7732451558783158, 1.6644571839267857], "isController": false}, {"data": ["Debug Sampler", 800, 0, 0.0, 0.3525000000000001, 0, 14, 0.0, 1.0, 1.0, 11.0, 42.8380187416332, 13.49632906626506, 0.0], "isController": false}, {"data": ["DELETE Student", 800, 6, 0.75, 18217.043750000048, 68, 84994, 3395.5, 75895.6, 82429.89999999994, 84839.77, 4.984206296298604, 1.6609113037126106, 1.223345204570517], "isController": false}, {"data": ["Get Student", 800, 0, 0.0, 13720.413749999989, 287, 49572, 14278.0, 23868.6, 25535.049999999992, 29582.08, 10.294287956969876, 111.84091675861826, 1.5883764621105865], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 800, 5, 0.625, 40957.756250000006, 42, 94547, 31639.0, 82893.7, 88953.95, 94237.29, 4.9431231888087686, 3.6939406867697304, 0.8194409366291607], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 4, 9.30232558139535, 0.0625], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 27, 62.7906976744186, 0.421875], "isController": false}, {"data": ["405/Method Not Allowed", 8, 18.6046511627907, 0.125], "isController": false}, {"data": ["404/Not Found", 4, 9.30232558139535, 0.0625], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6400, 43, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 27, "405/Method Not Allowed", 8, "400/Bad Request", 4, "404/Not Found", 4, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 800, 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 7, "400/Bad Request", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Create Student", 800, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Specific Student", 800, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update Student", 800, 13, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 9, "405/Method Not Allowed", 4, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["DELETE Student", 800, 6, "405/Method Not Allowed", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 800, 5, "404/Not Found", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
