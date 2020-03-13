# COMPLETED Page 1: User Form
Show input boxes for:
    startDate: '' (date)
    endDate: '' (date)
    googleLink: '' (text/link)
    swimming: false (checkbox)
    cifGym: false (checkbox)
    pacGym: false (checkbox)
    badminton: false (checkbox)
    basketball: false (checkbox)
    skating: false (checkbox)
    studio: false (checkbox)
    fieldHouse: false (checkbox)
    avgHrsPerWk: 0 (number)
    limit1Activity: false (checkbox)
Save the user inputted values for these user values.

# Page 2
## Four Main Components
- Calendar API linking
- Current Average hours/week
- Show Exercise Bookings for the time period
- Show Potential Exercise Options


* Figure out how long API keys can last for
* All of the user's events need to be on one calendar (their primary calendar).
* Only shows events named with the sport name (using this system) for the sports that this system supports.
* May need to npm install -save packages. (lodash, d3, etc. - go thru imports)
* Group by compares substrings. Right now, only group by the whole sport name.
* Assume each sport does not last longer than 1 day.
* Timezones