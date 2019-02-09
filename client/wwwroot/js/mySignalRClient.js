(function() {
    //Written in pure JavaScript code, no jQuery addon involved
    var txtInput = document.getElementById("txtInput");
    var btnSend = document.getElementById("btnSend");
    var btnDisconnect = document.getElementById("btnDisconnect");
    var divPanel = document.getElementById("divPanel");   
    var maxRetries = 5;
    var retries = 0;
    var explicitDisconnect = false;

    //setup server hub connection
    var hubCon = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:8090/chat")   //optionaly, enable logging with .configureLogging(signalR.LogLevel.Information)
        .configureLogging(signalR.LogLevel.Information)
        .build();

    //listen for any incoming messages sent by the server hub, receives and displays them on the UI
    hubCon.on("ReceiveMessage", (message) => writeToPanel(message));
    hubCon.on("ClientConnected", (message, nickname) => writeToPanel(message));
    hubCon.on("ClientDisconnected", (message) => writeToPanel(message));
    //listen for lost connections, attempts to reconnect
    hubCon.onclose(function () {
        if (!explicitDisconnect) {
            writeToPanel("Disconnected from Hub...");
            writeToPanel("Reconnecting...");
            start();
        }
    });

    //open connection to the server hub
    start();
    function start() {
        hubCon.start()
              .then(function () {
                writeToPanel("Connected to the Hub...");
                hubCon.invoke("GetServerDateTime")
                      .then(data => writeToPanel(data.toString()))
                      .catch(err => writeToPanel("Could not get the current server date and time."));
              })
              .catch(function (err) {                                    
                  if (retries < maxRetries)                                           
                      setTimeout(function () {
                          writeToPanel(`Reconnection retry: ${retries+1}`);
                          retries++;
                          start();
                      }, 7000);                  
              });
    }

    //setup DOM event listeners
    btnSend.addEventListener("click", function() {
        ////sends message to the server hub
        hubCon.invoke("SendMessage", txtInput.value)          
              .catch(function(err) {
                  console.error(err);
                  writeToPanel(err.toString());
              });
    });
    btnDisconnect.addEventListener("click", function () {
        writeToPanel("Disconnected from Hub...");
        explicitDisconnect = true;
        hubCon.stop();        
    });

    //output received messages to the UI
    function writeToPanel(message) {
        const p = document.createElement("span");
        const br = document.createElement("br");
        p.textContent = `${message}`;
        divPanel.appendChild(p);
        divPanel.appendChild(br);
    }
})();