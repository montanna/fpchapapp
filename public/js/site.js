var getPageFromScrollPos = function() {
    var pos = document.body.scrollTop;
    var s1 = document.getElementById("section1").getBoundingClientRect().top;
    var s2 = document.getElementById("section2").getBoundingClientRect().top;
    if (pos < s2) return "Home";
}

function initVue() {

    var navHeader = new Vue({
        el: '#navHeader',
        data: {
            page: getPageFromScrollPos()
        }
    });
    var navCollapseToggleHamburger = new Vue({
        el: '.navCollapseToggleBtn', //the hamburger icon in the nav bar
        data: {
            toggleNav: function() {
                var nav = document.getElementById("navbar");
                if (nav.classList.contains("collapse")) {
                    nav.className = "";
                } else
                    nav.className = "collapse";
            }
        }
    });
    var navCollapseToggleWholeBar = new Vue({
        el: '#navbar', //the whole length of the nav bar
        data: {
            toggleNav: function() {
                var nav = document.getElementById("navbar");
                if (nav.classList.contains("collapse")) {
                    nav.className = "";
                } else
                    nav.className = "collapse";
            }
        }
    });
    var userWelcome = new Vue({
        el: '#userWelcome',
        data: {
            user: "Rodney" //TODO: replace with firebase user name variable
        }
    })
}

document.addEventListener("DOMContentLoaded", function(event) {
    //Replaces $(document).ready(){}
    //because who needs jQuery in 2017
    initVue();

});
