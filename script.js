var fortnightTimetable = JSON.parse(localStorage.getItem("fortnightTimetable")); //retriving timetable data in local storage
function initialise() {
  //This function is used to initialise the system before it is run

  //Used to store a clone of the page before modifications are made
  clonedPages = {
    page2: document.getElementById("page2").cloneNode(true),
    pageA: document.getElementById("pageA").cloneNode(true),
    page6: document.getElementById("page6").cloneNode(true),
    page7: document.getElementById("page7").cloneNode(true)
  };

  if (fortnightTimetable == null) {
    //checks if it is the first time using the system
    fortnightTimetable = [];
    goToPage(page1);
  } else {
    goToPage(page5);
    countdown();
  }
}

function goToPage(page) {
  //Function will switch from one page to another by hiding all other pages and showing selected one
  var pages = document.getElementsByClassName("pages");
  for (var i = 0; i < pages.length; i++) {
    pages[i].style.display = "none";
  }
  page.style.display = "block";
}

var subjectHeadingsArr = ["Subject Name", "Main Classroom", "Teacher"];
function makeClasses() {
  //This function creates the table for the user to manually enter their details
  var table = document.getElementById("subjectInputTable");
  goToPage(page2);

  //Makes the 3 table headers ("Subject Name", "Main Classroom", "Teacher")
  var row = table.insertRow(-1);
  for (var i = 0; i < subjectHeadingsArr.length; i++) {
    var heading = document.createElement("TH");
    heading.innerText = subjectHeadingsArr[i];
    row.appendChild(heading);
  }
  //Adds a blank row to table for input
  addClassTableRow();
}

function confirmDeletion(page) {
  //This function confirms the deletion of a page before continuing
  var confBool = confirm("Note: All changes made will be deleted");
  if (confBool) {
    resetPage(page);
    goToPage(page1);
  }
}

function resetPage(page) {
  //This function resets the contents of the page
  var pageDiv = document.getElementById(page);
  var origDiv = clonedPages[page].cloneNode(true);
  pageDiv.replaceWith(origDiv);
}

function addClassTableRow(table) {
  //Function adds a blank row to the table to enter a new class

  //Checks if the delete radio buttons are showing
  if (isCheckBoxVisibleVar) {
    isCheckBoxVisibleVar = false;
    hideSelectBoxes("subjectInputTable");
  }
  //Making input boxes for new row
  var table = document.getElementById("subjectInputTable");
  var row = table.insertRow(-1);
  for (var i = 0; i < subjectHeadingsArr.length; i++) {
    var cell = document.createElement("TD");
    var inputElement = document.createElement("input");
    inputElement.placeholder = subjectHeadingsArr[i];
    cell.appendChild(inputElement);
    row.appendChild(cell);
  }
}

var isCheckBoxVisibleVar = false; //Flag to show if check boxes are showing
function deleteTableRow() {
  //This function deletes each selected row from the table
  var table = document.getElementById("subjectInputTable");
  //Determines to show/hide the checkboxes depending on current state
  if (!isCheckBoxVisibleVar) {
    isCheckBoxVisibleVar = true;
    showSelectBoxes("subjectInputTable");
  } else {
    isCheckBoxVisibleVar = false;
    for (var i = 0; i < table.rows.length; i++) {
      var row = table.rows[i];
      var checkbox = row.cells[0].childNodes[0];
      if (checkbox != null && checkbox.checked) {
        table.deleteRow(i);
        i--;
      }
    }
    hideSelectBoxes("subjectInputTable");
    //Adding a row if all rows are deleted
    if (table.rows.length === 1) {
      addClassTableRow();
    }
  }
}

function showSelectBoxes(tableName) {
  //This function shows the checkboxes to delete the rows
  var table = document.getElementById(tableName);
  document.getElementById("removeClassBtn").innerText = "Remove Selected Classes";

  //Ensuring the heading/first row does not include the checkbox
  var row = table.rows[0];
  var cell = document.createElement("TD");
  row.insertBefore(cell, row.childNodes[0]);

  //Adding checkboxes to the subsequent rows
  for (var i = 1; i < table.rows.length; i++) {
    row = table.rows[i];
    cell = document.createElement("TD");
    var checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    cell.appendChild(checkbox);
    row.insertBefore(cell, row.childNodes[0]);
  }
}

function hideSelectBoxes(tableName) {
  //This function hides the checkboxes from each of the rows
  var table = document.getElementById(tableName);
  document.getElementById("removeClassBtn").innerText = "Remove Classes";

  for (var i = 0; i < table.rows.length; i++) {
    var row = table.rows[i];
    row.deleteCell(0);
  }
}

var allClassesDetails = []; //global array of all the user's classes (stored as objects)
var userClassDetailsObj = { subjectName: "", mainClassroom: "", teacher: "" };

function saveClassesDetails() {
  //This saves class details entered from the manual input

  //confirmation from the user before continuing
  var confBool = confirm(
    "Are you sure you want to continue?\nNote: Any changes after saving can be made in the final edit screen"
  );
  if (confBool) {
    var table = document.getElementById("subjectInputTable");
    var inputErrors = insertionSort(findSubjectNameErrors(table));
    //Checks if error with data before continuing
    if (inputErrors.length != 0) {
      highlightErrorCells(table, inputErrors);
      alert(
        "An error is present in the highlighted cells. Please fix these cells before continuing."
      );
      return;
    }
    //Saves each row as an object, as an element in a global array
    for (var i = 1; i < table.rows.length; i++) {
      userClassDetailsObj = {
        subjectName: table.rows[i].cells[0].childNodes[0].value,
        mainClassroom: table.rows[i].cells[1].childNodes[0].value,
        teacher: table.rows[i].cells[2].childNodes[0].value
      };
      allClassesDetails.push(userClassDetailsObj);
    }
    //Setting up the displaying of the information on the following page
    goToPage(page3);
    makeManualTimetableInput("weekInputTimetable", "A");

    //Makes a list of all the user's subjects so the full timetable can be filled out easily
    makeSubjectList("subjectList");
  }
}

function findSubjectNameErrors(table) {
  //This function checks that all name cells are free of errors

  var allNames = [];
  var errorCells = [];
  //Makes array containing all subject names
  for (var i = 1; i < table.rows.length; i++) {
    allNames.push(table.rows[i].cells[0].childNodes[0].value);
  }

  //Looping through allNames to check for errors
  for (var j = 0; j < allNames.length; j++) {
    var name = allNames[j];
    if (name === "" || name.toLowerCase() === "free period") {
      //Checks if subject name is blank or "Free Period"
      errorCells.push(j);
    } else if (j !== allNames.lastIndexOf(name)) {
      //Checks if name is not unique
      if (!errorCells.includes(allNames.lastIndexOf(name))) {
        errorCells.push(allNames.lastIndexOf(name));
      }
      errorCells.push(j);
    }
  }
  return errorCells;
}

function highlightErrorCells(table, inputErrors) {
  //This function highlights cells containing errors
  for (var r = 1; r < table.rows.length; r++) {
    if (inputErrors.includes(r - 1)) {
      table.rows[r].cells[0].childNodes[0].style.borderColor = "red";
    } else {
      table.rows[r].cells[0].childNodes[0].style.borderColor = "";
    }
  }
}

function insertionSort(origArray) {
  //This function sorts an array using an insertion sort
  var sortedArray = origArray.slice();
  var first = 0;
  var last = sortedArray.length - 1;
  var posOfNext = last - 1;
  while (posOfNext >= first) {
    var next = sortedArray[posOfNext];
    var current = posOfNext;
    while (current < last && next > sortedArray[current + 1]) {
      current++;
      sortedArray[current - 1] = sortedArray[current];
    }
    sortedArray[current] = next;
    posOfNext--;
  }
  return sortedArray;
}

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; //Days of the timetabled week
var normalPeriodTimesArr = [
  "Period 1: 8:30 - 9:25",
  "Period 2: 9:25 - 10:20",
  "Period B: 10:40 - 11:00",
  "Period 3: 11:00 - 11:55",
  "Period 4: 11:55 - 12:50",
  "Lunch: 12:50 - 1:30",
  "Period 5: 1:30 - 2:25",
  "Period 6: 2:25 - 3:20"
]; //Period times on a standard weekday
var wedPeriodTimesArr = [
  "Period 1: 8:30 - 9:25",
  "Period 2: 9:25 - 10:20",
  "Period 3: 10:40 - 11:35",
  "Period 4: 11:35 - 12:30",
  "Period B: 12:30 - 12:50",
  "Lunch: 12:50 - 1:30",
  "Period 5: 1:30 - 2:25",
  "Period 6: 2:25 - 3:20"
]; //Period times on a Wednesday

function makeManualTimetableInput(timetableName, timetableWeek) {
  //This function makes the timetable for the user to point and click their class periods

//TODO CHANGE THIS FROM A CAPTION TO A H3 ROW
  var table = document.getElementById(timetableName);
  var caption = table.createCaption();
  caption.innerText = "Timetable - Week " + timetableWeek;

  //Deleting existing table rows
  while (table.rows.length > 0) {
    table.deleteRow(0);
  }

  //Making days of the week header
  var row = table.insertRow(-1);
  for (var i = 0; i < days.length; i++) {
    var day = document.createElement("TH");
    day.innerText = days[i];
    row.appendChild(day);
  }
  for (var i = 0; i < normalPeriodTimesArr.length; i++) {
    //Making period times header
    row = table.insertRow(-1);
    for (var j = 0; j < days.length; j++) {
      var period = document.createElement("TH");
      if (j == 2) {
        period.innerText = wedPeriodTimesArr[i];
      } else {
        period.innerText = normalPeriodTimesArr[i];
      }
      row.appendChild(period);
    }

    //Making input boxes/buttons to click
    row = table.insertRow(-1);
    for (var j = 0; j < days.length; j++) {
      var info = document.createElement("TD");
      info.style.textAlign = "center";

      var subjectBtn = document.createElement("button");
      subjectBtn.innerText = "Free Period";
      subjectBtn.onclick = function () {
        changeSubject(this);
      };
      info.appendChild(subjectBtn);
      row.appendChild(info);
    }
  }
}

function changeSubject(btn) {
  //This function changes the text on the button to that of the chosen subject
  if (btn.innerText === chosenSubject) {
    btn.innerText = "Free Period";
    btn.style.borderColor = "";
  } else {
    btn.innerText = chosenSubject;
    btn.style.borderColor = "dodgerblue";
  }
}

function makeSubjectList(timetableName) {
  //This function makes a list of all the user's subjects
  var form = document.getElementById(timetableName);
  for (i = allClassesDetails.length - 1; i >= 0; i--) {
    var subjectName = allClassesDetails[i].subjectName;

    //Setting the various properties of each element
    var input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("name", "selectedSubject");
    input.setAttribute("value", subjectName);
    input.onclick = function () {
      storeChosenSubject(this);
    };
    //Pre-selecting the first radio button
    input.checked = true;
    chosenSubject = subjectName;

    //Adding the subjectlist to the html
    var label = document.createElement("label");
    label.innerText = subjectName;
    var br = document.createElement("br");

    form.insertBefore(br, form.childNodes[0]);
    form.insertBefore(label, form.childNodes[0]);
    form.insertBefore(input, form.childNodes[0]);
  }
}

var chosenSubject = ""; //global variable of the user's selected subject in manual entry

function storeChosenSubject(btn) {
  //This function sets the chosenSubject var as the value chosen
  chosenSubject = btn.value;
  highlightSubjectBtns();
}

function highlightSubjectBtns() {
  //This function highlights blue all cells containing the given subject
  var table = document.getElementById("weekInputTimetable");
  for (var r = 2; r < table.rows.length; r += 2) {
    for (var c = 0; c < table.rows[r].cells.length; c++) {
      var btn = table.rows[r].cells[c].childNodes[0];
      if (btn.innerText === chosenSubject) {
        btn.style.borderColor = "dodgerblue";
      } else {
        btn.style.borderColor = "";
      }
    }
  }
}

function saveManualTimetable() {
  //This function saves the details from the manualy inputted table

  //Confirmation to the user before continuing
  var confBool = confirm(
    "Are you sure you want to continue?\nNote: Any changes after saving can be made in the final edit screen"
  );
  if (confBool) {
    var table = document.getElementById("weekInputTimetable");
    var numColumns = table.rows[0].cells.length; //gets the number of columns in the table
    var rowNumberPeriodArr = [
      "P1",
      "P2",
      "PB",
      "P3",
      "P4",
      "Lunch",
      "P5",
      "P6"
    ]; //array to find index of period in table

    for (var c = 0; c < numColumns; c++) {
      var dayName = table.rows[0].cells[c].innerText;
      var daySchedule = [];
      //Loop to locate which periods are free periodds
      for (var r = 2; r < table.rows.length; r += 2) {
        subjectName = table.rows[r].cells[c].childNodes[0].innerText;
        var periodNumber = rowNumberPeriodArr[r / 2 - 1]; //links row number in table to period number in array
        if (subjectName !== "Free Period") {
          //returns the relevant teacher and room to a given class name and save details to a daily array
          daySchedule.push(getClassDetailsfromArr(subjectName, periodNumber));
        }
      }
      //object to store the day of the week and an array of records of the periods in that day
      var dayScheduleObj = {
        day: dayName,
        schedule: daySchedule
      };

      //Determines which week of data was entered and which array to save it to
      if (table.caption.innerText.includes("A")) {
        weekATimetable.push(dayScheduleObj);
      } else {
        weekBTimetable.push(dayScheduleObj);
      }
    }
    //Determines which week of data was entered and what are the next steps
    if (table.caption.innerText.includes("A")) {
      console.log(weekATimetable);
      makeManualTimetableInput("weekInputTimetable", "B");
    } else {
      console.log(weekBTimetable);
      goToPage(page4); //Go to full timetable edit screen
      makeFullTimetableScreen("fullEditTimetable");
    }
    fortnightTimetable = [weekATimetable, weekBTimetable];
  }
}

function getClassDetailsfromArr(className, periodNumber) {
  //Function returns the relevant teacher and room for a given class name
  for (var i = 0; i < allClassesDetails.length; i++) {
    if (allClassesDetails[i].subjectName == className) {
      return {
        period: periodNumber,
        subject: allClassesDetails[i].subjectName,
        room: allClassesDetails[i].mainClassroom,
        teacher: allClassesDetails[i].teacher
      };
    }
  }
}

function importClasses() {
  //This function stores the data from the pasted string from the user's spaces timetable

  //try-catch is used to isolate errors stemming from the user inputting different strings
  try {
    //This function converts the copied timetable data from spaces and converts to the required format for use
    var textInput = document.getElementById("myTextarea").value.trim(); //Get spaces copy paste text

    var wholeInputArr = textInput.split("\n"); //Spilts each line in textarea into an array
    var subjectObj = { period: "", subject: "", room: "", teacher: "" };

    //Sorts through each element from 2nd index in wholeInputArr to get subject details from input
    for (var i = 0; i < wholeInputArr.length; i++) {
      if (!wholeInputArr[i].includes("Week")) {
        var splitSubjectArr = wholeInputArr[i].split("\t");
        if (splitSubjectArr.length != 4) throw "";
        var periodStartTime = splitSubjectArr[0];
        subjectObj = {
          period: assignPeriod(periodStartTime),
          subject: splitSubjectArr[1],
          room: splitSubjectArr[2],
          teacher: splitSubjectArr[3]
        };
        wholeInputArr[i] = subjectObj;
      }
    }
    groupDayTimetable(wholeInputArr);
  } catch (err) {
    alert("The data you have entered is not compatible. Please try again");
    return;
  }

  //TODO DELETE CONSOLE LOG
  console.log(weekATimetable);
  console.log(weekBTimetable);

  fortnightTimetable = [weekATimetable, weekBTimetable];
  goToPage(page4); //Go to full timetable edit screen
  makeFullTimetableScreen("fullEditTimetable");
}

var weekATimetable = []; //global arrray of the week A timetable
var weekBTimetable = []; //global array of the week B timetable
var lastWeekdayPos = 0; //stores index of the last day header in wholeInputArr

function groupDayTimetable(wholeInputArr) {
  //This function will take the spaces input array and will split it into two separate week arrays

  wholeInputArr.push("EndWeek"); //Indicator to code to signal to program the end of the input
  var i = 0;
  var startDay = 0;
  while (i < wholeInputArr.length - 1) {
    while (!String(wholeInputArr[i]).includes("Week") || i == startDay) {
      //Searches until it finds the positions of each new day
      i++;
    }
    var endDay = i;
    var week = wholeInputArr[startDay].slice(-1); // Gets the week letter (e.g. 'A' or 'B')
    var dayName = wholeInputArr[startDay].split(" ")[0]; //Gets the day of the week
    var dayScheduleObj = {
      day: dayName,
      schedule: wholeInputArr.slice(startDay + 1, endDay)
    }; //Makes object to store each day's timetable
    if (week === "A") {
      weekATimetable.push(dayScheduleObj);
    } else if (week === "B") {
      weekBTimetable.push(dayScheduleObj);
    }
    startDay = endDay;
  }
}

function assignPeriod(periodStartTime) {
  //This function assigns the relevant period number to a given period start time
  var periodTimesObj = {
    P1: "8:30AM",
    P2: "9:25AM",
    PB: "10:40AM",
    P3: "11:00AM",
    P4: "11:55AM",
    Lunch: "12:50PM",
    P5: "1:30PM",
    P6: "2:30PM"
  };
  var periodNumber = Object.keys(periodTimesObj);
  var startTimes = Object.values(periodTimesObj);
  return periodNumber[startTimes.indexOf(periodStartTime)];
}

function makeFullTimetableScreen(timetableName) {
  //This function creates the full timetable where the user can edit the full table
  var table = document.getElementById(timetableName);

  //Deleting existing table rows
  while (table.rows.length > 0) {
    table.deleteRow(i);
  }

  var weeks = ["A", "B"];
  for (var w = 0; w < weeks.length; w++) {
    //Creates the week header
    var row = table.insertRow(-1);
    var week = document.createElement("H3"); //or TH in originally
    week.style.textAlign = "center";
    week.innerText = "Timetable - Week " + weeks[w];
    row.appendChild(week);

    //Creates the days of the week headers
    var row = table.insertRow(-1);
    for (var i = 0; i < days.length; i++) {
      var day = document.createElement("TH");
      day.innerText = days[i] + " " + weeks[w];
      row.appendChild(day);
    }
    //Making period times header
    for (var i = 0; i < normalPeriodTimesArr.length; i++) {
      row = table.insertRow(-1);
      for (var j = 0; j < days.length; j++) {
        var period = document.createElement("TH");
        if (j == 2) {
          period.innerText = wedPeriodTimesArr[i];
        } else {
          period.innerText = normalPeriodTimesArr[i];
        }
        row.appendChild(period);
      }
      //Making input boxes with period data
      row = table.insertRow(-1);
      for (var k = 0; k < days.length; k++) {
        var infoSubject = document.createElement("TD");
        infoSubject.style.textAlign = "center";
        var subjectInput = document.createElement("input");
        subjectInput.placeholder = "Subject Name";
        var roomInput = document.createElement("input");
        roomInput.placeholder = "Classroom";
        var teacherInput = document.createElement("input");
        teacherInput.placeholder = "Teacher";

        //This finds the details for the iterated cell in the table and puts it in input boxes
        cellClassDetails = findCellClassDetails(w, k, i);

        subjectInput.value = cellClassDetails.subject;
        roomInput.value = cellClassDetails.room;
        teacherInput.value = cellClassDetails.teacher;

        infoSubject.appendChild(subjectInput);
        infoSubject.appendChild(roomInput);
        infoSubject.appendChild(teacherInput);

        row.appendChild(infoSubject);
      }
    }
  }
}

function findCellClassDetails(weekNum, dayNum, periodNum) {
  //This function finds the details for each editTimetable cell
  var dayTable = fortnightTimetable[weekNum][dayNum].schedule;

  if (periodNum == 5) {
    //Case if period is lunch
    var period = "Lunch";
  } else if (dayNum == 2) {
    //Case if day of week is Wednesday
    var period = "P" + wedPeriodTimesArr[periodNum].substr(7, 1);
  } else {
    var period = "P" + normalPeriodTimesArr[periodNum].substr(7, 1);
  }
  for (var i = 0; i < dayTable.length; i++) {
    if (dayTable[i].period == period) {
      return dayTable[i]; //return period details
    }
  }
  return { period: "", subject: "", room: "", teacher: "" }; //Free period at time, return empty object
}

function saveUpdTimetable(timetableName) {
  //This function saves the data from the full timetable and stores it in global var FornightTimetable

  var confBool = confirm("Are you sure you want to continue?");
  if (confBool) {
    var table = document.getElementById(timetableName);
    var rowsTotal = table.rows.length; //total number of rows in table
    var rowsTableA = normalPeriodTimesArr.length * 2 + 2; //Number of rows in timetable A
    var colsTotal = table.rows[1].cells.length;
    var tempTimetableArr = fortnightTimetable.slice(); //Making a temporary clone of original arr
    var errorPresent = false;
    //Save each updated cell into global array timetable
    for (var r = 3; r < rowsTotal; r += 2) {
      //Saves cells for timetable A
      var periodInputPosition = Math.floor((r - 3) / 2);
      var week = Math.floor(r / rowsTableA);
      var periodIndex =
        (periodInputPosition - week) % normalPeriodTimesArr.length;

      if (r == 19) {
        continue;
      } //ignore details in row 19 as it doesn't contain input boxes
      for (var c = 0; c < colsTotal; c++) {
        var subjectInput = table.rows[r].cells[c].childNodes[0].value;
        var roomInput = table.rows[r].cells[c].childNodes[1].value;
        var teacherInput = table.rows[r].cells[c].childNodes[2].value;

        var daySchedule = tempTimetableArr[week][c].schedule;
        if (periodIndex == 5) {
          //Case if period is lunch
          var period = "Lunch";
        } else if (c == 2) {
          //Case if day of week is Wednesday
          var period = "P" + wedPeriodTimesArr[periodIndex].substr(7, 1);
        } else {
          var period = "P" + normalPeriodTimesArr[periodIndex].substr(7, 1);
        }

        //Check that cell is filled correctly before continuing
        if (subjectInput === "" && roomInput === "" && teacherInput === "") {
          //Removes any highlighted cells
          table.rows[r].cells[c].childNodes[0].style.borderColor = "";
          table.rows[r].cells[c].childNodes[1].style.borderColor = "";
          table.rows[r].cells[c].childNodes[2].style.borderColor = "";

          var periodFoundPos = periodLinearSearch(period, daySchedule);
          if (periodFoundPos != -1) {
            //will remove previous period object value
            daySchedule.splice(periodFoundPos, 1);
          }
        } else if (
          subjectInput === "" ||
          roomInput === "" ||
          teacherInput === ""
        ) {
          errorPresent = true;
          //Highlights any error cells
          table.rows[r].cells[c].childNodes[0].style.borderColor = "red";
          table.rows[r].cells[c].childNodes[1].style.borderColor = "red";
          table.rows[r].cells[c].childNodes[2].style.borderColor = "red";
        } else {
          //Removes any highlighted cells
          table.rows[r].cells[c].childNodes[0].style.borderColor = "";
          table.rows[r].cells[c].childNodes[1].style.borderColor = "";
          table.rows[r].cells[c].childNodes[2].style.borderColor = "";

          //Checks if period exists already to be updated
          var periodFoundPos = periodLinearSearch(period, daySchedule);
          if (periodFoundPos == -1) {
            //If the period is new, it will add its details into the array
            daySchedule.push({
              period: period,
              subject: subjectInput,
              room: roomInput,
              teacher: teacherInput
            });
          } else {
            //else it will update its details
            daySchedule[periodFoundPos].subject = subjectInput;
            daySchedule[periodFoundPos].room = roomInput;
            daySchedule[periodFoundPos].teacher = teacherInput;
          }

          tempTimetableArr[week][c].schedule = daySchedule;
        }
      }
    }
    console.log(tempTimetableArr); //TODO REMOVE CONSOLE LOG
    
    if (errorPresent) {
      //Return message to the user if an error is present
      alert("Please ensure the highlighted cells are filled");
    } else {
      //Stores the updated timetable in local storage
      fortnightTimetable = tempTimetableArr.slice();
      localStorage.setItem(
        "fortnightTimetable",
        JSON.stringify(fortnightTimetable)
      );
      goToPage(page5);
      resetPage("page6");
      countdown();
    }
  }
}

function periodLinearSearch(requiredName, array) {
  //This function is a linear search to find the location of a given element in an array
  var posFound = -1;
  for (var i = 0; i < array.length; i++) {
    if (array[i].period == requiredName) {
      posFound = i;
      break;
    }
  }
  return posFound;
}

function getWeekNumber(currentDate) {
  //This function returns the  week number for today's date
  /*This function is modified from a function by Rob G (https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php)*/

  // A copy of the date to not modify the original
  currentDate = new Date(
    Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    )
  );
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  currentDate.setUTCDate(
    currentDate.getUTCDate() + 4 - (currentDate.getUTCDay() || 7)
  );
  // Get first day of year
  var yearStart = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(((currentDate - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return weekNo;
}

function findNextPeriod() {
  var currDate = new Date();
  var periodStartTimes = [
    {
      period: "P1",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 8, 30)
    },
    {
      period: "P2",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 9, 25)
    },
    {
      period: "Recess",
      time: new Date( currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 10, 20)
    },
    {
      period: "PB",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 10, 40)
    },
    {
      period: "P3",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 11, 00)
    },
    {
      period: "P4",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 11, 55)
    },
    {
      period: "Lunch",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 12, 50)
    },
    {
      period: "P5",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 13, 30)
    },
    {
      period: "P6",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 14, 25)
    },
    {
      period: "End of Day",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 15, 20)
    }
  ]; //Array containing the start time corresponding to each period of the day

    if (currDate.getDay() == 3) {
    //Case if today is Wednesday
    periodStartTimes[3] = {
      period: "P3",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 10, 40)
    };
    periodStartTimes[4] = {
      period: "P4",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 11, 35)
    };
    periodStartTimes[5] = {
      period: "PB",
      time: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 12, 30)
    };
  }

  var daysToPeriod = 1; //used to store the number of days to next period
  var nextPeriod = 0; //used to store the time the next period begins
  if (currDate.getDay() == 0 || currDate.getDay() == 6) {
    //case if current day is a weekend
    daysToPeriod += currDate.getDay() / 6; //factors extra day for saturday
    nextPeriod = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + daysToPeriod, 8, 30);
    return [nextPeriod, "NextDayP1"];
  } else {
    for (var i = 0; i < periodStartTimes.length; i++) {
      if (currDate < periodStartTimes[i].time) {
        return [periodStartTimes[i].time, periodStartTimes[i].period];
      }
    }
    if (currDate.getDay() == 5) {
      //case if day of the week is friday
      daysToPeriod = 3;
    }
    nextPeriod = new Date(currDate.getFullYear(), currDate.getMonth(),currDate.getDate() + daysToPeriod, 8, 30);
    return [nextPeriod, "NextDayP1"];
  }
}

function findRemainingTime(nextPeriodTime) {
  //This function returns the time from now until the next period 

  var today = new Date();
  var remainingTimeinHrs = new Date(nextPeriodTime - today) / (1000 * 60 * 60); //converts time difference from ms to hr

  var hrs = Math.floor(remainingTimeinHrs); //Round time difference to nearest hr
  var mins = Math.floor((remainingTimeinHrs - hrs) * 60); //Round time difference to nearest min
  var secs = Math.floor((remainingTimeinHrs - hrs - mins / 60) * 3600); //Round time difference to nearest sec

  var mins = formatTimeDigits(mins);
  var secs = formatTimeDigits(secs);

  var timeString = String(hrs) + ":" + String(mins) + ":" + String(secs);
  return [timeString, remainingTimeinHrs];
}

function formatTimeDigits(digit) {
  // This function adda a zero in front single-digit numbers for formatting
  if (digit < 10) {
    digit = "0" + digit;
  }
  return digit;
}

var nextPeriodTimeFlag = 0; //used to check if period has ended and details are to be updated

function countdown() {
  //This function is a countdown timer to the next period

  //finds if today is a school holiday and does not show the timetable
  var isHoliday = findIfHoliday();
  if (isHoliday) {
    document.getElementById("periodDtls").innerText =
      "HOLIDAYS!!! No Classes Today";
    return;
  } else {
    var nextPeriodDetails = findNextPeriod(); //find which period is next and its details
    var nextPeriodTime = nextPeriodDetails[0]; //time next period starts date time object
    var nextPeriod = nextPeriodDetails[1]; //name of next period

    var remainingTimeDetails = findRemainingTime(nextPeriodTime); //find the itme until next period
    var timeString = remainingTimeDetails[0]; //string formatted time until next period
    var remainingTimeinHrs = remainingTimeDetails[1]; //floating point for time until next period

    //if this is the first time running function or onchange
    if (
      document.getElementById("periodDtls").innerText == "" ||
      nextPeriodTimeFlag != String(nextPeriodTime)
    ) {
      var upcomingPeriods = findBoundingPeriods(nextPeriod); //returns array with period before and after
      upcomingPeriods.splice(1, 0, nextPeriod); //inserts the current period into the array
      //used to check if period has ended and details are to be updated

      document.getElementById("periodDtls").innerText = formatPeriodDetails(
        upcomingPeriods
      ); //gets the period details for each of the periods
      nextPeriodTimeFlag = nextPeriodTime;
    }

    document.getElementById("timer").innerText = timeString;
    timerLoop = setTimeout(countdown, 500); //run countdown timer loop
  }
}

var holidayWeeksArr = [1, 2, 3, 4, 16, 17, 27, 28, 29, 40, 41, 50, 51, 52, 53]; //array of all weeks which are holidays
function findIfHoliday() {
  //This function checks if the current day is a school holiday
  var currentDate = new Date();
  var weekNo = getWeekNumber(currentDate);

  if (holidayWeeksArr.includes(weekNo)) {
    return true;
  } else {
    return false;
  }
}

function findBoundingPeriods(periodName) {
  //Finds the previous and next periods for a given period
  var periods = [
    "P1",
    "P2",
    "Recess",
    "PB",
    "P3",
    "P4",
    "Lunch",
    "P5",
    "P6",
    "End of Day",
    "NextDayP1",
    "NextDayP2"
  ]; //Array of order of periods on a standard weekday
  if (new Date().getDay() === 3) {
    //modify order of periods if today is Wednesday
    periods.splice(3, 3, "P3", "P4", "PB");
  }
  var periodPos = periods.indexOf(periodName);
  var nextPeriod = periods[periodPos + 1];
  var prevPeriod;
  if (!(periodPos == 0 || periodPos == periods.indexOf("NextDayP1"))) {
    //This does not return the previous period if the school day has finished
    prevPeriod = periods[periodPos - 1];
  }
  return [prevPeriod, nextPeriod];
}

function formatPeriodDetails(periods) {
  //This function collates, formats and displays the details of the upcoming periods
  var outputString = "";
  var perTwoDetails = getNextPeriodDetails(periods[1]);
  var perThreeDetails = getNextPeriodDetails(periods[2]);

  //Details for the next period
  outputString += "Next: " + perTwoDetails.period + " (" + perTwoDetails.day + " " + perTwoDetails.week + ")";
  if (perTwoDetails.lesson) {
    outputString += "\nSubject: " + perTwoDetails.subject + "\nRoom: " + perTwoDetails.room + "\nTeacher: " + perTwoDetails.teacher;
  } else {
    outputString += "\nNo Lesson";
  }
  outputString += "\n----\n";

  //Details for the period after next
  outputString += "After: " + perThreeDetails.period + " (" + perThreeDetails.day + " " + perThreeDetails.week + ")";
  if (perThreeDetails.lesson) {
    outputString += "\nSubject: " + perThreeDetails.subject + "\nRoom: " + perThreeDetails.room + "\nTeacher: " + perThreeDetails.teacher;
  } else {
    outputString += "\nNo Lesson";
  }
  outputString += "\n----";

  //Details for current period
  if (periods[0] != null) {
    var perOneDetails = getNextPeriodDetails(periods[0]);
    var outputStart = "Currently: " + perOneDetails.period + " (" + perOneDetails.day + " " + perOneDetails.week + ")";
    if (perOneDetails.lesson) {
      outputStart += "\nSubject: " + perOneDetails.subject + "\nRoom: " + perOneDetails.room + "\nTeacher: " + perOneDetails.teacher;
    } else {
      outputStart += "\nNo Lesson";
    }
    outputStart += "\n----\n";
    outputString = outputStart + outputString;
  }
  return outputString;
}

function returnWeekCycle() {
  //This function returns the week cycle (0 for Week A & 1 for Week B)

  var currentDate = new Date();
  var weekNo = getWeekNumber(currentDate);

  //Used to determine if the current week is in semester 1 or 2
  if (weekNo < 28) {
    var weekCycle = (weekNo - 1) % 2;
  } else {
    var weekCycle = weekNo % 2;
  }
  return weekCycle;
}

function getNextPeriodDetails(nextPeriod) {
  //This function gets the details of the next period

  var dayOfWeek = new Date().getDay();
  var weekCycle = returnWeekCycle();

  if (nextPeriod.startsWith("NextDay")) {
    // if it exceeds more than a day to next period
    if (dayOfWeek >= 5 || dayOfWeek == 0) {
      //if today is friday or a weekend
      weekCycle = (weekCycle + 1) % 2;
      dayOfWeek = 1;
    } else {
      dayOfWeek += 1;
    }
    nextPeriod = nextPeriod.substr(-2); //changing the next period to p1 or p2 of the next day
  }

  dayOfWeek -= 1; //change to be used in zero based array

  var todayTimetable = fortnightTimetable[weekCycle][
    dayOfWeek
  ].schedule.slice();
  todayTimetable = periodInsertionSort(todayTimetable);
  var posPeriod = periodBinarySearch(nextPeriod, todayTimetable);

  var weekdaysArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  var weeks = ["A", "B"];

  var periodDetailsObj = {
    lesson: true,
    day: weekdaysArr[dayOfWeek],
    week: weeks[weekCycle],
    period: nextPeriod
  };

  if (posPeriod != -1) {
    //checks if lesson is in next period
    Object.assign(periodDetailsObj, todayTimetable[posPeriod]); //copies details about class if period is on
    //periodDetailString += "\nSubject: " +  periodObj.subject + "\nRoom: " + periodObj.room + "\nTeacher: " + periodObj.teacher;
  } else {
    periodDetailsObj.lesson = false;
    //periodDetailString += "\nNo class next";
  }
  return periodDetailsObj;
}

function periodInsertionSort(origArray) {
  //This function sorts the daily timetable array using an insertion sort for the subsequent binary search
  var sortedArray = origArray.slice();
  var first = 0;
  var last = sortedArray.length - 1;
  var posOfNext = last - 1;
  while (posOfNext >= first) {
    var next = sortedArray[posOfNext];
    var current = posOfNext;
    while (current < last && next.period > sortedArray[current + 1].period) {
      current++;
      sortedArray[current - 1] = sortedArray[current];
    }
    sortedArray[current] = next;
    posOfNext--;
  }
  return sortedArray;
}

function periodBinarySearch(requiredName, sortedArray) {
  //This function performs a binary search to find the index of a given item
  var lower = 0;
  var upper = sortedArray.length - 1;
  var foundIt = false;
  var posFound = -1;

  do {
    var middle = Math.floor((lower + upper) / 2);
    if (requiredName == sortedArray[middle].period) {
      foundIt = true;
      posFound = middle;
    } else {
      if (requiredName < sortedArray[middle].period) {
        upper = middle - 1;
      } else {
        lower = middle + 1;
      }
    }
  } while (!foundIt && lower <= upper);

  return posFound;
}

function startUpdateTimetableProcess() {
  //This function begins the process of updating a timetable from the countdown screen

  goToPage(page6);
  try {
    //stop timer function from running
    clearTimeout(timerLoop);
  } catch (err) {
  } finally {
    makeFullTimetableScreen("updatedTimetable");
  }
}

function endUpdateTimetableProcess() {
  //This function ends the update timetable process

  document.getElementById("periodDtls").innerText = ""; //resets countdown details so it will be updated
  saveUpdTimetable("updatedTimetable");
}

function deleteTimetableData() {
  //This function deletes the timetable data stored in local storage
  var confBool = confirm(
    "Are you want to delete all timetable data. \nNote: Data cannot be recovered"
  );
  if (confBool) {
    localStorage.removeItem("fortnightTimetable");
    location.reload();
  }
}

function setUpSearch() {
  //This function initialises the query process
  var timetableClone = fortnightTimetable.slice(); //makes a copy of the array to not alter it

  var subjectNameArr = [];
  subjectNameObjsArr = [];

  var teacherNameArr = [];
  teacherNameObjsArr = [];

  var roomNameArr = [];
  roomNameObjsArr = [];

  var index = 0;
  var weeks = ["A", "B"];

  //Loop to get all unique classes,teachers & rooms
  for (var i = 0; i < timetableClone.length; i++) {
    for (var j = 0; j < timetableClone[i].length; j++) {
      for (var k = 0; k < timetableClone[i][j].schedule.length; k++) {
        var classObj = timetableClone[i][j].schedule[k];

        classObj.day = timetableClone[i][j].day; //adding 'day' to each record
        classObj.week = weeks[i]; //adding 'week' to each record

        //isolates all different subjects in the timetable
        var subjectName = classObj.subject;
        if (subjectNameArr.includes(subjectName)) {
          index = subjectNameArr.indexOf(subjectName);
          subjectNameObjsArr[index].push(classObj);
        } else {
          subjectNameArr.push(subjectName);
          subjectNameObjsArr.push([classObj]);
        }

        //isolates all different teachers in the timetable
        var teacherName = classObj.teacher;
        if (teacherNameArr.includes(teacherName)) {
          index = teacherNameArr.indexOf(teacherName);
          teacherNameObjsArr[index].push(classObj);
        } else {
          teacherNameArr.push(teacherName);
          teacherNameObjsArr.push([classObj]);
        }

        //isolates all different rooms in the timetable
        var roomName = classObj.room;
        if (roomNameArr.includes(roomName)) {
          index = roomNameArr.indexOf(roomName);
          roomNameObjsArr[index].push(classObj);
        } else {
          roomNameArr.push(roomName);
          roomNameObjsArr.push([classObj]);
        }
      }
    }
  }

  //Sorting all name arrays
  var sortedSubjectNameArr = insertionSort(subjectNameArr);
  var sortedTeacherNameArr = insertionSort(teacherNameArr);
  var sortedRoomNameArr = insertionSort(roomNameArr);

  //Loop to put all unique classes & etc. into a drop-down box
  for (var i = 0; i < sortedSubjectNameArr.length; i++) {
    var name = sortedSubjectNameArr[i];
    var pos = subjectNameArr.indexOf(name);
    var select = document.getElementById("subjectsDropDown");
    var opt = document.createElement("option");
    opt.textContent = name;
    opt.value = pos;
    select.appendChild(opt);
  }
  for (var i = 0; i < sortedTeacherNameArr.length; i++) {
    var name = sortedTeacherNameArr[i];
    var pos = teacherNameArr.indexOf(name);
    var select = document.getElementById("teachersDropDown");
    var opt = document.createElement("option");
    opt.textContent = name;
    opt.value = pos;
    select.appendChild(opt);
  }
  for (var i = 0; i < sortedRoomNameArr.length; i++) {
    var name = sortedRoomNameArr[i];
    var pos = roomNameArr.indexOf(name);
    var select = document.getElementById("roomsDropDown");
    var opt = document.createElement("option");
    opt.textContent = name;
    opt.value = pos;
    select.appendChild(opt);
  }

  goToPage(page7);
}

function createQueryTable(dropDownCriteria) {
  //This function returns the details from the query in a table

  var filter = document.getElementById(dropDownCriteria).value;

  //Check that a value was selected in the drop down box
  if (filter !== "-") {
    deleteExistingRows("queryResultsTable");

    //Determines which drop down box was selected and clears values in the other boxes
    if (dropDownCriteria == "subjectsDropDown") {
      var categoryArr = subjectNameObjsArr;
      document.getElementById("teachersDropDown").value = "-";
      document.getElementById("roomsDropDown").value = "-";
    } else if (dropDownCriteria == "teachersDropDown") {
      var categoryArr = teacherNameObjsArr;
      document.getElementById("subjectsDropDown").value = "-";
      document.getElementById("roomsDropDown").value = "-";
    } else {
      var categoryArr = roomNameObjsArr;
      document.getElementById("subjectsDropDown").value = "-";
      document.getElementById("teachersDropDown").value = "-";
    }

    //Loops through each object of the period matching the filter and adds it to the table
    var filteredArr = categoryArr[filter];
    for (var i = 0; i < filteredArr.length; i++) {
      var table = document.getElementById("queryResultsTable");
      var row = table.insertRow(-1);

      var weekCell = document.createElement("TD");
      weekCell.innerText = filteredArr[i].week;
      row.appendChild(weekCell);

      var dayCell = document.createElement("TD");
      dayCell.innerText = filteredArr[i].day;
      row.appendChild(dayCell);

      var periodCell = document.createElement("TD");
      periodCell.innerText = filteredArr[i].period;
      row.appendChild(periodCell);

      var subjectCell = document.createElement("TD");
      subjectCell.innerText = filteredArr[i].subject;
      row.appendChild(subjectCell);

      var roomCell = document.createElement("TD");
      roomCell.innerText = filteredArr[i].room;
      row.appendChild(roomCell);

      var teacherCell = document.createElement("TD");
      teacherCell.innerText = filteredArr[i].teacher;
      row.appendChild(teacherCell);
    }
  }
}

function deleteExistingRows(tableName) {
  //This function deletes all existing rows in a given table (excluding heading row)
  var table = document.getElementById(tableName);
  while (table.rows.length > 1) {
    table.deleteRow(-1);
  }
}

function resetQueryPage() {
  //This function resets the query page after it has been exited
  goToPage(page5);
  resetPage("page7");
}
