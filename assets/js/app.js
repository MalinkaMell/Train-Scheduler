$(document).ready(function () {
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyCl8K7fNlw49a2Od9Zy4Pb3msjcAC5s9f0",
        authDomain: "train-schedule-71f2c.firebaseapp.com",
        databaseURL: "https://train-schedule-71f2c.firebaseio.com",
        projectId: "train-schedule-71f2c",
        storageBucket: "",
        messagingSenderId: "274296216200",
        appId: "1:274296216200:web:7c9ace85f0761fdcb0dd3d"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    //declare database variable
    let database = firebase.database();

    //if we remove train from the list, show alert to user and refresh the page
    database.ref("/trains").on("child_removed", function (snapshot) {
        alert("Train " + snapshot.val().name + "has been removed");
        location.reload();
    })
    database.ref("/trains").on("child_changed", function (snapshot) {
        alert("Train " + snapshot.val().name + "has been updated");
        location.reload();
    })

    //here all the rows with information are being created
    function createRow() {

        database.ref("/trains").on("child_added", function (snapshot) {

            //long jQuery list, creating table cells - 7 cells
            let tableRow = $("<tr>");
            let tableCellOne = $("<td>");
            let tableCellTwo = $("<td>");
            let tableCellThree = $("<td>");
            let tableCellFour = $("<td>");
            let tableCellFive = $("<td>");
            let tableCellSix = $("<td>");
            let tableCellSeven = $("<td>");

            //remove button
            let btnRemove = $("<button>");
            btnRemove.attr("id", "remove");
            btnRemove.attr("class", "btn btn-danger");
            btnRemove.attr("value", snapshot.key);
            btnRemove.text("Remove");

            //update button
            let btnUpdate = $("<button>");
            btnUpdate.attr("data-toggle", "modal");
            btnUpdate.attr("id", "update");
            btnUpdate.attr("data-toggle", "modal");
            btnUpdate.attr("data-target", "#updateModal");
            btnUpdate.attr("class", "btn btn-secondary");
            btnUpdate.attr("value", snapshot.key);
            btnUpdate.text("Update");

            //finally appending everything
            tableRow.append(tableCellOne);
            tableRow.append(tableCellTwo);
            tableRow.append(tableCellThree);
            tableRow.append(tableCellFour);
            tableRow.append(tableCellFive);
            tableRow.append(tableCellSix);
            tableRow.append(tableCellSeven);

            $("#tbody").prepend(tableRow);

            //variables are cleaner for use
            let snapshotValue = snapshot.val();
            let tFrequency = snapshotValue.frequency;
            let firstTrain = snapshotValue.firstTrain;

            // First Time (pushed back 1 year to make sure it comes before current time)
            //uhm! got this from class activities, good idea :)
            let firstTrainConverted = moment(firstTrain, "HH:mm").subtract(1, "years");
            let diffTime = moment().diff(moment(firstTrainConverted), "minutes"); //calculating difference
            let tRemainder = diffTime % tFrequency; // Find remainder
            let minsTillNext = tFrequency - tRemainder; // Till next train
            let nextTrain = moment().add(minsTillNext, "minutes"); // Next Train
            let nextTrainFormatted = moment(nextTrain).format("HH:mm"); //formatting military style

            //and showing all the info in our table
            tableCellOne.html(snapshotValue.name); //name
            tableCellTwo.text(snapshotValue.destination); //destinaion
            tableCellThree.text(tFrequency); //frequency
            tableCellFour.text(nextTrainFormatted); //next train at
            tableCellFive.text(minsTillNext); //minutes till next train
            tableCellSix.html(btnUpdate); // update train button 
            tableCellSeven.html(btnRemove); // remove train button

        })

    }

    //what happens if we click submit? 
    $("#submit").on("click", function () {

        event.preventDefault();

        let name = $("#name").val().trim(); //get name value and set it to variable
        let destination = $("#destination").val().trim(); //get destination value and set it to variable
        let firstTrain = $("#first-train").val().trim(); //get firstTrain value and set it to variable
        let frequency = $("#frequency").val().trim(); //get frequency value and set it to variable

        //validating form, all fields are required!
        if (name === "" || destination === "" || firstTrain === "" || frequency === "") {
            alert("All fields are required!")
        }
        //if all the inputs has been filled
        else {
            //open db and push that information to /trains folder
            database
                .ref("/trains")
                .push({
                    name: name,
                    destination: destination,
                    firstTrain: firstTrain,
                    frequency: frequency
                })

            alert("the train was successfully added"); // happy allert that we did everything right :D

            //and emptying all the fields
            name = $("#name").val("");
            destination = $("#destination").val("");
            firstTrain = $("#first-train").val("");
            frequency = $("#frequency").val("");
        }

    });


    //if i click remove button
    $("body").on("click", "#remove", function () {
        event.preventDefault();
        let key = $(this).val(); //find unique id that i saved previously as a value
        //console.log(key); // make sure i have it
        let trainsList = database.ref("/trains"); //open trains directory
        trainsList.child(key).remove(); //removing the entry
    })

    //if i click update button
    $("body").on("click", "#update", function () {

        event.preventDefault();
        let t = $(this).val(); //retriving the unique ID
        console.log(t) //make sure i have it
        $("#editID").text(t); //saving that ID for further use

        let trainsList = database.ref("/trains"); //open trains directory

        //opening the child with that unique ID and filling in the input fields with that information, 
        //in case not all of the felds are being updated, so i am saving the old values
        trainsList.child(t).on("value", function (snapshot) {
            let snapValue = snapshot.val();
            console.log(snapValue)
            $("#editName").val(snapValue.name);
            $("#editDestination").val(snapValue.destination);
            $("#editFirstTime").val(snapValue.firstTrain);
            $("#editFrequency").val(snapValue.frequency);
        })
    })


    //here we are clicking on submit button in update modal
    $("body").on("click", "#updateButton", function () {

        let editName = $("#editName").val().trim(); //new name
        let editDestination = $("#editDestination").val().trim(); //new destination

        /* here is huge bug: if I input any time that is major than frequency, it act weeird,
        so i am not going to show it at all

        let editFirstTime = $("#editFirstTime").val().trim(); //new first time
        */

        let editFrequency = $("#editFrequency").val().trim(); //new frequency
        let id = $("#editID").text(); // our unique ID

        let trainsList = database.ref("/trains"); //open trains directory

        //updating info
        trainsList.child(id).update({
            name: editName,
            destination: editDestination,
            // firstTrain: editFirstTime,
            frequency: editFrequency
        });

        $('#updateModal').modal('hide'); // hide this damn modal after submiting
        location.reload(); //reload to update info
    })

    createRow();

})