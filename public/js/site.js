 //Globals
 var curUser;

 // Initialize Firebase
 var config = {
     apiKey: "AIzaSyAKypRvUnUzE6XmUIXCOIe4Al2x2Xd593s",
     authDomain: "chaplains-63a1a.firebaseapp.com",
     databaseURL: "https://chaplains-63a1a.firebaseio.com",
     projectId: "chaplains-63a1a",
     storageBucket: "chaplains-63a1a.appspot.com",
     messagingSenderId: "776082682108"
 };
 firebase.initializeApp(config);

 //Get report counts for chart
 var ddCount = 0;
 var paCount = 0;
 var riseCount = 0;
 var reportsRef = firebase.database().ref("/reports/");
 reportsRef.on('value', function(snapshot) {
     //This loops over every child of the reports node.
     snapshot.forEach(function(childSnapshot) {
         var childData = childSnapshot.val();
         var type = childData.type;
         if (type == "RISE Report")
             riseCount += 1;
         else if (type == "Patrol Activity Report")
             paCount += 1;
         else if (type == "Domestic Disturbance Report")
             ddCount += 1;
         else console.log("Error: report type not found.")
     });
 });

 //Initialize Google Map plugin
 var map;
 var geocoder;
 var infowindow;

 function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
         center: { lat: 36.737376, lng: -119.788185 },
         zoom: 11
     });

     geocoder = new google.maps.Geocoder;
     infowindow = new google.maps.InfoWindow;

 }

 function attachInfo(marker, msg) {
     var infowindow = new google.maps.InfoWindow({
         content: msg
     });
     marker.addListener("click", function() {
         infowindow.open(marker.get('resultsMap'), marker);
     })
 }


 function geocodeAddress(geocoder, resultsMap, address, type, data) {
     geocoder.geocode({ 'address': address }, function(results, status) {
         if (status === 'OK') {
             resultsMap.setCenter(results[0].geometry.location);
             var color = "yellow";
             if (type === "RISE Report")
                 color = "darkviolet";
             else if (type === "Patrol Activity Report")
                 color = "deepskyblue";
             else if (type === "Domestic Disturbance Report")
                 color = "crimson";
             var customIcon = {
                 path: "M59.54,0A59.55,59.55,0,0,0,0,59.54c0,.22,0,.48,0,.77A39.93,39.93,0,0,0,2.79,73.6l7.76,19.79L59.43,218,108,94.12l8.92-23.29A31.84,31.84,0,0,0,119.08,60c0-.16,0-.31,0-.44A59.55,59.55,0,0,0,59.54,0Zm0,87.79A29.77,29.77,0,1,1,89.31,58,29.77,29.77,0,0,1,59.54,87.79Z",
                 fillColor: color,
                 fillOpacity: 0.8,
                 scale: 0.2,
                 strokeColor: "white",
                 strokeWeight: 3,
                 strokeOpacity: 0.5,
             }
             var marker = new google.maps.Marker({
                 map: resultsMap,
                 position: results[0].geometry.location,
                 icon: customIcon
             });
             attachInfo(marker, address + "<br/>" + data.date)

         } else {
             alert('Geocode was not successful for the following reason: ' + status);
         }
     });
 }

 function geocodeLatLng(geocoder, map, infowindow, latitude, longitude) {
     var latlng = { lat: latitude, lng: longitude };
     geocoder.geocode({ 'location': latlng }, function(results, status) {
         if (status === 'OK') {
             if (results[0]) {
                 map.setZoom(11);
                 var marker = new google.maps.Marker({
                     position: latlng,
                     map: map
                 });
                 infowindow.setContent(results[0].formatted_address);
                 vm.report.address = results[0].address_components[0].short_name + " " + results[0].address_components[1].short_name;
                 vm.report.city = results[0].address_components[3].short_name;
                 vm.report.state = results[0].address_components[5].short_name;
                 if (results[0].address_components[7])
                     vm.report.zip = results[0].address_components[7].short_name;
                 else vm.report.zip = results[0].address_components[6].short_name;
                 infowindow.open(map, marker);
                 var loader = document.getElementById("loader");
                 loader.style.opacity = "0";
             } else {
                 window.alert('No results found');
             }
         } else {
             window.alert('Geocoder failed due to: ' + status);
         }
     });
 }

 //Get map markers from firebase
 function loadMarkers() {
     var ref = firebase.database().ref("reports");
     var reports = [];
     ref.once('value', function(snapshot) {
         //This loops over every child of the reports node.
         snapshot.forEach(function(childSnapshot) {
             var childKey = childSnapshot.key;
             var childData = childSnapshot.val();
             geocodeAddress(geocoder, map, childData.address, childData.type, childData);
         });
     });
 }


 //Initialize the Vue vm
 var vm = new Vue({
     el: '.content',
     created() {

         // find and set user
         firebase.auth().onAuthStateChanged((user) => {

             if (!user) {
                 vm.user.role = "";
                 return;
             } else if (firebase.auth().currentUser) {

                 //Communicate via the interface that login was successful
                 var dang = document.getElementsByClassName("danger");
                 var passInput = document.getElementById("pass");
                 var pWarning = document.getElementById("warning");
                 pWarning.classList.add("success");
                 vm.warning = "Success! You are now logged in.";
                 //remove danger style from elements so as not to confuse the user
                 for (var i = 0; i < dang.length; i++) {
                     dang[i].classList.remove("danger");

                 }

                 //set user data in the viewmodel
                 vm.user.uid = user.uid;
                 vm.report.user = user.uid;
                 if (user.displayName) vm.user.name = user.displayName;

                 //get current user from fbase and check role
                 //do things accordingly
                 var ref = firebase.database().ref("users/" + user.uid);
                 var role;
                 ref.on('value', function(snapshot) {
                     if (snapshot.val()) role = snapshot.val().role;
                     if (role === "admin") {
                         vm.user.role = "admin";
                         //do admin things
                         loadMarkers();
                     } else
                         vm.user.role = "user";
                 });
             }

         });

     },
     data: {
         page: "Home",
         user: { name: "", uid: "", role: "" },
         email: "",
         pass: "",
         signUp: false,
         signedIn: false,
         warning: "",
         nightMode: false,
         stepsVisible: false,
         currentStep: { index: 0, title: "Basic info", progress: "p10", steps: {} },
         submitAlert: "Success! Thank you for submitting your report.",
         reportAddress: [],
         report: {
             group: false,
             address: "",
             zip: "",
             reason: ""
         },
         messages: [
             { date: "8/3/2017", message: "Welcome to ChapApp! Use the button above to get started on your first activity report." },
         ],
         reportTypes: [
             { index: 0, class: "btnPurple", title: "RISE Report", steps: [{ index: 0, title: "Basic info", progress: "p10" }, { index: 1, title: "Time & date", progress: "p20" }, { index: 2, title: "Demographics", progress: "p40" }, { index: 3, title: "Location", progress: "p60" }, { index: 4, title: "Event info", progress: "p80" }, { index: 5, title: "Conclusion", progress: "p90" }, { index: 6, title: "Submit", progress: "p100" }] },
             { index: 1, class: "btnRed", title: "Domestic Disturbance Report", steps: [{ index: 0, title: "Basic info", progress: "p10" }, { index: 1, title: "Time & date", progress: "p30" }, { index: 2, title: "Location", progress: "p50" }, { index: 3, title: "Primary contact", progress: "p70" }, { index: 4, title: "Referral", progress: "p80" }, { index: 5, title: "Conclusion", progress: "p90" }, { index: 6, title: "Submit", progress: "p100" }] },
             { index: 2, class: "btnBlue", title: "Patrol Activity Report", steps: [{ index: 0, title: "Basic info", progress: "p10" }, { index: 1, title: "Time & date", progress: "p20" }, { index: 2, title: "Event info", progress: "p40" }, { index: 3, title: "Location", progress: "p60" }, { index: 4, title: "Primary contact", progress: "p80" }, { index: 5, title: "Conclusion", progress: "p90" }, { index: 6, title: "Submit", progress: "p100" }] }
         ],

         selectedReport: {}
     },
     computed: {
         selectedSteps() {
             var steps = this.selectedReport.steps;
             if (steps) return steps.slice(0, steps.length - 1);
         }
     },

     methods: {
         toggleNav: function() {
             //toggles the collapsed state of the navbar
             var nav = document.getElementById("navbar");
             if (document.width >= 800) {
                 if (nav.classList.contains("collapse")) {
                     nav.className = "";
                 } else
                     nav.className = "collapse";
             }
         },
         signIn: function() {
             //sign in with firebase
             firebase.auth().signInWithEmailAndPassword(vm.email, vm.pass).then(function(){
                //No errors occurred!
                 vm.signedIn = true;

             }).catch(function(error) {
                 // Handle Errors here.
                 if (error) {
                     errorHappened = true;
                     var errorCode = error.code;
                     var errorMessage = error.message;
                     var passInput = document.getElementById("pass");
                     var pWarning = document.getElementById("warning");
                     if (errorCode === 'auth/wrong-password' && passInput) {
                         passInput.classList.add("danger");
                         passInput.classList.add("weakPass");
                         pWarning.classList.remove("success");
                         pWarning.classList.add("danger");
                         vm.pass = "";
                         vm.warning = "Email or password is incorrect.";
                     } else {
                         vm.warning = errorMessage;
                     }
                 }
             });
         },

         signUpUser: function() {
             //create a new user in firebase

             firebase.auth().createUserWithEmailAndPassword(vm.email, vm.pass).then(function(){
                //Signup was successful! add a display name for this user:
                firebase.auth().currentUser.updateProfile({displayName: vm.user.name});

             }).catch(function(error) {
                 //Something went wrong in the signup process, so show the user an error message.
                 if (error) {
                     errorHappened = true;
                     var errorCode = error.code;
                     var errorMessage = error.message;
                     //UI alert if the error can be solved by the user
                     var passInput = document.getElementById("pass");
                     var pWarning = document.getElementById("warning");
                         passInput.classList.add("danger");
                         pWarning.classList.remove("success");
                         pWarning.classList.add("danger");
                     if (errorCode === 'auth/weak-password') {
                         passInput.classList.add("weakPass");
                         vm.pass = "";
                         vm.warning = "That password is not strong enough. Try to create a password with more than six characters that contains both letters and numbers.";
                     } else {
                         vm.warning = error.message;
                     }
                 }
             });

         },
         signOut: function() {
             vm.signedIn = false;
             firebase.auth().signOut();
             //clear the user name and role so that the interface doesn't show anything to a nonuser
             vm.user.name = "";
             vm.user.role = "";
             //clear the login warning
             vm.warning = "";
             var pWarning = document.getElementById(warning);
             warning.classList = ""; //remove success or danger class that may be applied to login warning
         },
         closeModal: function() {
             var modal = document.getElementById("modal");
             modal.style.display = "none";
         },
         showModal: function() {
             var modal = document.getElementById("modal");
             modal.style.display = "block";
         },
         showCard: function() {
             var card = document.getElementById("card");
             var pageContainer = document.getElementsByClassName("pages")[0];
             card.style.left = "0";
             pageContainer.style.left = "0";
             setTimeout(function() {
                 vm.page = "<small>" + vm.selectedReport.title + "</small>";
             }, 300)

         },
         hideCard: function() {
             var index = vm.selectedReport.index;
             var card = document.getElementById("card");
             var pageContainer = document.getElementsByClassName("pages")[0];
             card.style.left = "100vw";
             pageContainer.style.display = "none";
             pageContainer.style.left = "100vw";
             //reset step number and label
             vm.currentStep = vm.reportTypes[vm.selectedReport.index].steps[0];
             setTimeout(function() {
                 pageContainer.style.display = "flex";
             }, 300)
             vm.page = "Report";
             vm.report = {};
             document.body.classList = "";
         },
         nextStep: function(event) {
             if (event) event.stopPropagation();
             var curStep = vm.currentStep;
             var nextStep = vm.reportTypes[vm.selectedReport.index].steps[vm.currentStep.index + 1];
             var pageContainer = document.getElementsByClassName("pages")[0];
             var left = pageContainer.style.left || 0;
             var loc = parseInt(left, 10);
             loc -= 100;
             loc += "vw";
             pageContainer.style.left = loc;
             if (nextStep)
                 vm.currentStep = nextStep;
             setTimeout(function() {
                 //do nothing
             }, 200);

         },
         chooseStep: function(e) {
             var stepNum = e.target.innerText;
             var step = parseInt(stepNum, 10);
             step -= 1; //because the array index and the number we want to display are offset by 1
             var targetStep = vm.selectedReport.steps[step]; //index of target step in the selected report's steps array
             var pageContainer = document.getElementsByClassName("pages")[0];
             var left = pageContainer.style.left || 0;
             var loc = parseInt(left, 10);
             var diff = vm.currentStep.index - step;
             loc += (100 * diff);
             loc += "vw";
             pageContainer.style.left = loc;
             //reset step number and label
             vm.currentStep = vm.reportTypes[vm.selectedReport.index].steps[step];
         },
         showSteps: function() {
             var stepchildren = document.getElementsByClassName("stepchild");
             for (var i = 0; i < stepchildren.length; i++) {
                 stepchildren[i].style.width = "30px";
                 stepchildren[i].style.height = "30px";
             }
             vm.stepsVisible = true;
         },
         hideSteps: function() {
             var stepchildren = document.getElementsByClassName("stepchild");
             for (var i = 0; i < stepchildren.length; i++) {
                 stepchildren[i].style.width = "0px";
                 stepchildren[i].style.height = "0px";
             }
             vm.stepsVisible = false;
         },
         toggleSteps: function() {
             if (vm.stepsVisible)
                 vm.hideSteps();
             else
                 vm.showSteps();
         },
         submitForm: function() {
             vm.nextStep();
             var ref = firebase.database().ref("/reports");
             var req = document.getElementsByClassName("required");
             var done = true;
             for (var i = 0; i < req.length; i++) {
                 if (!req[i].children[1].value || req[i].children[1].value.length == 0) {
                     req[i].classList.add("danger");
                     done = false;
                 }
             }
             if (done) {
                 vm.submitAlert = "Success! Thank you for submitting your report."
                 ref.push(vm.report);
             } else vm.submitAlert = "Please fill out all required fields before submitting."
         },
         selectReport: function() {
             var index = event.target.id;
             vm.selectedReport = vm.reportTypes[index];
             vm.report.type = vm.selectedReport.title;
             vm.showCard();
         },

         scrollTo: function(event) {
             //when making a button that triggers a scroll to another element,
             //the button's id should be the id of the target + "Btn"
             //ex. the button for scrolling to #map should be #mapBtn
             //this way the id works like an argument being passed to the function
             //and we don't have ~16 different functions to do the exact same thing
             //then we pass the id to the real scroll function hooray

             event.stopPropagation();
             var id = event.target.id.slice(0, -3);
             vm.scroll(id);

         },
         scroll: function(id) {
             var target = document.getElementById(id);
             var to = target.offsetTop;
             var scroll = document.body.scrollTop;
             var diff = to - scroll;
             var dir = 1; //sugar we're scrolling down
             if (diff < 0) {
                 dir = -1; //we need to scroll up instead of down
                 diff += (2 * diff); //make sure diff is not negative w/crude abs value calculation
             }
             if (to >= 50) to -= 50; //account for height of nav bar
             //attempt at ease in-out like scroll
             var getAmt = function(scroll) {
                 //scroll 8px at a time if we're in the first or last 6th of the scroll distance
                 if ((scroll <= (diff / 6)) || scroll >= ((diff / 6) * 5)) return 8;
                 //scroll 16px at a time if we're in the first or last 3rd of the scroll distance
                 else if ((scroll <= (diff / 3)) || scroll >= ((diff / 3) * 2)) return 16;
                 //scroll 22 px at a time during the middle third of the scroll distance
                 else return 22;
                 //these are all arbitrary magic numbers but hey, it works
             };
             var scrollInterval = setInterval(function() {
                 document.body.scrollTop = document.body.scrollTop + (dir * getAmt(scroll));
                 scroll = document.body.scrollTop;

                 if ((dir === 1) && scroll >= to) {
                     clearInterval(scrollInterval);
                     return;
                 } else if ((dir === -1) && scroll <= to) {
                     clearInterval(scrollInterval);
                     return;
                 }

             }, 10);

         },
         getLocation: function() {
             var loader = document.getElementById("loader");
             loader.style.opacity = "100";
             if (navigator.geolocation) {
                 navigator.geolocation.getCurrentPosition(vm.showPosition);
             } else {
                 alert("Geolocation is not supported by this browser.");
             }
         },
         showPosition: function(pos) {
             geocodeLatLng(geocoder, map, infowindow, pos.coords.latitude, pos.coords.longitude);

         },
         toggleMode: function() {
             if (vm.nightMode)
                 vm.nightMode = false;
             else
                 vm.nightMode = true;
         },
         closeReport: function() {
             vm.hideCard();
             vm.report = {
                 group: false,
                 address: "",
                 zip: "",
                 reason: "",
                 referredFor: ""
             }
             var req = document.getElementsByClassName("danger");
             while (req.length != 0) {
                 req = document.getElementsByClassName("danger");
                 for (var i = 0; i < req.length; i++) {
                     req[i].classList.remove("danger");
                 }
             }
         }
     }
 })


 //Watch scroll position
 document.onscroll = function() {
     var pos = document.body.scrollTop;
     var s1 = document.getElementById("section1").offsetTop;
     var s2 = document.getElementById("section2").offsetTop - 50;
     var s3 = document.getElementById("section3").offsetTop - 50;
     if (pos < s2) vm.page = "Home";
     else if (pos < s3) vm.page = "Report";
     else vm.page = "Map";
 }


 document.body.onload = function() {
     var ss = document.getElementsByClassName("splashScreen")[0];
     ss.style.opacity = 0;
     setTimeout(function() {
         ss.style.display = "none";
     }, 300);
     //event binding for enter key in password field
     document.getElementById("pass").onkeydown = function(e) {
         e = e || window.event;
         if (e.keyCode == 13) //the enter key was pressed - 13 is its code
             vm.signIn();
     }

     //Initialize chart
     var ctx = document.getElementById("myChart");
     var myChart = new Chart(ctx, {
         type: 'bar',
         data: {
             labels: ["Domestic Disturbance Reports", "Patrol Activity Reports", "RISE Reports"],
             datasets: [{
                 label: '# of Reports',
                 data: [ddCount, paCount, riseCount],
                 backgroundColor: [
                     'rgba(255, 99, 132, 0.3)',
                     'rgba(54, 162, 235, 0.3)',
                     'rgba(153, 102, 255, 0.3)',
                 ],
                 borderColor: [
                     'rgba(255,99,132,1)',
                     'rgba(54, 162, 235, 1)',
                     'rgba(153, 102, 255, 1)',
                 ],
                 borderWidth: 2
             }]
         },
         options: {
             scales: {
                 yAxes: [{
                     ticks: {
                         beginAtZero: true,
                         stepSize: 1
                     }
                 }]
             }
         }
     });
 }