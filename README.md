# performance_testing
Dear,
I've completed performance test on frequently used API for test App. 
Test executed for the below mentioned scenario in server 000.000.000.00.

800 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is 46 And Total Concurrent API requested: 6400. 
850 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is 76 And Total Concurrent API requested: 6800. 
900 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is 73 And Total Concurrent API requested: 7200. 
950 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is 69 And Total Concurrent API requested: 7600.

While executed 950 concurrent request, found 101 request got connection timeout and error rate is 1.33%.

Summary: Server can handle almost concurrent 7400 API call with almost less than 1.00% error rate.
Please find the details report from the attachment and let me know if you have any further queries.
