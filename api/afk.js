/**
 * 
 * _    __            __  __               _     
 *| |  / /___ _____  / /_/ /_  ____ ______(_)  __
 *| | / / __ `/ __ \/ __/ __ \/ __ `/ ___/ / |/_/
 *| |/ / /_/ / / / / /_/ / / / /_/ (__  ) />  <  
 *|___/\__,_/_/ /_/\__/_/ /_/\__,_/____/_/_/|_|  
 *                                              
 *
 *
 * Vanthasix 14.11.1 ― VNTHSY
 *
 * This is for the AFK websocket. It gives the user coins every x seconds.
 * @module afk
*/

const settings = require("../settings.json");
const indexjs = require("../app.js");
const ejs = require("ejs");
const chalk = require("chalk");

let currentlyonpage = {};

module.exports.load = async function(app, db) {
  app.ws("/" + settings.api.afk.path, async (ws, req) => {
    let newsettings = JSON.parse(require("fs").readFileSync("./settings.json"));
    if (!req.session.pterodactyl) return ws.close();
    if (currentlyonpage[req.session.userinfo.id]) return ws.close();

    currentlyonpage[req.session.userinfo.id] = true;

    let coinloop = setInterval(
      async function() {
        let usercoins = await db.get("coins-" + req.session.userinfo.id);
        usercoins = usercoins ? usercoins : 0;
        usercoins = usercoins + newsettings.api.afk.coins;
        await db.set("coins-" + req.session.userinfo.id, usercoins);
      }, newsettings.api.afk.every * 1000
    );

    ws.onclose = async() => {
      clearInterval(coinloop);
      delete currentlyonpage[req.session.userinfo.id];
    }
  });
};

