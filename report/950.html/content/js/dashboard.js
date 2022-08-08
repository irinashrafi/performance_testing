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

    var data = {"OkPercent": 98.67105263157895, "KoPercent": 1.3289473684210527};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.19052631578947368, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.015263157894736841, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.045789473684210526, 500, 1500, "Create Student"], "isController": false}, {"data": [0.15578947368421053, 500, 1500, "Get Specific Student"], "isController": false}, {"data": [0.005789473684210527, 500, 1500, "Update Student"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.2968421052631579, 500, 1500, "DELETE Student"], "isController": false}, {"data": [0.004736842105263158, 500, 1500, "Get Student"], "isController": false}, {"data": [0.0, 500, 1500, "FINAL STUDENT DETAILS"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7600, 101, 1.3289473684210527, 19826.06802631582, 0, 96181, 11621.0, 54535.00000000001, 78542.09999999999, 90663.26999999999, 39.44261359213223, 68.87512325816748, 9.418870176713288], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 950, 20, 2.1052631578947367, 22095.613684210493, 209, 72359, 22732.5, 35043.8, 37647.549999999996, 37817.49, 6.019897344908434, 2.0209664212502374, 3.248306408814397], "isController": false}, {"data": ["Create Student", 950, 16, 1.6842105263157894, 9823.860000000017, 673, 28944, 10387.0, 19062.0, 20487.8, 21930.23, 27.47014429054738, 13.805667705230894, 8.439840384003702], "isController": false}, {"data": ["Get Specific Student", 950, 10, 1.0526315789473684, 7074.178947368421, 144, 25548, 7884.5, 9879.199999999999, 13405.699999999999, 17647.720000000005, 18.334105295661573, 11.261038156650455, 2.9387339335340434], "isController": false}, {"data": ["Update Student", 950, 18, 1.894736842105263, 38957.60421052632, 218, 91617, 31342.5, 77952.0, 84737.15, 88836.97, 5.125438359859725, 1.7041819109117886, 1.7320061707580254], "isController": false}, {"data": ["Debug Sampler", 950, 0, 0.0, 0.2052631578947369, 0, 22, 0.0, 1.0, 1.0, 4.0, 29.237966268619967, 9.20292639341992, 0.0], "isController": false}, {"data": ["DELETE Student", 950, 16, 1.6842105263157894, 22834.79157894739, 69, 92164, 1924.5, 86090.2, 88320.74999999999, 91885.29, 5.1697866782760125, 1.6915108361449718, 1.2716569846538965], "isController": false}, {"data": ["Get Student", 950, 4, 0.42105263157894735, 14840.0547368421, 697, 52385, 15792.0, 21801.0, 23406.749999999996, 34484.11, 11.024590639542305, 119.06743749347227, 1.6938975264300054], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 950, 17, 1.7894736842105263, 42982.23578947371, 2083, 96181, 36061.5, 82695.8, 90285.19999999998, 95010.99, 5.024301754274623, 3.7309262465557094, 0.8326561268715524], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 16, 15.841584158415841, 0.21052631578947367], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 33, 32.67326732673267, 0.4342105263157895], "isController": false}, {"data": ["405/Method Not Allowed", 32, 31.683168316831683, 0.42105263157894735], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 4, 3.9603960396039604, 0.05263157894736842], "isController": false}, {"data": ["404/Not Found", 16, 15.841584158415841, 0.21052631578947367], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7600, 101, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 33, "405/Method Not Allowed", 32, "400/Bad Request", 16, "404/Not Found", 16, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 4], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 950, 20, "400/Bad Request", 16, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1, "", "", "", ""], "isController": false}, {"data": ["Create Student", 950, 16, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 14, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Specific Student", 950, 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update Student", 950, 18, "405/Method Not Allowed", 16, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["DELETE Student", 950, 16, "405/Method Not Allowed", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Student", 950, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 950, 17, "404/Not Found", 16, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
