/*
Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
Martrikelnummer : 1111 0647
Stand : 13.03.2019
*/


var highestGroupID = 1;

class Group{
  constructor( dbData, profileRef ){

    this.profileRef = profileRef;
    this.faders = [];
    this.maxFaderValues = [];

    // If database data is passed to the constructor -> parse them to this object
    if( dbData ){
      this.parseDBData( dbData );
    }
    else{
      // If not, assign default values
      highestGroupID++;
      this.id = highestGroupID;

      this.groupFaderValue = 255;
      this.isExtended = true;
      this.faders = [];
      this.renderGroup();
    }
    // And add listener to the dom elements
    this.addListeners();
  }

  renderGroup(){
    let tmpContainer = $(".groupContainerTemplate").clone();

    $(".group-"+this.id).remove();

    tmpContainer.removeClass("groupContainerTemplate");
    tmpContainer.addClass("group-"+this.id);
    tmpContainer.find(".groupName").val(this.name);

    // Change appearance of the group if it is extended
    if( !this.isExtended ){
      tmpContainer.find(".groupFader").removeClass("is-extended");
      tmpContainer.find(".toggleGroupBtn").find("i").text("chevron_right");
      tmpContainer.find(".toggleGroupBtn").removeClass("activeMode");
    }
    else{
      tmpContainer.find(".groupFader").addClass("is-extended");
      tmpContainer.find(".toggleGroupBtn").find("i").text("chevron_left");
      tmpContainer.find(".toggleGroupBtn").addClass("activeMode");
    }

    tmpContainer.find(".masterValueTag").val(parseInt((this.groupFaderValue/255) * 100));
    tmpContainer.find(".master-fader").val(this.groupFaderValue);
    this.domRef = tmpContainer;

    $(".groupContainer").append(tmpContainer);

    // This variable is a helper for passing the "this" variable through
    // some functions
    let tmpRef = this;

    // This function manages the mapping of the fader which are part of this group
    function mapFaderValues(newValue){
      let socketMsg = {};
      socketMsg.data = {};

      // this.groupFader.value
      let faderFactor = newValue / 255 ;
      let tmpMaxFaderValue;

      // For all fader in the group
      for(let i=0; i<tmpRef.faders.length; i++){

        let tmpUniID = tmpRef.faders[i].universeIndex;
        let tmpChID  = tmpRef.faders[i].channelID;

        // Compute the highest possible fader value (when group fader is on 100%)
        tmpMaxFaderValue = tmpRef.maxFaderValues[tmpUniID][tmpChID];
        let newFaderValue =  tmpMaxFaderValue * faderFactor ;

        if( newFaderValue  > 255) newFaderValue = 255;

        tmpRef.profileRef.fader[ tmpUniID ][ tmpChID ].setValue(parseInt(newFaderValue));
        // BOESE! VVVV
        // tmpRef.profileRef.fader[ tmpUniID ][ tmpChID ].sendValue();

        //Check if this universe contains data already
        if ( !socketMsg.data[ tmpUniID ] ) socketMsg.data[ tmpUniID ] = {};

        //Sending the new Values to the bakend
        socketMsg.data[ tmpUniID ][ tmpChID ] = parseInt(newFaderValue);
      }

      // Send the changed values to the server
      socket.emit("some_fader_change", socketMsg);
    }

    // Add the GroupFader to the group
    this.groupFader = new GroupFader(this.name, this.groupFaderValue, this.domRef.find(".groupMasterFader"), true, undefined, mapFaderValues);
    this.groupFader.resizeTrack();

  }

  // Add the listener to the group
  addListeners(){
    let tmpRef = this;

    this.domRef.find(".deleteThisGroupBtn").on("click", () =>{
      this.domRef.remove();
      delete AppManager.getCurrentProfile().groups[this.id];
    });

    this.domRef.find(".groupName").on("input", function(){
      tmpRef.name = $(this).val();
    });

    // add Fader to the group
    this.domRef.find(".addFaderToGroupBtn").on("click", () =>{

      let tmpProfile = AppManager.getCurrentProfile();
      let tmpUniverses=AppManager.universes();
      if( tmpProfile ){

        // Create the modal containing the button for adding the fader
        let currentGroupFader = {};
        for(let i=0; i<this.faders.length; i++){
          if( !currentGroupFader[this.faders[i].universeIndex] ){
            currentGroupFader[this.faders[i].universeIndex] = [];
          }
          currentGroupFader[this.faders[i].universeIndex].push(this.faders[i].channelID);
        }

        $(".faderSelection-universeTags").empty();
        $(".faderSelection-allUniverses").empty();

        let tmpContainer = $("<div></div>");

        tmpContainer.addClass("faderSelectionContainer");

        for( let i=0; i<tmpProfile.fader.length; i++){
          let tmpSpecificContainer = tmpContainer.clone().addClass("faderSelectionContainer-"+i).hide();
          let tmpUniverseSelectBtn = $("<button></button>").addClass("faderSelection-universeTagBtn-"+i);
          tmpUniverseSelectBtn.addClass("faderSelection-universeTagBtn");
          tmpUniverseSelectBtn.data("universe", i);
          tmpUniverseSelectBtn.text("U - "+tmpUniverses[i].id);

          if(i==0){
            tmpUniverseSelectBtn.addClass("activeMode");
            tmpSpecificContainer.show();
          }

          tmpUniverseSelectBtn.on("click", function(){
            $(".faderSelectionContainer").hide();
            tmpSpecificContainer.show();
            $(".faderSelection-universeTagBtn").removeClass("activeMode");
            $(this).addClass("activeMode");
          });

          $(".faderSelection-universeTags").append(tmpUniverseSelectBtn);

          for( let j=0; j<tmpProfile.fader[i].length; j++){
            if( currentGroupFader[i] ){

              if ( currentGroupFader[i].indexOf(j) == -1){
                //The fader is already in the group => dont addto the dom
                let tmpFaderSelectionBtn = $(".faderSelectionBtnTemplate").clone();
                tmpFaderSelectionBtn.removeClass("faderSelectionBtnTemplate");
                tmpFaderSelectionBtn.data("channelID", j);
                tmpFaderSelectionBtn.data("universe", i);
                if( tmpProfile.fader[i][j].name ){
                  tmpFaderSelectionBtn.text(j+" "+tmpProfile.fader[i][j].name);
                  tmpFaderSelectionBtn.css("grid-column", "span 2");
                }
                else{
                  tmpFaderSelectionBtn.text(j);
                }
                tmpFaderSelectionBtn.appendTo(tmpSpecificContainer);
              }
            }
            else{
              let tmpFaderSelectionBtn = $(".faderSelectionBtnTemplate").clone();
              tmpFaderSelectionBtn.removeClass("faderSelectionBtnTemplate");
              tmpFaderSelectionBtn.data("channelID", j);
              tmpFaderSelectionBtn.data("universe", i);
              if( tmpProfile.fader[i][j].name ){
                tmpFaderSelectionBtn.text(j+" "+tmpProfile.fader[i][j].name);
                tmpFaderSelectionBtn.css("grid-column", "span 2");
              }
              else{
                tmpFaderSelectionBtn.text(j);
              }
              tmpFaderSelectionBtn.appendTo(tmpSpecificContainer);
            }
          }

          tmpSpecificContainer.appendTo(".faderSelection-allUniverses");
        }

      }

      openModal("addFaderModal");

      $(".faderSelectionBtn").on("click", function(){
        if( $(this).hasClass("activeMode") ){
          $(this).removeClass("activeMode");
        }
        else{
          $(this).addClass("activeMode");
        }
      });

      $(".addFaderConfirmBtn").on("click", function(){
        $(".faderSelectionBtn.activeMode").each(function(){
          tmpRef.addFader($(this).data("universe"), $(this).data("channelID"));
        });
        closeModal();
        $(".faderSelectionBtn").removeClass(".activeMode").off();
        $(this).off();
      });

      $(".cancelBtn, .closeModal").on("click", ()=>{
        closeModal();
        $(".faderSelectionBtn").removeClass(".activeMode").off();
        // $(".addFaderConfirmBtn").off();
        // $(this).off();
      });
    });

    // show  or hide  the group fader
    this.domRef.find(".toggleGroupBtn").on("click",()=>{
      this.isExtended = !this.isExtended;

      if(  this.isExtended  ){
        this.domRef.find(".groupFader").addClass("is-extended");
        this.domRef.find(".toggleGroupBtn").find("i").text("chevron_left");
        this.domRef.find(".toggleGroupBtn").addClass("activeMode");
      }
      else{
        this.domRef.find(".groupFader").removeClass("is-extended");
        this.domRef.find(".toggleGroupBtn").find("i").text("chevron_right");
        this.domRef.find(".toggleGroupBtn").removeClass("activeMode");
      }
    });

  }

  // Parse the database data to the object
  parseDBData( dbData ){
    this.id = dbData.id;
    if(this.id > highestGroupID){
      highestGroupID = this.id;
    }
    this.name = dbData.name;
    this.groupFaderValue = dbData.groupFaderValue;
    this.isExtended = dbData.isExtended;
    this.renderGroup();
    if(dbData.faders){
      for(var i=0; i<dbData.faders.length; i++){
        this.addFader(dbData.faders[i].universeIndex, dbData.faders[i].channelID);
      }
    }
  }

  // Add a fader to the group
  addFader(universeIndex, channelID){
    let tmpRef = this;
    //Referencing fader
    this.faders.push({universeIndex : universeIndex, channelID: channelID});

    let tmpDomFader = $(".universeContainer").find(".channelFader-"+universeIndex+"-"+channelID ).clone();
    tmpDomFader.data("groupIndex", this.faders.length-1);

    tmpDomFader.find(".dimmerGroupToggle").remove();


    //add remove fader from group button
    let tmpRemoveBtn = $(".removeDimmerFromGroupTemplate").clone();
    tmpRemoveBtn.removeClass("removeDimmerFromGroupTemplate");
    tmpDomFader.find(".removeDimmerFromGroup").remove();

    if( !this.maxFaderValues[universeIndex] ){
      this.maxFaderValues[universeIndex] = {};
    }
    this.maxFaderValues[universeIndex][channelID] = tmpDomFader.find(".fader").val();


    tmpRemoveBtn.on("click", () => {
      this.removeFader(universeIndex, channelID);
    });

    tmpDomFader.find(".fader").on("input", function(){tmpRef.changeMaxFaderValues( $(this).val() , universeIndex, channelID) ;});
    tmpDomFader.find(".faderValueTag").on("input", function(){
      tmpRef.changeMaxFaderValues(  parseInt( ($(this).val()/100) * 254 ) , universeIndex, channelID );
    });
    tmpDomFader.find(".maxButton").on("click", function(){tmpRef.changeMaxFaderValues(255, universeIndex, channelID);});
    tmpDomFader.find(".minButton").on("click", function(){tmpRef.changeMaxFaderValues(0, universeIndex, channelID);});

    tmpDomFader.find(".dimmerOptions").append(tmpRemoveBtn);
    tmpDomFader.appendTo( this.domRef.find(".groupFader") );
    // this.domRef.find(".groupFader").append(tmpDomFader);

    if( this.profileRef ){
      this.profileRef.fader[universeIndex][channelID].setDomRef( $(".channelFader-"+universeIndex+"-"+channelID ));
      this.profileRef.fader[universeIndex][channelID].colorTrack(this.profileRef.fader[universeIndex][channelID].colorInactive);
    }
    else{
      //!!!!!!!!!!!!! CHANGE THIS !!!!!!!!!!!!!!!
      //SOUrCE FOR AN ERROR, BECAUSE IT RELIES ON THE APP MANAGER!!!!!!!!
      AppManager.getCurrentProfile().fader[universeIndex][channelID].setDomRef( $(".channelFader-"+universeIndex+"-"+channelID ) );
    }
  }


  updateAllMaxFaderValues(){
    // this.groupFader.setValue(255);
    for(let i=0; i<this.maxFaderValues.length; i++){
      for(let chID in this.maxFaderValues[i]){
        this.changeMaxFaderValues( $(".channelFader-"+i+"-"+chID).find(".fader").val(), i, chID  );
      }
    }
  }

  changeMaxFaderValues( newValue, universeIndex, channelID ){
    if( !this.maxFaderValues[universeIndex] ){
      this.maxFaderValues[universeIndex] = {};
    }
    let newMaxValue =  parseInt( newValue / (this.groupFader.value/255));
    this.maxFaderValues[universeIndex][channelID] = newMaxValue;
  }

  // Remove a fader from the group
  removeFader(universeID, channelID){
    let tmpRef = this.domRef.find(".channelFader-"+universeID+"-"+channelID);
    let groupIndex = tmpRef.data("groupIndex");
    tmpRef.remove();
    //Remove the reference out of the group array
    this.faders.splice(groupIndex,1);
  }

  updateFaderVal(){
    for(let uni in this.faders){
      for(let fader in this.faders[uni]){
        let tmpValue = this.faders[uni][fader].updateValue();
        this.faders[uni][fader].domRef.find(".channel-fader").val(tmpValue);
        this.faders[uni][fader].domRef.find(".faderValueTag").val(parseInt((tmpValue)/255 * 100));
      }
    }
  }

  // Deep clone the object to parse it into JSON
  deepClone(){
    var output = {};
    output.name = this.name;
    output.id   = this.id;
    output.isExtended = this.isExtended;
    output.groupFaderValue = this.groupFaderValue;

    output.faders = [];

    for (let i=0; i<this.faders.length; i++){
      output.faders.push({universeIndex:this.faders[i].universeIndex, channelID: this.faders[i].channelID});
    }
    return output;

  }

}
