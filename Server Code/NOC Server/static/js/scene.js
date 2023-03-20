/*
Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
Martrikelnummer : 1111 0647
Stand : 13.03.2019
*/


// This class represents a single class.
class Scene{
  constructor(sceneID, sceneName, sceneColor, faderValues, instantRender, universesToTrack){
    this.id = sceneID;
    this.name = sceneName;
    this.color = sceneColor;
    this.faderValues = faderValues;
    //List the univerves this scene should keep track of
    this.universesToTrack = universesToTrack;
    if( universesToTrack ){
      this.faderValues = AppManager.getCurrentProfile().getUniverseFader( universesToTrack );
    }
    else{
      this.universesToTrack = [];
      for(let key in this.faderValues){
        this.universesToTrack.push(key);
      }
    }
    if(instantRender){
      this.renderScene();
    }
    new Message("success", "Added new Scene!");
  }

  // This method adds the dom elements and its listener to the document
  renderScene(){
    let sceneRef = $(".sceneTemplate").clone();

    if( !sceneRef ) console.error("Scene template not found!");

    sceneRef.removeClass("sceneTemplate");
    sceneRef.removeAttr("hidden");
    sceneRef.find(".modifySceneBtn").hide();
    sceneRef.addClass("scene-"+this.id);

    sceneRef.css("background-color", this.color);
    sceneRef.find(".sceneName").text( this.name );
    sceneRef.data("sceneID", this.id);

    let tmpText = "";

    for( let i=0; i<this.universesToTrack.length; i++ ){
      tmpText += "U-"+ AppManager.universes()[this.universesToTrack[i]].id + " ";
    }
    sceneRef.find(".sceneUniverses").text(tmpText);

    sceneRef.appendTo("#sceneContainer");

    this.domRef = sceneRef;
    this.addListeners();

    return sceneRef;
  }

  // Add the listeners to this scene.
  addListeners(){

    let tmpRef = this;
    let stopTransition = false;
    let transitionInProgress = false;

    $(".scene").on("click", ()=>{
      if(transitionInProgress){
        stopTransition = true;
      }
    });

    // The scene has been clicked
    this.domRef.on("click", ()=>{
      // check if a current transistion is in progress, if so -> stop it
      if(transitionInProgress){
        stopTransition = true;
      }
      else{
        stopTransition = false;
      }

      let tmpCounter = 0;

      // Compute the steps that are added each frame to the fader
      function computeSteps(profileRef, goalValues, transitionTime){
        let steps = {};
        if( !profileRef ) return;

        let homeValues = profileRef.fader;

        for(let universeKey in goalValues){
          let i = parseInt(universeKey);
          steps[i] = {};
          for(let j=0; j<homeValues[i].length; j++){
            let goalHomeDiff = goalValues[i][j] - homeValues[i][j].value;
            if ( goalHomeDiff ){
                steps[i][j] = goalHomeDiff / (transitionTime * 30);
            }
          }
        }
        return steps;
      }

      var n;

      // This recursive function adds the steps each frame to the fader and
      // sends them to the server
      function transitionFrame( transitionTime, currentIntValues, currentValues, steps ){
        let tmpValues = currentValues;
        let intOutput = currentIntValues;

        // The termination condition
        if(tmpCounter >= (30 * transitionTime) || stopTransition ){
          var tmp = new Date().getTime() - n;
          console.log("TIME!" + tmp);
          // AppManager.getCurrentProfile().setFaderValues(tmpRef.faderValues);
          AppManager.getCurrentProfile().setUniverseFader( tmpRef.faderValues );
          transitionInProgress = false;
          stopTransition = false;

          //Send the final values to the server
          socket.emit("all_fader_values", {
            "data": tmpRef.faderValues
          });
          tmpRef.domRef.find(".sceneName").removeClass("blink");
          tmpRef.domRef.removeClass("transitionInProgress");
          return;
        }

        // Compute the new fader values with the help of the steps
        for(let i in steps){

          for(let chID in steps[i]){
            tmpValues[i][chID] = parseFloat(currentValues[i][chID] + steps[i][chID]);
            intOutput[i][chID] = parseInt(tmpValues[i][chID]);
          }
        }

        // Send the new values to the server
        socket.emit("all_fader_values", {
          "data": intOutput
        });

        tmpCounter++;
        console.log("TEST");
        // recursive call
        setTimeout(()=>{transitionFrame(transitionTime, intOutput, tmpValues, steps); }, 30);

      }

      // Check if the modification mode of the scenes is active. If not, change
      // the fader values
      if( !sceneModActive ){

        // If the transition time is not null, the transistion function has to be called
        let tmpTransitionTimeFader = AppManager.getTransitionTimeFader();

        if ( tmpTransitionTimeFader.getTime() != 0 && !transitionInProgress ){
          this.domRef.find(".sceneName").addClass("blink");
          this.domRef.addClass("transitionInProgress");
          // Get the home and goal values and compute the steps with them
          let profileRef = AppManager.getCurrentProfile();
          let goalValues = this.faderValues;
          let homeIntValues  = profileRef.getUniverseFader( this.universesToTrack );
          let homeFloatValues= profileRef.getUniverseFader( this.universesToTrack );
          console.time("computeSteps");
          let steps = computeSteps(profileRef, goalValues,  tmpTransitionTimeFader.value/2);
          console.timeEnd("computeSteps");

          var d = new Date();
          n = d.getTime();
          transitionInProgress = true;
          stopTransition = false;
          transitionFrame( tmpTransitionTimeFader.value/2, homeIntValues , homeFloatValues, steps );
        }
        else{
          this.sendAllValues();
          // AppManager.getCurrentProfile().setFaderValues(this.faderValues);
          AppManager.getCurrentProfile().setUniverseFader(this.faderValues);

          // for(let groupID in AppManager.getCurrentProfile().groups){
          //   AppManager.getCurrentProfile().groups[groupID].updateAllMaxFaderValues();
          // }
        }


      }
    });

    // Adds the listener to the different modification button of a scene
    this.domRef.find(".editSceneBtn").on("click", ()=>{
      this.openSceneModal("editSceneModal");
    });

    this.domRef.find(".ovwrtSceneBtn").on("click", ()=>{
      this.openSceneModal("ovwrtSceneModal");
    });

    this.domRef.find(".deleteSceneBtn").on("click", ()=>{
      this.openSceneModal("deleteSceneModal");
    });
  }

  openSceneModal(modalID) {
    var modal = document.getElementById(modalID);
    modal.style.display = "block";

    $(".editSceneNameInput").val(this.name);
    $(".editSceneColorInput").val(this.color);

    // When the user clicks on <span> (x), close the modal
    $(".cancelBtn, .closeModal").on("click", ()=>closeModal());

    $(".editConfirmBtn").on("click",()=>{
      this.editScene(  $(".editSceneNameInput").val(),  $(".editSceneColorInput").val()  );
      closeModal();
      new Message("info", "Edited Scene : "+ this.name);
    });

    $(".ovwrtConfirmBtn").on("click",()=>{
      this.overwriteScene();
      closeModal();
      new Message("info", "Overwrote Scene : "+ this.name);
    });

    $(".deleteSceneConfirmBtn").on("click", ()=>{
      this.deleteScene();
      closeModal();
      new Message("error", "Removed Scene : "+ this.name);
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        closeModal();
      }
    };
  }

  sendAllValues(){
    socket.emit("all_fader_values", {
      "data": this.faderValues
    });
  }

  // Edits the scenes name or color
  editScene(newName, newColor){
    this.name = newName;
    this.color = newColor;

    this.domRef.find(".sceneName").text(this.name);
    this.domRef.css("background-color", this.color);

    let modifiedSceneIndex = AppManager.getCurrentProfile().scene_changes.modified.indexOf(this.id);
    let addSceneIndex = AppManager.getCurrentProfile().scene_changes.added.indexOf(this.id);

    //Check if both the modified and the added array dont have the scene id in them
    if(addSceneIndex == -1){
      if(modifiedSceneIndex == -1){
        AppManager.getCurrentProfile().scene_changes.modified.push(this.id);
      }
    }

  }

  // Overwrites the fader values of the current Scene
  overwriteScene(){
    this.faderValues = AppManager.getCurrentProfile().getUniverseFader( this.universesToTrack );

    let modifiedSceneIndex = AppManager.getCurrentProfile().scene_changes.modified.indexOf(this.id);
    let addSceneIndex = AppManager.getCurrentProfile().scene_changes.added.indexOf(this.id);

    //Check if both the modified and the added array dont have the scene id in them
    if(addSceneIndex == -1){
      if(modifiedSceneIndex == -1){
        AppManager.getCurrentProfile().scene_changes.modified.push(this.id);
      }
    }

  }

  deleteScene(){
    this.domRef.remove();

    let sceneChangesTmp = AppManager.getCurrentProfile().scene_changes;

    //Check if the removed scene has been added in the current session
    let addSceneIndex = sceneChangesTmp.added.indexOf(this.id);

    //If so, remove it out of the "added" array
    if (addSceneIndex != -1) {
      sceneChangesTmp.added.pop(addSceneIndex);
    }
    //If not, the scene existed before this session
    else {
      //Check if the scene has been modified before
      let modSceneIndex = sceneChangesTmp.modified.indexOf(this.id);
      if (modSceneIndex != -1) {
        //If so, remove it out of the modified array
        sceneChangesTmp.modified.pop(addSceneIndex);
      }

      //Add the scene Index to the "removed" array
      sceneChangesTmp.removed.push(this.id);
    }

    //Remove the scene data from the current profile :
    //OLD
    // currentProfile.scenes.splice(getIDByScene(scene),1) ;

    delete AppManager.getCurrentProfile().scenes[this.id];
    //Nothing should have a reference to this object now --> Garbage collector should collect it

  }

  // Deep clone this scene -> For the conversion to JSON
  deepClone(){
    var output = new Scene(this.id, this.name, this.color, this.faderValues, false, this.universesToTrack);
    for( let i in this.faderValues ){
      for( let j=0; j<this.faderValues[i].length; j++ ){
        output.faderValues[i][j] = this.faderValues[i][j];
      }
    }
    delete output.domRef;
    return output;
  }
}
