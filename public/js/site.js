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

         //DEVELOPMENT ONLY
         //TODO: remove before publishing!
         /*
         firebase.auth().signInWithEmailAndPassword("montanna@mjttech.com", "ChaplainsAreCool2017!")
             .catch(function(error) {
                 // Handle Errors here.
                 var errorCode = error.code;
                 var errorMessage = error.message;
                 if (errorCode === 'auth/wrong-password') {
                     alert('Wrong password.');
                 } else {
                     alert(errorMessage);
                 }
                 console.log(error);
             });
             */

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
                 if (role === "admin")
                     vm.user.role = "admin";
                 else
                     vm.user.role = "user";
             });




         });


     },
     data: {
         user: { name: "", uid: "", role: "" },
         email: "",
         pass: "",
         warning: "",
         messages: [
             { date: "4/13/2017" },
             { date: "4/11/2017" },


         ]
     },
     computed: {
         getPageFromScrollPos: function() {
             //checks the scroll positition, then sets the label in the nav bar accordingly
             var pos = document.body.scrollTop;
             var s1 = document.getElementById("section1").getBoundingClientRect().top;
             var s2 = document.getElementById("section2").getBoundingClientRect().top;
             if (pos < s2) return "Home";
             else return "";
         }
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
         startReport: function() {

         }

     }
 })



 //document.addEventListener("DOMContentLoaded", function(event) {
 //Replaces $(document).ready(){}
 //because who needs jQuery in 2017

 //});
