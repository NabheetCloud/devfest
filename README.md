# Devfest inspired from SAP Devtoberfest 2023
## Getting started

Install devfest

```
npm install -g devfest
```

Use cli to get overall status
```
devfest -u <scnuserid>
```

Use cli to get overall status for a week. 
Valid values
"Week 0"
"Week 1"
"Week 2"
"Week 3"
"Week 4"
```
devfest -u <scnuserid> -w "Week 0"
```

Use cli to get overall status for a week with status done. 
Valid values
true
false
```
devfest -u <scnuserid> -w "Week 0" -d <true/false>
```