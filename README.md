# absence-hexmap
Interactive hexmaps of secondary school absence data for England during the second wave of Covid-19, made using D3. View [the visualisations here](https://ffteducationdatalab.org.uk/2020/12/new-attendance-figures-paint-a-worrying-picture-of-mass-absences/).

![Screenshot](hexmap.png)

![Screenshot](hexmap2.png)

The visualisations take as input JSON files of pupil absence rates for state-funded schools in England on 15 October and 10 December 2020 (`primary_absence.json`, `secondary_absence.json`). The source of this data is ultimately [Department for Education 'school attendance during coronavirus' statistics](https://explore-education-statistics.service.gov.uk/find-statistics/attendance-in-education-and-early-years-settings-during-the-coronavirus-covid-19-outbreak/2020-week-50). The data files are combined with a [hexJSON](https://odileeds.org/projects/hexmaps/hexjson.html) file describing the position of upper-tier local authorities in England (`uk-upper-tier-local-authorities.hexjson`).

The visualisation makes use of [Oli Hawkins' d3-hexjson package](https://github.com/olihawkins/d3-hexjson). The hexJSON file is one of our own making - taking a file shared by [ODI Leeds](https://github.com/odileeds/hexmaps) as a starting point, but making substantial revisions.

Compared to [an earlier iteration](https://ffteducationdatalab.org.uk/2020/10/pupils-in-the-poorest-areas-of-the-country-are-missing-the-most-schooling/) ([code](https://github.com/FFTEduDatalab/absence-hexmap/tree/b9f5449ccfb8eb0548003c0a2b3ecb1753d4b0ad)), the code made available here:
- draws a second map, displaying the change in attendance rate between two dates;
- uses dropdowns to control which data is displayed on the maps (school phase; date);
- moves the drawing of maps into functions*;
- loads the webfont uses in the maps before the hexmaps are drawn, to fend off [an issue with inconsistent legend spacing](https://stackoverflow.com/questions/64809138/inconsistent-d3-legend-positioning-when-using-an-external-font).

*This results in the hexJSON being loaded twice. There is a branch which also moves the loading of data into functions, which gets rid of this issue but which proved unreliable when used in production, for reasons that couldn't easily be ascertained.

The directory structure in this repository is simply to allow the files to be added to our content management system easily.
