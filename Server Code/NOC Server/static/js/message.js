/*
Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
Martrikelnummer : 1111 0647
Stand : 13.03.2019
*/
var MESSAGE_UP_TIME = 4000;

class Message{
  constructor(type, messageContent){

    this.alertAreaRef = $("#alert-area");
    this.domRef = $("<div></div>");
    this.domRef.addClass("alert-box");

    if( messageContent ){
      this.domRef.text( messageContent );
    }

    switch ( type ) {
      case "info":
        this.domRef.addClass("message-info");
        break;

      case "error":
        this.domRef.addClass("message-error");
        break;

      case "success":
        this.domRef.addClass("message-success");
        break;

      default:
        this.domRef.addClass("message-default");
    }

    this.domRef.appendTo( this.alertAreaRef );

    setTimeout( ()=> {
      this.hide();
    }, MESSAGE_UP_TIME);
  }

  hide(){
    this.domRef.addClass("hide");
    setTimeout( ()=>{
      this.domRef.remove();
    }, 200);
  }
}
