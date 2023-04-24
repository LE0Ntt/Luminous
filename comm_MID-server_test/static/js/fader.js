/*
Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
Martrikelnummer : 1111 0647
Stand : 13.03.2019
*/

/*
GPT:
Der Code definiert einige Klassen, die verschiedene Arten von Fadern repräsentieren, wie ChannelFader, MasterFader, GroupFader und TransitionTimeFader. 
Jede Klasse erbt von der Fader-Klasse und implementiert einige spezifische Methoden zum Erstellen und Aktualisieren der DOM-Elemente, zum Hinzufügen von Event-Listenern, 
zum Senden von Werten an den Socket-Server und zum Klonen der Objekte. Der Code wird ausgeführt, wenn die Fader-Objekte instanziiert werden.
*/

// Some constants
var COLOR_ACTIVE  = "#0069ed";
var COLOR_INACTIVE= "rgba(100,100,100,1)";
const KNOB_RADIUS = 25;

class Fader{
  constructor(faderName, faderValue, faderTemplate, instantRender){
    this.colorActive  = "#0069ed";
    this.colorInactive= "rgba(100,100,100,1)";

    if(  faderName  ){
      this.name = faderName;
    }

    if(  faderValue  )
      this.value = faderValue;
    else
      this.value = 0;

    //Clone DOM Template and add as an attribute
    if(instantRender){
      this.domRef = this.getDom(faderTemplate);
      this.fillDom();
      this.addStandardListener();
      this.addAbstractListener();
    }
  }

  //Clone the domRef, fill it and return it
  getDom(inputDom){console.error("GET DOM ISNT IMPLEMENTED!");}

  //Fill the dom element
  fillDom(){ console.error("FILL DOM ISNT IMPLEMENTED!"); }

  //Add a listener to fader
  addStandardListener(){
      //Max / Min button listener

      //Because every function() defines its own this,
      //This needs to be temporary assigned to another variable

      var tmpRef = this;
      let faderMaxValue = parseInt(this.domRef.find(".fader").attr("max"));
      let tagMaxValue   = parseInt(this.domRef.find(".faderValueTag").attr("max"));


      this.domRef.find(".maxButton, .minButton").on("click", function(){
        let tmpValue;

        if(  $(this).hasClass("maxButton")  )
          tmpValue = faderMaxValue;
        else
          tmpValue = 0;

        tmpRef.value = tmpValue;
        tmpRef.domRef.find(".fader").val( parseInt(tmpValue) );
        tmpRef.domRef.find(".faderValueTag").val(parseInt((tmpValue/faderMaxValue) * tagMaxValue));
      });

      // Handle events of the slider
      this.domRef.find(".fader")
        // Color the track when starting to click on it
        .on("mousedown touchstart", ()=>{
          isUpdateingValueTag = true;
          updateValueTag();
          this.colorTrack(this.colorActive);
        })
        .on("mouseup   touchend", function(){
          isUpdateingValueTag = false;
          tmpRef.domRef.find(".fader").val( $(this).val() );
          tmpRef.colorTrack(tmpRef.colorInactive);
      }).on("input", function(){
          // When changing the value of the fader, change the value of the fader object as well
          tmpRef.value = parseInt(  $(this).val()  );
      });

      this.domRef.find(".faderValueTag").on("input", function(){
          tmpRef.value = parseInt( ($(this).val()/tagMaxValue) *faderMaxValue );
          tmpRef.domRef.find(".fader").val(  tmpRef.value  );
          tmpRef.domRef.find(".faderValueTag").val( $(this).val() );
      });

      // recursive function to make sure that fader value tags are updated in
      // A slower frame rate
      var isUpdateingValueTag;
      function updateValueTag(){
        if( isUpdateingValueTag ){
          setTimeout(()=>{
            tmpRef.domRef.find(".faderValueTag").val(parseInt((tmpRef.value/faderMaxValue)*tagMaxValue));
            updateValueTag();
          }, SLIDER_VALUE_UPDATE_FREQ);
        }
      }
  }

  removeStandardListener(){
    // this.domRef.find(" .maxButton, .minButton").off();
  }

  addAbstractListener(){}

  removeAbstractListener(){

  }

  // This function colors the track of the slider
  colorTrack(color){
    let faderLength = 0;
    this.domRef.find(".sliderContainer2, .masterSliderContainer").each(function(){
      if( $(this).height() > faderLength) {faderLength = $(this).height();}
    });
    let faderRatio  = 1.0 - ((KNOB_RADIUS * 2.0) / parseInt(faderLength));

    let sliderGradient =
      "-webkit-gradient(linear, left top, right top," +
      "color-stop(0, rgba(255,255,255,0))," +
      "color-stop(" + ((1.0 - faderRatio) / 2.0) + ",rgba(255,255,255,0))," +
      "color-stop(" + ((1.0 - faderRatio) / 2.0) + ", " + color + ")," +
      "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", " + color + ")," +
      "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", rgba(255,255,255,0))," +
      "color-stop(1, rgba(255,255,255,0)))";

    sliderGradient = this.computeSliderGradient(faderRatio, color);

    var faderToColor = this.domRef.find(".fader").each(function(){
      $(this)[0].style.setProperty("--slider-gradient", sliderGradient);
    });
  }

  computeSliderGradient(faderRatio, color){
    return "-webkit-gradient(linear, left top, right top," +
    "color-stop(0, rgba(255,255,255,0))," +
    "color-stop(" + ((1.0 - faderRatio) / 2.0) + ",rgba(255,255,255,0))," +
    "color-stop(" + ((1.0 - faderRatio) / 2.0) + ", " + color + ")," +
    "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", " + color + ")," +
    "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", rgba(255,255,255,0))," +
    "color-stop(1, rgba(255,255,255,0)))";
  }

  // Resize the  track. Because native resizing is due to css rotation not possible,
  // it has to be done over javascript
  resizeTrack(){
    let faderLength = this.domRef.find(".sliderContainer2, .masterSliderContainer").height();
    this.domRef.find(".fader").width(faderLength - 10);
  }

  setDomRef  (newDomRef){
    this.domRef = newDomRef;
    this.removeAbstractListener();
    this.removeStandardListener();
    this.addStandardListener();
    this.addAbstractListener();
  }

  setValue(newValue){
    this.value = newValue;
    this.domRef.find(".fader").val(parseInt(newValue));
    this.domRef.find(".faderValueTag").val(parseInt((newValue/255)*100));

    //this.domRef.find(".faderValueTag").val(newValue);
  }

  deepClone(){
    var output = new Fader(this.name, this.value);
    return output;
  }

}

// This class represents a channal fader
class ChannelFader extends Fader{
  constructor(faderName, faderValue, faderTemplate, instantRender, universeID, channelID, isFav, faderGroups){
    super(faderName, faderValue, faderTemplate, instantRender);
    this.id = channelID;
    this.universeID = universeID;
    this.isFav = isFav;
    this.groups = faderGroups;
    if(instantRender){
      this.fillDomSpecific();
    }
  }

  // Kann auch weggelassen werden!
  getDom(inputDom){
    let domRef;

    //Check if the fader template is given. If not, get it directly from the dom;
    if( inputDom ){
      domRef = inputDom;
    }
    return domRef;
  }

  // Changes the value tags corresponding to the values of the slider
  fillDom(){
    if(  this.name  ){
      this.domRef.find(".faderName").val(this.name);
    }

    this.domRef.find(".fader").val(this.value);
    this.domRef.find(".faderValueTag").val(parseInt((this.value/255)*100));

  }


  fillDomSpecific(){
    this.domRef.data("channelID", this.id);
    this.domRef.data("universe", this.universeID);
    this.domRef.find(".nameContainer").text(this.id+1);

    if(this.isFav){
      this.domRef.addClass("is-fav");
      this.domRef.find(".dimmerFavorite").addClass("activeMode").find("i").text("star");
    }

  }

  addAbstractListener(){


    //Max / Min button listener
    var tmpRef = this;

    this.domRef.find(".maxButton, .minButton").on("click", function(){
      tmpRef.sendValue();
    });


    this.domRef.find(".fader").on("input", function(){
        tmpRef.sendValue();
    });

    this.domRef.find(".faderValueTag").on("input", ()=>{
      tmpRef.sendValue();
    });

    this.domRef.find(".dimmerFavorite").on("click", ()=>{
      tmpRef.isFav = !this.isFav;
      if(this.isFav){
        this.domRef.addClass("is-fav");
        this.domRef.find(".dimmerFavorite").addClass("activeMode").find("i").text("star");
      }
      else{
        this.domRef.find(".dimmerFavorite").removeClass("activeMode").find("i").text("star_border");
        this.domRef.removeClass("is-fav");
      }
    });

    this.domRef.find(".faderName").on("change", function(){
      tmpRef.name = $(this).val();
    });


  }

  removeAbstractListener(){
    this.domRef.find(".dimmerFavorite").off();
  }

  deepClone(){
    let output;
    output = new ChannelFader(this.name, this.value,undefined, false, this.universeID, this.id, this.isFav, this.groups);
    return output;
  }

  setValue(newValue){
    this.value = newValue;
    this.domRef.find(".fader").val(parseInt(newValue));
    this.domRef.find(".faderValueTag").val(parseInt((newValue/255)*100));
    //this.sendValue();
  }

  sendValue(){
    let faderMsg = {
      faderID   : this.id,
      faderValue: this.value,
      universe  : this.universeID
    };
    socket.emit("dimmer_msg", faderMsg);
  }

}

class MasterFader extends Fader{
  constructor(faderTemplate, currentProfile){
    super("Master",  255 , faderTemplate, true);
    this.profileRef = currentProfile;
    this.colorActive  = "#fff";
    this.colorInactive= "rgb(200,200,200)"

    this.resizeTrack();
    this.colorTrack(this.colorInactive);
    this.setValue(255);
  }

  getDom(inputTemplate){
    return inputTemplate;
  }

  computeSliderGradient(faderRatio, color){
    let primaryColor = getComputedStyle(document.body).getPropertyValue('--c-primary');

    return "-webkit-gradient(linear, left top, right top," +
    "color-stop(0, rgba(0,0,0,0) )," +
    "color-stop(" + ((1.0 - faderRatio) / 2.0) + ",rgba(0,0,0,0) )," +
    "color-stop(" + ((1.0 - faderRatio) / 2.0) + ", " + color + ")," +
    "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", " + color + ")," +
    "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", rgba(0,0,0,0) )," +
    "color-stop(1, rgba(0,0,0,0)))";
  }

  addAbstractListener(){
    let tmpRef = this;
    this.domRef.find(".fader").on("input", function(){
      tmpRef.sendValue();
    });

    this.domRef.find(".maxButton, .minButton").on("click", function(){
      tmpRef.sendValue();
    });

    this.domRef.find(".faderValueTag").on("change", function(){
      tmpRef.sendValue();
    });
  }

  sendValue(){
    let faderMsg = {
      data : parseInt(this.value)
    };
    socket.emit("master_val", faderMsg);
  }

  fillDom(){}


}

class GroupFader extends Fader{

  constructor(faderName, faderValue, faderTemplate, instantRender, dbData, callback){
    if(faderName){
      super(faderName, faderValue, faderTemplate, instantRender);
    }
    else{
      super(undefined, faderValue, faderTemplate, instantRender);
    }

    this._callback=callback;
    if( this.dbData ){
      this.parseDBData();
    }

    this.setValue(255);

    this.domRef.find(".fader").on("input", ()=>{
      this._callback(this.value);
    });
    this.domRef.find(".faderValueTag").on("change", ()=>{
      this._callback(this.value);
    });
    this.domRef.find(".maxButton, .minButton").on("click", ()=>{
      this._callback(this.value);
    });

    this.colorTrack(this.colorInactive);
  }

  getDom(inputDom){
    var output;
    if( inputDom ){
      output = inputDom;
    }
    else{
      output = $(".groupContainerTemplate").clone();
    }
    return output;
  }

  fillDomSpecific(){
  }

  addAbstractListener(){
  }

  fillDom(){
  }

  parseDBData(){
  }

}

class TransitionTimeFader extends Fader{
  constructor(faderTemplate){
    super("Transition Time Fader", 0 , faderTemplate, true);
    this.colorTrack(this.colorInactive);
    this.setValue(0);

  }
  fillDom(){

  }

  getDom(faderTemplate){
    return faderTemplate;
  }

  //Returns the time in seconds
  getTime(){
    let tmpValue = parseInt( ( (this.value/2) / 255)*1000 );
    return tmpValue;
  }

  colorTrack(color){
    let faderLength = 0;
    this.domRef.find(".sliderContainer2, .transTimeFaderContainer").each(function(){
      if( $(this).height() > faderLength) {faderLength = $(this).width();}
    });
    let faderRatio  = 1.0 - ((KNOB_RADIUS * 2.0) / parseInt(faderLength));

    let sliderGradient =
      "-webkit-gradient(linear, left top, right top," +
      "color-stop(0, rgba(255,255,255,0))," +
      "color-stop(" + ((1.0 - faderRatio) / 2.0) + ",rgba(255,255,255,0))," +
      "color-stop(" + ((1.0 - faderRatio) / 2.0) + ", " + color + ")," +
      "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", " + color + ")," +
      "color-stop(" + (faderRatio + ((1.0 - faderRatio) / 2.0)) + ", rgba(255,255,255,0))," +
      "color-stop(1, rgba(255,255,255,0)))";

    sliderGradient = this.computeSliderGradient(faderRatio, color);

    var faderToColor = this.domRef.find(".fader").each(function(){
      $(this)[0].style.setProperty("--slider-gradient", sliderGradient);
    });
  }

}
