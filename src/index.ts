#!/usr/bin/env npx ts-node --esm

import axios from 'axios';
import chalk from 'chalk';
import clear from 'clear'
import figlet from 'figlet'
import inquirer from 'inquirer'
import chalkTable from 'chalk-table'
import yargs from 'yargs'
import clui from 'clui'
import os from 'os'

var scnId: string;
type DevfestResponse = {
    displayName: string;
    badgeURL: string;
    found: boolean;
    points: number;
    week: string;
    type: string;

}
type Results ={
    results: DevfestResponse[];
}
var optionsInput = yargs
    .usage("Usage: -u <scnid>")
    .usage("Usage: -w 'Week 0'")
    .usage("Usage: -t 'Tutorial'")
    .usage("Usage: -d true")
    .option("u", { alias: "ID", describe: "Your SAP Community User ID", type: "string", demandOption: true })
    .option("w", { alias: "Week", describe: "Choose from Week 0/Week 1/Week 2/Week 3/Week 4", type: "string", demandOption: false })
    .option("t", { alias: "Type", describe: "Type of Session - Choose from Tutorial/Session/No type", type: "string", demandOption: false })
    .option("d", { alias: "Done", describe: "Done or not Done", type: "boolean", demandOption: false })
    .argv;
async function getStatus(scnId: string) {
    const response = await axios.get<Results>(`https://devtoberfest.marianzeis.de/api/checkBadges?scnId=${scnId}`);

    return response.data;
}
var status = new clui.Spinner(chalk.black.bgRed('Fetching data for SAP Devtoberfest, please wait...'));
status.start();


const results = getStatus(optionsInput.ID);
results.then((result) => {
    clear();
    const options = {
        leftPad: 2,
        columns: [
            { field: "displayName", name: chalk.magenta("Name"), width: 30 },

            { field: "week", name: chalk.magenta("Week"), width: 30 },
            { field: "found", name: chalk.magenta("Found"), width: 30 },
            { field: "points", name: chalk.magenta("Pt"), width: 30 },
            { field: "type", name: chalk.magenta("Type"), width: 30 },
            { field: "badgeURL", name: chalk.magenta("URL"), width: 30 },
        ]
    };

    var formatteddata = [];
    var resultFilter = [];
    // console.log(result);
    resultFilter = result.results;
    if (optionsInput.Week != '' && optionsInput.Week != undefined && optionsInput.Week != null) {
        resultFilter = resultFilter.filter((element) => optionsInput.Week == element.week);
    }
    if (optionsInput.Type != '' && optionsInput.Type != undefined && optionsInput.Type != null) {
        resultFilter = resultFilter.filter((element) => optionsInput.Type == element.type);
    }

    if (optionsInput.Done != undefined && optionsInput.Done != null) {
        resultFilter = resultFilter.filter((element) => optionsInput.Done == element.found);
    }

    var total = 0;
    var notDone = 0;
    var done = 0;
    var totalSession = 0;
    var notDoneSession = 0;
    var doneSession = 0;
    var totalTutorial = 0;
    var notDoneTutorial = 0;
    var doneTutorial = 0;
    resultFilter.forEach((element) => {
        switch (element.week) {
            case "Week 0":
                element.week = '0'
                break;
            case "Week 1":
                element.week = '1'
                break;
            case "Week 2":
                element.week = '2'
                break;
            case "Week 3":
                element.week = '3'
                break;
            case "Week 4":
                element.week = '4'
                break;
            default:
                break;
        }
        switch (element.type) {
            case "Session":
                element.type = 'S';
                break;
            case "Tutorial":
                element.type = 'T';
                break;
            case "No type":
                element.type = 'N';
                break;
            default:
                break;
        }

        // replace all occurences of  - Devtoberfest 2023 - in displayname,restict to 30 characters in length and replace any word starting with # with empty string
        element.displayName = element.displayName.replace(/- Devtoberfest 2023 - /g, '').replace(/#\w+/g, '').substring(0, 40);

        if (element.found == true) {
            done = done + element.points;
            switch (element.type) {
                case 'S':
                    doneSession = doneSession + 1;
                    totalSession = totalSession + 1;
                    break;
                case 'T':
                    doneTutorial = doneTutorial + 1;
                    totalTutorial = totalTutorial + 1;
                    break;
                default:
                    break;
            }


        } else {
            notDone = notDone + element.points;
            switch (element.type) {
                case 'S':
                    notDoneSession = notDoneSession + 1;
                    totalSession = totalSession + 1;
                    break;
                case 'T':
                    notDoneTutorial = notDoneTutorial + 1;
                    totalTutorial = totalTutorial + 1;
                    break;
                default:
                    break;
            }
        }
        total = total + element.points;

        formatteddata.push({ displayName: element.displayName, week: element.week, found: element.found == true ? chalk.black.bgGreen(' ') : chalk.black.bgRed(' '), points: element.points, type: element.type, badgeURL: element.badgeURL })


    })
    var table = chalkTable(options, formatteddata);
    status.stop();
    var Gauge = clui.Gauge;
    figlet("Devtoberfest", function (err, data) {
        if (err) {
          console.log("Something went wrong...");
          console.dir(err);
          return;
        }
        console.log(chalk.hex('#e269c9')(data))
        console.log(chalk.hex('#ABE2AB').bold('Points Earned'), done, Gauge(done, total, 50, total * 1.2, chalk.hex('#ABE2AB').bold(total)));
        console.log(chalk.hex('#91c8f6').bold('Session Completed'), doneSession, Gauge(doneSession, totalSession, 50, totalSession * 1.2, chalk.hex('#91c8f6').bold(totalSession)));
        console.log(chalk.hex('#7fc6c6').bold('Tutorial Completed'), doneTutorial, Gauge(doneTutorial, totalTutorial, 50, totalTutorial * 1.2, chalk.hex('#7fc6c6').bold(totalTutorial)));
        console.log(table);
      });

});

