# Steps to Initialize for Each Term

1. Update and upload WeeklyActivityTimes.csv
2. Update and upload LocationClosureDates.csv
3. Change the termStartDate and termEndDate constants in userForm.js
4. Update the mapping of sports in result.js (if needed)
5. Check that the following still hold valid. If not, changes may need to occur:
* The headings of LocationClosureDates.csv file are: Location,Closed Date,Time From,Time To
* The headings of WeeklyActivityTimes.csv file are: Sport,Day,Open Time,Close Time,Location,Building 
* The entries in WeeklyActivityTimes.csv come in sorted by the Day (Monday - Sunday).