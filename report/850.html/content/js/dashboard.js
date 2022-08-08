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

    var data = {"OkPercent": 99.72058823529412, "KoPercent": 0.27941176470588236};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.16977941176470587, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.020588235294117647, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.07352941176470588, 500, 1500, "Create Student"], "isController": false}, {"data": [0.11588235294117646, 500, 1500, "Get Specific Student"], "isController": false}, {"data": [0.026470588235294117, 500, 1500, "Update Student"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.09705882352941177, 500, 1500, "DELETE Student"], "isController": false}, {"data": [0.02176470588235294, 500, 1500, "Get Student"], "isController": false}, {"data": [0.0029411764705882353, 500, 1500, "FINAL STUDENT DETAILS"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6800, 19, 0.27941176470588236, 18165.113235294135, 0, 85795, 10962.0, 56746.30000000006, 67406.79999999999, 79630.78, 38.95196306437384, 67.31322905150537, 9.345634990390893], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 850, 4, 0.47058823529411764, 20138.045882352944, 135, 80033, 15507.5, 40395.2, 59728.0499999999, 79467.76, 5.421748226769403, 1.7714117195871817, 2.934957259880339], "isController": false}, {"data": ["Create Student", 850, 3, 0.35294117647058826, 5786.77647058824, 411, 33168, 5035.5, 10701.8, 14147.849999999982, 22092.07, 24.1264795208765, 11.30693117389515, 7.512914762567057], "isController": false}, {"data": ["Get Specific Student", 850, 3, 0.35294117647058826, 7439.936470588236, 73, 21894, 7052.0, 11970.8, 13702.89999999999, 20352.49, 17.423745490324695, 7.965378152929239, 2.81416310291284], "isController": false}, {"data": ["Update Student", 850, 3, 0.35294117647058826, 37480.47764705877, 76, 77681, 36910.0, 67614.8, 74745.25, 76747.53, 4.9481607395462825, 1.614957098354882, 1.6765305461605182], "isController": false}, {"data": ["Debug Sampler", 850, 0, 0.0, 0.2035294117647058, 0, 9, 0.0, 1.0, 1.0, 5.0, 24.87052696257717, 7.836073282104924, 0.0], "isController": false}, {"data": ["DELETE Student", 850, 3, 0.35294117647058826, 19722.971764705875, 77, 79609, 14434.0, 51986.7, 65285.74999999995, 77782.49, 4.974454711979073, 1.6235902358769378, 1.2240621964119551], "isController": false}, {"data": ["Get Student", 850, 0, 0.0, 12289.968235294114, 268, 52883, 12223.5, 20566.5, 21425.949999999997, 33915.07, 8.366965252485482, 90.86173397664632, 1.2909965916920956], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 850, 3, 0.35294117647058826, 42462.52588235293, 790, 85795, 41476.5, 75115.1, 81676.25, 85324.81, 4.91935157158814, 3.664532596491634, 0.8165705373523471], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 3, 15.789473684210526, 0.04411764705882353], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 6, 31.57894736842105, 0.08823529411764706], "isController": false}, {"data": ["405/Method Not Allowed", 6, 31.57894736842105, 0.08823529411764706], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1, 5.2631578947368425, 0.014705882352941176], "isController": false}, {"data": ["404/Not Found", 3, 15.789473684210526, 0.04411764705882353], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6800, 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 6, "405/Method Not Allowed", 6, "400/Bad Request", 3, "404/Not Found", 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 850, 4, "400/Bad Request", 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Create Student", 850, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Specific Student", 850, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update Student", 850, 3, "405/Method Not Allowed", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["DELETE Student", 850, 3, "405/Method Not Allowed", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["FINAL STUDENT DETAILS", 850, 3, "404/Not Found", 3, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
