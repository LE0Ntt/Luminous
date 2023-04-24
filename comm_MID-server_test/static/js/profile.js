/*
Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
Martrikelnummer : 1111 0647
Stand : 13.03.2019
*/

/*
GPT:
The class has various methods to create and modify the profile, including parsing data from a database, setting and getting fader values, and manipulating scenes and groups.
*/

class Profile{
  constructor (universes, dbData){
    this.masterFader = new MasterFader($("#masterContainer"),this);
    if(  dbData  ){
      this.parseDBData( universes, dbData );
    }
    else{
      this.createDefaults( universes );
    }

    this.scene_changes =  {
      added:[],
      modified:[],
      removed:[]
    };
    //this.resizeAndColorAllFader();
  }

  parseDBData(universes, dbData){
    this.id = dbData.id;
    this.name= dbData.name;
    this.fader = [];

    let dbDataFader = dbData.fader;
    let dbDataScenes= dbData.scenes;
    let dbDataGroups= dbData.groups;

    $(".universeTag").removeClass("is-activeUniverseTag");

    //Create fader
    for(let i=0; i<universes.length; i++){
      if(  !dbDataFader[i]  ){
        break;
      }
      //Add universe selection button to addFaderDom


      this.fader[i] = [];
      for(let j=0; j<dbDataFader[i].length; j++){
        let tmpFader = dbDataFader[i][j];
        //Add button to addFaderModal

        this.fader[i][j] = new ChannelFader(
          tmpFader.name,
          tmpFader.value,
          $(".channelFader-"+i+"-"+j),
          true,
          i,
          j,
          tmpFader.isFav,
          tmpFader.groups
        );
      }
    }



    //Create Scenes
    $("#sceneContainer").empty();
    this.scenes = {};
    if( dbDataScenes ){
      for(let i=0; i<dbDataScenes.length; i++){
        let tmpScene = dbDataScenes[i];
        this.scenes[i] = new Scene(
          tmpScene.id,
          tmpScene.name,
          tmpScene.color,
          tmpScene.faderValues,
          true
        );
      }
    }

    //Check if there are any groups in the dbData
    $(".groupContainer").find(".singleGroupContainer").remove();
    this.groups = {};
    if(  dbDataGroups ) {
      for( var i in dbDataGroups){
        this.groups[i] = new Group( dbDataGroups[i], this);
      }
    }

    //If so, create the groups

  }

  createDefaults( universes ){
    let tmpUniverses = universes;
    if ( !universes ){
      tmpUniverses = [[]];
    }
    this.id = -1;
    this.name = "New Profile";
    this.groups = {};
    this.scenes = {};
    this.fader = [];


    for(let i=0; i<tmpUniverses.length; i++){
      this.fader[i] = [];
      for(let j=0; j<FADER_AMOUNT; j++){
        let tmpFader = new ChannelFader(
          undefined,
          0,
          $(".channelFader-"+i+"-"+j),
          true,
          i,
          j,
          false,
          {}
        );
        this.fader[i].push(tmpFader);
      }
    }

  }

  setFaderValues(newFaderValues){
    for(let i=0; i<this.fader.length; i++){
      for(let j=0; j<this.fader[i].length; j++){

        let tmpFaderValue = newFaderValues[i][j];
        this.fader[i][j].setValue(tmpFaderValue);

      }
    }
  }

  setUniverseFader( newFaderValues ){
    for( let i in newFaderValues ){
      for( let j=0; j<this.fader[i].length; j++ ){
        this.fader[i][j].setValue(newFaderValues[i][j]);
      }
    }
  }

  setOneFaderValue(universe, faderID, newValue){
    this.fader[universe][faderID].setValue(newValue);
  }

  getFaderValues(){
    let output = [];
    for(let i=0; i<this.fader.length; i++){
      output.push([]);
      for(let j=0; j<this.fader[i].length; j++){
        output[i].push(this.fader[i][j].value);
      }
    }
    return output;
  }

  //Return the fader values of the requested universes
  getUniverseFader( universes ){
    let tmpValues = {};
    let tmpFaderValues = this.getFaderValues();
    for( let i=0; i<universes.length; i++ ){
      tmpValues[ universes[i] ] = tmpFaderValues[ universes[i] ] ;
    }
    return tmpValues;
  }

  setMasterValue( newMasterValue ){
    this.masterFader.setValue( newMasterValue );
  }

  getMasterFaderValues(masterValue){
    let output = [];
    for(let i=0; i<this.fader.length; i++){
      output.push([]);
      for(let j=0; j<this.fader[i].length; j++){
        output[i].push( parseInt(this.fader[i][j].value * (masterValue / 255)));
      }
    }
    return output;
  }

  removeSceneIDs(){
    for (let tmpScene in this.scenes) {
      delete this.scenes[tmpScene].id;
    }
  }

  getHighestSceneIDs(){
    if(this.scenes.length == 0) return 0;
    let tmpHighestID = this.scenes[0].id;
    for (let i = 1; i < this.scenes.length; i++) {
      if (tmpHighestID < this.scenes[i].id) {
        tmpHighestID = this.scenes[i].id;
      }
    }
    return tmpHighestID;
  }

  resizeAndColorAllFader(){
    for(let i=0; i<this.fader.length; i++){
      for(let j=0; j<this.fader[i].length; j++){
        this.fader[i][j].resizeTrack();
        this.fader[i][j].colorTrack();
      }
    }
  }

  colorAllTracks(){

  }

  deepClone(){
    var output = new Profile();
    output.id = this.id;
    output.name = this.name;
    output.fader = [];
    output.groups= {};
    output.scenes= {};

    for(let i=0; i<this.fader.length; i++){
      var tmpArray = [];
      for(let j=0; j<this.fader[i].length; j++){
        tmpArray.push(this.fader[i][j].deepClone());
      }
      output.fader.push(tmpArray);
    }

    for(var group in this.groups){
      output.groups[group] = this.groups[group].deepClone();
    }

    for(var scene in this.scenes){
      output.scenes[scene] = this.scenes[scene].deepClone();
    }

    output.scene_changes = {added:[], modified:[], removed:[]};
    output.scene_changes.added = this.scene_changes.added.slice(0);
    output.scene_changes.modified = this.scene_changes.modified.slice(0);
    output.scene_changes.removed = this.scene_changes.removed.slice(0);


    return output;
  }

}
