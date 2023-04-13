/*
Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
Martrikelnummer : 1111 0647
Stand : 13.03.2019
*/
const AppManager = (function(){
  var profileList;
  var currentProfile;
  var universes;
  var transitionTimeFader;
  var loginStatus = false;


  (async function init(){
    let profileListResp, profileListJson, universeList, firstProfileResp, firstProfileJson;
    transitionTimeFader = new TransitionTimeFader( $("#transOptionContainer") );

    try{
      profileListResp  = await fetchProfileList();
      profileListJson = await profileListResp.json();
      profileList = await profileListJson;
      universeList    = await fetchUniverseList();
      universes       = await universeList.json();
      if( profileListJson ){
        if( profileListJson.length != 0){
          firstProfileResp= await fetchOneProfile(profileListJson[0].profile_id);
          firstProfileJson= await firstProfileResp.json();
          currentProfile  = new Profile(universes, firstProfileJson);
          addProfilesToProfileManager(profileListJson[0].profile_id);
        }
        else{
          currentProfile = new Profile(universes);
        }
      }
      else{
        currentProfile = new Profile(universes);
      }
    }
    catch(error){
      console.error("An error occured during initialisation of the app! : "+error);
      currentProfile = new Profile();
      new Message("error", "Error during app initialisation");
    }

    let currDmxStatus = await fetchDmxStatus();
    currentProfile.setFaderValues(currDmxStatus);


    addUniverseTagListeners();
    colorAllFader(COLOR_INACTIVE);
    resizeAllFader();

    $(".loadingContainer").addClass("is-loaded");
    $(".headerContainer").addClass("is-loaded");

    new Message("success", "Finished Loading Profile!");

  })();

  async function loadProfile( profileID ){
    $(".loadingContainer").removeClass("is-loaded");
    $(".headerContainer").removeClass("is-loaded");
    try{
      let newProfileResp = await fetchOneProfile( profileID );
      if( newProfileResp.status != 200){
        console.error("Something went wron trying to load a profile :( : "+newProfileResp.status);
      }
      let newProfileJson = await newProfileResp.json();
      addProfilesToProfileManager(newProfileJson.id);
      currentProfile = new Profile( universes, newProfileJson );
      new Message("success", "Loaded profile : " +currentProfile.name);
    }
    catch(error){
      console.error("Something went wron trying to load a profile :( : "+error);
      new Message("error", "An error occured trying to load a profile");
    }
    $(".loadingContainer").addClass("is-loaded");
    $(".headerContainer").addClass("is-loaded");
  }

  function getCurrentProfile(){
    return currentProfile;
  }

  async function fetchDmxStatus(){
    let url = window.location.origin;
    let response = await fetch(url+"/dmxstatus");
    let responseJSON = await response.json();

    let output = [];
    let index = 0;

    if( responseJSON ){
      for(let uni in responseJSON ){
        if( uni == "master"){
          // currentProfile.setMasterValue( responseJSON.master );
        }
        else{
          if( responseJSON[uni].dmx.length < 512 ){
            output[index] = new Array(512).fill(0);
          }
          else{
            output[index] = responseJSON[uni].dmx;
          }
        }
        index++;
      }
    }
    return output;
  }

  async function rerequestDmxStatus(){
    let currDmxStatus = await fetchDmxStatus();
    new Message("info", "Requested current DMX Status");
    currentProfile.setFaderValues( currDmxStatus );
  }

  function fetchProfileList(){
    let url = window.location.origin;
    return fetch(url+"/profiles");
  }

  function fetchUniverseList(){
    let url = window.location.origin;
    return fetch(url+"/universes");
  }

  function fetchOneProfile(profileID){
    let url = window.location.origin;
    return fetch(url+"/profiles/"+profileID);
  }

  function addProfilesToProfileManager(currentProfileIndex){


    //Get the profile template from the DOM and remove "hidden" tag
    let profileTemplate = $(".profileTemplate").clone();
    profileTemplate.removeClass("profileTemplate");

    //Empty the container
    $(".allProfilesContainer").empty();

    //Start at position 1, so the first profile isnt listed in the "Profiles"
    for(let i=0; i<profileList.length; i++){
      if(profileList[i].profile_id == currentProfileIndex){
        $(".currentProfileName").text(profileList[i].profile_name);
      }
      else{
        let tmpProfile = profileTemplate.clone();
        tmpProfile.removeAttr("hidden");
        tmpProfile.addClass("profileManagerItem");
        tmpProfile.find(".profileName").text(profileList[i].profile_name);
        tmpProfile.data("profile_id",profileList[i].profile_id);

        tmpProfile.find(".profileLoadBtn").on("click" , ()=>{
          openProfileModal("loadProfileModal", profileList[i].profile_id);
          console.log("Load profile" + profileList[i].profile_id);
        });

        tmpProfile.find(".profileOvwrtBtn").on("click", ()=>{
          openProfileModal("overwriteProfileModal", profileList[i].profile_id);
          console.log("Overwrite profile"+profileList[i].profile_id);

        });

        tmpProfile.find(".deleteProfile").on("click", ()=>{
          if( loginStatus ){
            openProfileModal("deleteProfileModal", profileList[i].profile_id);
          }
          else{
            openModal("loginModal");
          }
          console.log("Delete Profile" + profileList[i].profile_id);
        });

        $(".allProfilesContainer").append(tmpProfile);
      }
    }
  }

  var alreadyResized = [];

  function addUniverseTagListeners(){

    //Add metadata on the unviverse tags
    for(let i=0; i< universes.length; i++){
      $(".universeTag-"+universes[i].id).data("universeID",i);
    }

    $(".universeTag-"+universes[0].id).addClass("is-activeUniverseTag");
    alreadyResized.push(0);

    $(".universeTag").on("click", function(){
      let thisUniID = $(this).data("universeID");
      currentUniverseID = thisUniID;
      // $(".universeContainer").hide();
      $(".groupContainer, .universeContainer").addClass("is-hidden");

      if(  typeof thisUniID !== "undefined"  ){
        // $(".universeContainer-"+thisUniID).show();
        $(".universeContainer-"+thisUniID).removeClass("is-hidden");
      }
      else{
        $(".groupContainer").removeClass("is-hidden");
        thisUniID = "group";
      }

      //Find something to remember if they have been resized/ colored before!
      if(alreadyResized.indexOf(thisUniID) == -1){
        if(thisUniID == "group"){
          colorAllFader(COLOR_INACTIVE, ".groupContainer");
        }
        else{
          colorAllFader(COLOR_INACTIVE, ".universeContainer-"+thisUniID);
        }
        alreadyResized.push(thisUniID);
      }

    });
  }


  async function postProfile(profileName){
    $(".loadingContainer").removeClass("is-loaded");
    $(".headerContainer").removeClass("is-loaded");

    let tmpProfile = currentProfile.deepClone();

    delete tmpProfile.id;
    delete tmpProfile.scene_changes;
    delete tmpProfile.masterFader.profileRef;

    tmpProfile.name = profileName;
    tmpProfile.removeSceneIDs();

    try{
      var response = await fetch(window.location.origin+"/profiles",{
        method:"POST",
        body:JSON.stringify(tmpProfile),
        headers:{"Content-Type":"application/json"}
      });
      if( response.status != 200){
        console.error("An error occured trying to post a profile! HTTP Status : " + response.status);
        new Message("error","Posting profile failed!");
      }
      else{
        let profileIDJson = await response.json();
        let profileID = await profileIDJson.profileID;
        console.log("Posted a profile");
        new Message("success", "Posted profile : " + tmpProfile.name);
        let profileResp = await fetchProfileList();
        if(profileResp.status != 200){
          console.error("An error occured trying to fetch the profile list");
        }
        profileList = await profileResp.json();
        addProfilesToProfileManager(profileID);

      }
    }
    catch (error){
      console.error("Something went wrong posting a profile : "+error);
      new Message("error","Posting profile failed!");
    }

    $(".loadingContainer").addClass("is-loaded");
    $(".headerContainer").addClass("is-loaded");
   }

  async function putProfile(profileID){
    $(".loadingContainer").removeClass("is-loaded");
    $(".headerContainer").removeClass("is-loaded");
    let tmpProfile = currentProfile.deepClone();
    delete tmpProfile.masterFader.profileRef;
    try{
      let response = await fetch(window.location.origin+"/profiles/"+profileID,{
        method:"PUT",
        body:JSON.stringify(tmpProfile),
        headers:{"Content-Type":"application/json"}
      });

      if(response.status != 200){
        console.error("An error occured trying to PUT a profile ! Http Status : "+ response.status);
        new Message("error","Updating profile failed!");
      }
      else{
        console.log("Success: Put a profile");
        new Message("success","Updated profile : " + tmpProfile.name);
      }

    }
    catch(error){
      console.error("Error trying to put profile! : " + error);
      new Message("error","Updating profile failed!");
    }
    $(".loadingContainer").addClass("is-loaded");
    $(".headerContainer").addClass("is-loaded");
  }

  async function deleteProfile(profileID){
    $(".loadingContainer").removeClass("is-loaded");
    $(".headerContainer").removeClass("is-loaded");
    await fetch(window.location.origin + '/profiles/'+profileID, {method: 'delete'});
    let tmpProfileList  = await fetchProfileList();
    profileList         = await tmpProfileList.json();

    new Message("info","Deleted profile");

    addProfilesToProfileManager(profileList, currentProfile.id);

    $(".loadingContainer").addClass("is-loaded");
    $(".headerContainer").addClass("is-loaded");
  }

  function createBlankProfile(){
    currentProfile = new Profile();
  }

  function getUniverses(){
    return universes;
  }

  function getUniverseIndex( universeID ){
    for(let i=0; i<universes.length; i++){
      if( universes[i].id == universeID ){
        return i;
      }
    }
    return -1;
  }

  function getProfileList(){
    return profileList;
  }

  function getTransitionTimeFader(){
    return transitionTimeFader;
  }

  function resetAlreadyResized(){
    alreadyResized = [];
  }

  function getLoginStatus(){
    return loginStatus;
  }

  function login(username, password){
    fetch(window.location.origin+"/login", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({username:username, password:password})
    })
    .then((response) => {
      if ( response.ok ) {

        var modal = document.getElementsByClassName("loginModal");
        modal[0].style.display = "none";
        loginStatus = true;
        $(".loginStatus").hide();
        new Message("success","Your are now logged in!");

      } else {
        $(".loginStatus").show();
        new Message("error","Error trying to log in");
        throw new Error("Something went wrong");
      }
    })
    .catch((error) => {
      new Message("error","Error trying to log in!");
      console.log(error)
    });
  }

  function logout(){
    fetch(window.location.origin+"/logout", {
      method:"GET",
    }).then((response) => {
      $("#mySidenav").removeClass("is-extended");
      if (response.ok){
        loginStatus = false;
        new Message("info","Your are now logged out!");
      }
      else{
        new Message("error","Logout failed! You are still logged in!");
      }
    });
  }


  return {
    //init: init,
    getCurrentProfile: getCurrentProfile,
    loadProfile: loadProfile,
    createBlankProfile: createBlankProfile,
    addCurrentProfile: postProfile,
    updateProfile: putProfile,
    deleteProfile: deleteProfile,
    universes: getUniverses,
    getUniverseIndex: getUniverseIndex,
    getProfileList: getProfileList,
    resetAlreadyResized: resetAlreadyResized,
    getTransitionTimeFader: getTransitionTimeFader,
    rerequestDmxStatus: rerequestDmxStatus,
    getLoginStatus: getLoginStatus,
    login : login,
    logout: logout
  };
}());
