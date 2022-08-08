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

    var data = {"OkPercent": 99.44642857142857, "KoPercent": 0.5535714285714286};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.18116071428571429, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.04214285714285714, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.10642857142857143, 500, 1500, "Create Student"], "isController": false}, {"data": [0.1692857142857143, 500, 1500, "Get Specific Student"], "isController": false}, {"data": [0.03142857142857143, 500, 1500, "Update Student"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.06428571428571428, 500, 1500, "DELETE Student"], "isController": false}, {"data": [0.032857142857142856, 500, 1500, "Get Student"], "isController": false}, {"data": [0.002857142857142857, 500, 1500, "FINAL STUDENT DETAILS"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5600, 31, 0.5535714285714286, 14065.810357142851, 0, 71000, 7797.5, 42627.80000000009, 58402.399999999994, 64195.759999999995, 38.78949081866605, 66.05194685580007, 9.278334727330659], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 700, 3, 0.42857142857142855, 12675.01285714285, 120, 62628, 9724.0, 24489.7, 38169.19999999998, 62498.53, 5.217222797772991, 1.727404417683404, 2.8195639216932125], "isController": false}, {"data": ["Create Student", 700, 1, 0.14285714285714285, 5992.775714285718, 399, 15418, 6532.0, 10159.699999999999, 11581.79999999997, 14975.7, 40.41103798637571, 18.735883197667707, 12.610408728784206], "isController": false}, {"data": ["Get Specific Student", 700, 0, 0.0, 5688.487142857143, 94, 15498, 6274.0, 10523.699999999997, 12420.699999999999, 14600.0, 22.299385174094486, 9.4999798409576, 3.6147216260233828], "isController": false}, {"data": ["Update Student", 700, 3, 0.42857142857142855, 28144.57000000001, 69, 63097, 19925.0, 58748.4, 60308.25, 62686.8, 4.927356684311296, 1.645639520304229, 1.6648526368397343], "isController": false}, {"data": ["Debug Sampler", 700, 0, 0.0, 0.5642857142857151, 0, 25, 0.0, 1.0, 1.0, 21.940000000000055, 42.86589099816289, 13.507420200551135, 0.0], "isController": false}, {"data": ["DELETE Student", 700, 4, 0.5714285714285714, 12313.50000000002, 69, 62699, 6953.0, 25460.899999999998, 47554.64999999996, 60978.95, 4.964609427084072, 1.6772802739223251, 1.2164747571774068], "isController": false}, {"data": ["Get Student", 700, 17, 2.4285714285714284, 14399.277142857158, 258, 57017, 15201.0, 24086.4, 26116.449999999983, 36767.44, 9.033773407152168, 96.32546981671119, 1.3600315617458414], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 700, 3, 0.42857142857142855, 33312.29571428576, 708, 71000, 26304.5, 63512.7, 64590.899999999994, 69357.65000000001, 4.905327185323261, 3.6895204911283654, 0.811986309319421], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1, 3.225806451612903, 0.017857142857142856], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 27, 87.09677419354838, 0.48214285714285715], "isController": false}, {"data": ["405/Method Not Allowed", 2, 6.451612903225806, 0.03571428571428571], "isController": false}, {"data": ["404/Not Found", 1, 3.225806451612903, 0.017857142857142856], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5600, 31, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 27, "405/Method Not Allowed", 2, "400/Bad Request", 1, "404/Not Found", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 700, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "400/Bad Request", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Create Student", 700, 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Update Student", 700, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "405/Method Not Allowed", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["DELETE Student", 700, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "405/Method Not Allowed", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Student", 700, 17, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 700, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "404/Not Found", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
