
/*
Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
Martrikelnummer : 1111 0647
Stand : 13.03.2019
*/

const FADER_NUMBER = 4;
const FADER_AMOUNT = 512;

const SLIDER_VALUE_UPDATE_FREQ = 200; //1/ms

const SCENE_FRAME_TIME = 33; //ms

const MEDIA_BREAKPOINT_MOBILE = 600;


var $scene_template;

var packetCounter;

var slider_index = 0;
var socket;
var currentFaderIndex;

var lastDmxStatus;

var scenes = [];
var allFaderValues;

var profileList = [];
var currentProfile;
var currentUniverseID = 0;

var universes;

var highestSceneID = 1;

var firstRequestDone = false;
var sceneModActive = false;





$(document).ready(function() {

  if(document.documentElement.clientWidth < 600){
    $(".olaHeading").remove();
    switchMode(0);
  }


  //Clone the scene_template and save it in a variable
  //Check for touch support
  var touchsupport = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  if (!touchsupport){ // browser doesn't support touch
	 document.documentElement.className += " non-touch"
   console.log("No touch support on this browser/device ");
  }




  //Bah! Do it nice!
  $scene_template = $(".scene_template").clone();
  $(".scene_template").hide();

  socket = io.connect(window.location.origin);

  resizeAllFader(".universeContainer-0");
  colorAllFader(COLOR_INACTIVE, ".universeContainer-0");

  //AppManager.init();

  socket.on("dmx_change", function(msg) {
    AppManager.getCurrentProfile().setOneFaderValue(msg.universe, msg.faderID, msg.faderValue);
  });

  socket.on("master_val", function(msg){
    AppManager.getCurrentProfile().setMasterValue( msg );
  });

  socket.on("connect", function() {
    $("#currentStatusText").text("Connected");
    $("#appStatusIcon").addClass("is-connected");
  });

  socket.on("disconnect", function() {
    $("#currentStatusText").text("Disconnected");
    $("#appStatusIcon").removeClass("is-connected");
  });

  $("#dmxRequest").on("click", function() {
    AppManager.rerequestDmxStatus();
  });

  $(".universeTag").on("click", function(){
    $(".universeTag").removeClass("is-activeUniverseTag");
    $(this).addClass("is-activeUniverseTag");

  });

  $("#burgerMenu").on("click", () => {
    $("#mySidenav").addClass("is-extended");
  });

  $("#addScene").on("click", () => {
    if (sceneModActive) {
      toggleSceneMod();
    }

    let tmpUniverses = AppManager.universes();
    $(".universeSelectContainer").empty();
    for( let i=0; i<tmpUniverses.length; i++ ){
      let tmpButton = $("<button></button>");
      tmpButton.addClass("universeToTrackBtn");
      tmpButton.addClass("activeMode");
      tmpButton.on("click", function(){
        $(this).toggleClass("activeMode");
      });
      tmpButton.data("universeID",i);
      tmpButton.text("U - "+tmpUniverses[i].id);
      $(".universeSelectContainer").append(tmpButton);
    }
    openModal("newSceneModal");
  });


  $(".profileManagerLink").on("click", ()=>{
    console.log("TWEST");
    openModal("profileManagerModal");
  });

  $(".toggleFullscreenOption").on("click", ()=>{
    toggleFullScreen();
  });

  $("#modScene").on("click", () => {
    toggleSceneMod();

  });




  $(".addProfileBtn").on("click",() =>{
    if( AppManager.getLoginStatus() ){
      openModal("addProfileModal");
    }
    else{
      openModal("loginModal");
    }
  });

  $(".addProfileConfirmBtn").on("click",()=>{
    let profileName = $(".addProfileName").val();
    AppManager.addCurrentProfile(profileName);
    closeModal();
  });

  $("#showHideMaster").on("click", function() {
    $("#faderContainer").toggleClass("faderContainerSmall");
    $("#faderContainer").toggleClass("faderContainerBig");
    $(this).toggleClass("activeMode");
    if( $(this).hasClass("activeMode") ){
      $( this ).text("Hide Master");
    }
    else{
      $( this ).text("Show Master");
    }

    $("#masterContainer").toggle();
  });

  $(".addGroupBtn").on("click", function(){
    let newGroup = new Group(undefined, AppManager.getCurrentProfile());
    console.log("Added new group! : "+newGroup.id);
    AppManager.getCurrentProfile().groups[newGroup.id] = newGroup;
  });

  let faderHidden = false;
  $("#showHideFader").on("click", function(){
    faderHidden = !faderHidden;
    if(faderHidden){
      $(".channelFader").hide();
      $(".is-fav").show();
      $(this).addClass("activeMode");
    }
    else{
      $(this).removeClass("activeMode");
      $(".channelFader").show();
    }
  });

  $("#transOptions").on("click", function(){
    if($(this).hasClass("activeMode")){
      $(this).find("i").text("keyboard_arrow_down");
      $("#transOptionContainer").addClass("is-hidden");
      $("#sceneContainer").addClass("is-enlarged");
      $(this).removeClass("activeMode");
    }
    else{
      $(this).find("i").text("keyboard_arrow_up");
      $(this).addClass("activeMode");
      $("#transOptionContainer").removeClass("is-hidden");
      $("#sceneContainer").removeClass("is-enlarged");
    }
  });

  $(".loginBtn").on("click", function(){
    AppManager.login($(".loginUsername").val(), $(".loginPassword").val());
  });

  $(".logoutBtn").on("click", function(){
    AppManager.logout();
  });

});


//On window resize the faders have to be recreated
$(window).resize(function() {
  resizeAllFader();
  colorAllFader(COLOR_INACTIVE, ".universeContainer, .groupContainer");
});

//Copied from MDN web docs : https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
//-->
window.addEventListener('beforeunload', function (e) {
  // Cancel the event
  e.preventDefault();
  // Chrome requires returnValue to be set
  e.returnValue = '';
});
//<--


function switchMode(modeIndex) {
  $(".modeBtn").removeClass("activeMode");
  switch (modeIndex) {
    case 0:
      $(".modeBtn1").addClass("activeMode");
      $("#faderControlContainer").show();
      $("#sceneControlContainer").hide();
      break;
    case 1:
      $(".modeBtn2").addClass("activeMode");
      $("#faderControlContainer").show();
      $("#sceneControlContainer").show();
      break;
    case 2:
      //$("#faderContainer").css("display","none");
      $(".modeBtn3").addClass("activeMode");
      $("#faderControlContainer").hide();
      $("#sceneControlContainer").show();

      break;
  }
}


function toggleMenu() {
  $("#burgerMenu").toggleClass("menuClicked");
}

function resizeChannelFader(){
  let faderLength = $(".universeContainer").find(".sliderContainer2").height();
  $(".universeContainer").find(".fader").width(faderLength - 10);
  console.log("Resizing channel fader");
}

function resizeAllFader(universeDomRef) {
  let tmpHeight = $(".universeContainer, .groupContainer").not(".is-hidden").find(".sliderContainer2, .masterSliderContainer").first()[0].clientHeight;
  $(".universeContainer, .groupContainer").find(".fader").width(tmpHeight-20);
  // $(universeDomRef).find($(".sliderContainer2, .masterSliderContainer")).each(function(){
  //   $(this).find(".fader").width(tmpHeight);
  // });
}

function colorAllFader(color, universeDomRef){
  console.log("Color All Fader!");
  let allContainer = $(".universeContainer, .groupContainer").not(".is-hidden");
  let tmpMaxHeight = 0;
  let count= 0;
  while(tmpMaxHeight == 0){
    if( count >= 512) break;
    tmpMaxHeight = allContainer.find(".sliderContainer2, .masterSliderContainer").eq(count).height();
    count++;
  }
  var faderToColor = $(universeDomRef).find(".sliderContainer2, .masterSliderContainer");

  let faderLength = tmpMaxHeight
  let faderRatio  = 1.0 - ((KNOB_RADIUS * 2.0) / parseInt(faderLength));

  let sliderGradient =
  "-webkit-gradient(linear, left top, right top," +
  "color-stop(0, rgba(255,255,255,255))," +
  "color-stop(" + ((1.0 - faderRatio) / 2.0) + ",rgba(255,255,255,255))," +
  "color-stop(" + ((1.0 - faderRatio) / 2.0) + ", " + color + ")," +
  "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", " + color + ")," +
  "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", rgba(255,255,255,255))," +
  "color-stop(1, rgba(255,255,255,255)))";

  $(faderToColor).each(function(){
    $(this).find(".fader")[0].style.setProperty("--slider-gradient", sliderGradient);
  });
}

function colorChannelFader(color){
  let faderLength = $(".universeContainer").find(".sliderContainer2").height();
  let faderRatio  = 1.0 - ((KNOB_RADIUS * 2.0) / parseInt(faderLength));

  let sliderGradient =
  "-webkit-gradient(linear, left top, right top," +
  "color-stop(0, rgba(255,255,255,255))," +
  "color-stop(" + ((1.0 - faderRatio) / 2.0) + ",rgba(255,255,255,255))," +
  "color-stop(" + ((1.0 - faderRatio) / 2.0) + ", " + color + ")," +
  "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", " + color + ")," +
  "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", rgba(255,255,255,255))," +
  "color-stop(1, rgba(255,255,255,255)))";

  var faderToColor = $(".universeContainer").find(".fader");
  for(var i =0; i< faderToColor.length; i++){
    faderToColor[i].style.setProperty("--slider-gradient", sliderGradient);
  }

}

function toggleSceneMod() {
  $("#modScene").toggleClass("activeMode");
  $(".scene").toggleClass("is-inModMode");
  $(".modifySceneBtn").toggle();
  sceneModActive = !sceneModActive;
}

function closeNav() {
  $("#mySidenav").removeClass("is-extended");
}

function openProfileModal(modalID, profileID){
  var modal = document.getElementById(modalID);
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  $(".cancelBtn, .closeModal").on("click", ()=>closeModal());

  switch (modalID) {
    case "loadProfileModal":
      $(".loadProfileConfirmBtn").on("click", ()=>{
        AppManager.loadProfile(profileID);
        closeModal();
      });

      break;
    case "overwriteProfileModal":
      $(".overwriteProfileConfirmBtn").on("click", ()=>{
        AppManager.updateProfile(profileID);
        closeModal();
      });
      break;
    case "deleteProfileModal":
      $(".deleteProfileConfirmBtn").on("click", ()=> {
        AppManager.deleteProfile(profileID);
        //Delete profile > fetch profileList > render profileList
        closeModal();
      });
      break;
    case "updateProfileModal":
      $(".overwriteProfileConfirmBtn").on("click", ()=>{
        AppManager.update(profileID);
        closeModal();
      });
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      closeModal();
    }
  };
}

document.addEventListener("keypress", function(e) {
  if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey) {
    toggleFullScreen();
  }
}, false);

function toggleFullScreen() {
  if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);

  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function openModal(modalID) {
  var modal = document.getElementById(modalID);
  modal.style.display = "block";

  $(".commitNewScene").on("click", () => {
    highestSceneID++;

    let tmpName = $(".sceneNameInput").val();
    let tmpColor= $(".sceneColorInput").val();
    let tmpUniversesToTrack = [];
    $(".universeSelectContainer").find(".activeMode").each(function(){
      tmpUniversesToTrack.push($(this).data("universeID"));
    });
    let faderValues = AppManager.getCurrentProfile().getFaderValues();
    let newScene = new Scene(highestSceneID, tmpName, tmpColor, faderValues, true, tmpUniversesToTrack);
    AppManager.getCurrentProfile().scenes[highestSceneID] = newScene;
    AppManager.getCurrentProfile().scene_changes.added.push(newScene.id);

    closeModal();
  });

  // When the user clicks on <span> (x), close the modal
  $(".cancelBtn, .closeModal").on("click", function() {
    closeModal();
  });

  if(modalID == "profileManagerModal"){
    $(".updateProfileBtn").on("click", ()=>{
      if( AppManager.getLoginStatus() ){
        openProfileModal("overwriteProfileModal",AppManager.getCurrentProfile().id);
      }
      else{
        openModal("loginModal");
      }
    });
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      closeModal();
    }
  };
}

function closeModal(listenerToRemove) {
  var modal = document.getElementsByClassName("modal");

  for (var i = 0; i < modal.length; i++) {
    modal[i].style.display = "none";
  }

  $(".commitNewScene, .closeModal, .cancelBtn, .updateProfileBtn").off();
  $(".loadProfileConfirmBtn, .deleteProfileConfirmBtn, .overwriteProfileConfirmBtn").off();
  $(".ovwrtConfirmBtn, .deleteSceneConfirmBtn, .editConfirmBtn").off();
  $(".addFaderModal").find("button").off();

}
