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





 //Initialize the Vue vm
 var vm = new Vue({
     el: '.content',
     created() {

         // find and set user
         firebase.auth().onAuthStateChanged((user) => {

             if (!user) {
                 vm.user.role = "";
                 return;
             }
             //Communicate via the interface that login was successful
             var dang = document.getElementsByClassName("danger");
             var passInput = document.getElementById("pass");
             var pWarning = document.getElementById("warning");
             pWarning.classList.add("success");
             vm.warning = "Success! You are now logged in.";
             for (var i = 0; i < dang.length; i++) {
                 dang[i].classList.remove("danger");

             }
             //set user data in the viewmodel
             vm.user.uid = user.uid;
             vm.user.name = user.displayName;

             //get list of users with admin role to see if the current user is one
             var ref = firebase.database().ref("users/" + user.uid);
             var role;
             ref.on('value', function(snapshot) {
                 role = snapshot.val().role;
                 if (role === "admin") {
                     vm.user.role = "admin";
                 } else
                     vm.user.role = "user";
             });

         });

     },
     data: {
         page: "Home",
         user: { name: "", uid: "", role: "" },
         email: "",
         pass: "",
         warning: "",
         selectedReport: { index: 0, class: "", title: "" },
         messages: [
             { date: "4/13/2017" },
             { date: "4/11/2017" },
         ],
         reportTypes: [
             { index: 0, class: "btnPurple", title: "RISE Report", steps: [""] },
             { index: 1, class: "btnRed", title: "Domestic Disturbance Report" },
             { index: 2, class: "btnBlue", title: "Chaplain Activity Report" }
         ]
     },
     methods: {
         toggleNav: function() {
             //toggles the collapsed state of the navbar
             var nav = document.getElementById("navbar");
             if (nav.classList.contains("collapse")) {
                 nav.className = "";
             } else
                 nav.className = "collapse";
         },
         signIn: function() {
             //sign in with firebase
             firebase.auth().signInWithEmailAndPassword(vm.email, vm.pass)
                 .catch(function(error) {
                     // Handle Errors here.
                     var errorCode = error.code;
                     var errorMessage = error.message;
                     if (errorCode === 'auth/wrong-password') {
                         var passInput = document.getElementById("pass");
                         var pWarning = document.getElementById("warning");
                         passInput.classList.add("danger");
                         passInput.classList.add("weakPass");
                         pWarning.classList.remove("success");
                         pWarning.classList.add("danger");
                         vm.pass = "";
                         vm.warning = "Email or password is incorrect.";
                     } else {
                         alert(errorMessage);
                     }
                 });
         },
         signUp: function() {
             //create a new user in firebase
             firebase.auth().createUserWithEmailAndPassword(vm.email, vm.pass).catch(function(error) {
                 // Handle Errors here.
                 var errorCode = error.code;
                 var errorMessage = error.message;
                 console.log(error);
                 if (errorCode === 'auth/weak-password') {
                     var passInput = document.getElementById("pass");
                     var pWarning = document.getElementById("warning");
                     passInput.classList.add("danger");
                     passInput.classList.add("weakPass");
                     pWarning.classList.remove("success");
                     pWarning.classList.add("danger");
                     vm.pass = "";
                     vm.warning = "That password is incorrect.";
                 }
             });
         },
         signOut: function() {
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
             card.style.left = "0";
             vm.page = "<small>" + vm.selectedReport.title + "</small>";

         },
         hideCard: function() {
             var card = document.getElementById("card");
             card.style.left = "100vw";
             vm.page = "Report";
         },
         selectReport: function() {
             var index = event.target.id;
             vm.selectedReport = vm.reportTypes[index];
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

 //Initialize Google Map plugin only if user is an admin
 var map;

 function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
         center: { lat: 36.737376, lng: -119.788185 },
         zoom: 11
     });

     var geocoder = new google.maps.Geocoder();

     //document.getElementById('submit').addEventListener('click', function() {
     geocodeAddress(geocoder, map);
     // });
 }


 function geocodeAddress(geocoder, resultsMap) {
     var address = "700 Van Ness Ave Fresno CA"
     geocoder.geocode({ 'address': address }, function(results, status) {
         if (status === 'OK') {
             resultsMap.setCenter(results[0].geometry.location);
             var marker = new google.maps.Marker({
                 map: resultsMap,
                 position: results[0].geometry.location
             });
         } else {
             alert('Geocode was not successful for the following reason: ' + status);
         }
     });
 }
