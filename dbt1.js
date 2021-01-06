// input hash from PS, upload to DB-t for querry and calculate checksum h256 to RS for sync
const express = require("express");
var crypto = require("crypto");
const app = express();
const fetch = require("node-fetch");
const { stringify } = require("querystring");
app.use(express.static("dbt"));
app.use(express.json({ limit: "1mb" }));

app.listen(3300, () =>
    console.log("RS1 DBt-0 listening at port 3300" + "\n" +
        "connect to RS1 localhost:3500 to :3508"));

rsGood = [0, 0, 0, 0, 0, 0, 0, 0, 0]
RSip = [
    "http://127.0.0.1:3500/db_t",
    "http://127.0.0.1:3501/db_t",
    "http://127.0.0.1:3502/db_t",
    "http://127.0.0.1:3503/db_t",
    "http://127.0.0.1:3504/db_t",
    "http://127.0.0.1:3505/db_t",
    "http://127.0.0.1:3506/db_t",
    "http://127.0.0.1:3507/db_t",
    "http://127.0.0.1:3508/db_t"];

dbtID = 1;
dbtCode = 1;
dbtInitialChain = "3aa389a0d3b2755b23b63bc2eb1c5e76329cd43189667ecfd81066bdd101ba89"
dbtChain = "3aa389a0d3b2755b23b63bc2eb1c5e76329cd43189667ecfd81066bdd101ba89"

state = 0;
tick = 10000;
phase = 0;
syncId = 1
lastloop = 0;
inputTotal = 1000000000000000;
inputCycle = 0;
inputHash = "---"
queryTotal = 1000000000000000;
queryCycle = 0;
queryHash = "---";
nextChain = "";

psKeyOriginal = [];
psKey = [];
psName = [];
PSinHash = [];
PSinCount = [];
PSinCountDisp = [];
hashToDBt = [[]];
hashToDBtTSname = [];

PSID = "RBAS.ps";
for (i = 0; i < 1000; i++) {
    k = 1000 + i;
    j = PSID + k;
    psName[i] = j;  // initial hash names for all PS
    psKey[i] = crypto.createHash("sha256").update(j).digest("hex");
    psKeyOriginal[i] = psKey[i]; // initial key
    PSinCount[i] = 0;
    PSinCountDisp[i] = 0;
    PSinHash = [] = "---";
}

// receive data from dbc
app.post("/db_c", async (req, res) => {
    rxjson = await req.body;
    console.log("PS input json");
    console.log(rxjson)
    j = rxjson.chainId
    k = crypto.createHash("sha256").update(j).digest("hex");
    console.log("reply hash link = "+k)
    result = "submitted";
    nextChain = k
    // console.log(nextChain)
    resJson = { result, nextChain, tick };
    res.json(resJson);
    console.log(resJson)
});

riTick = [0, 0, 0, 0]
riHash = ["---"]
riPs = [1, 1, 1, 1]
riTs = [2, 2, 2, 2]
rqTime = [3, 3, 3, 3]
rqQs = [4, 4, 4, 4]
rqHash = ["---"]
rqTick = [5, 5, 5, 5]
rqPs = [6, 6, 6, 6]
rqTs = [7, 7, 7, 7]
for (i = 0; i < 50; i++) {
    riTick[i] = 0
    riHash[i] = "---"
    riPs[i] = 1
    riTs[i] = 2
    rqTime[i] = 3
    rqQs[i] = 4
    rqHash[i] = "---"
    rqTick[i] = 5
    rqPs[i] = 6
    rqTs[i] = 7
}

recentInput = { riTick, riHash, riPs, riTs }
recentQuery = { rqTime, rqQs, rqHash, rqTick, rqPs, rqTs }
//local dashboard
app.post("/dbtDisplay", async (req, res) => {
    // console.log("input from PS ")
    rxjson = req.body;
    resJson = {
        tick, dbtCode, inputTotal, inputCycle, queryTotal, queryCycle,
        queryHash, recentInput, recentQuery
    };
    res.json(resJson);
    // console.log(resJson);
});

async function toRS(i) {
    RSdata = { tick, dbtID, dbtCode, dbtChain, queryTotal, queryCycle, queryHash }
    key = tick + inputHash
    // console.log(RSdata)
    const options = {
        method: "POST",
        timeout: 50,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(RSdata),
    };
    res1 = await fetch(RSip[i], options); //to RS
    RSreply = await res1.json();
    if ((i + 1) == syncId) tick = RSreply.tick
    state = RSreply.phase
    if (dbtID != syncId) {
        if (state == syntId) state = syncId + 1
    }
    console.log("state= " + state+" phase= "+phase)  
    dbtChain = RSreply.dbtChain
    // console.log(dbcChain)
}

async function intervalFunc() {
    // console.log(state);
    switch (state) {
        case 0:
            state++;
            loopStart = Date.now();
            PSinCountDisp = [];
            inputCycle = 0;
            hashToDBt = [[]];
            // console.log(PSinCount)
            for (i = 0; i < 1000; i++) {
                PSinCountDisp[i] = PSinCount[i]
                inputCycle = inputCycle + PSinCount[i];
                PSinCount[i] = 0;
                hashToDBt[i] = PSinHash[i];
                PSinHash[i] = ["---"];
            }
            inputTotal = inputTotal + inputCycle
            console.log("tick = " + tick + ", input total = " + inputTotal + "  this cycle " + inputCycle)
            // console.log("fetch rs" + state + " time = " + loopStart + " tick = " + tick + "  input count = " + inputCycle)
            key = stringify(hashToDBt) + tick
            inputHash = crypto.createHash("sha256").update(key).digest("hex");
            break;

        case 1:
            state++;
            toRS(0);
            break;

        case 2:
            state++;
            // toRS(1);
            break;

        case 3:
            state++;
            // toRS(2);
            break;

        case 4:
            state++;
            // toRS(3);
            break;

        case 5:
            state++;
            // toRS(4);
            break;

        case 6:
            state++;
            // toRS(5);
            break;

        case 7:
            state++;
            // toRS(6);
            break;

        case 8:
            state++;
            // toRS(7);
            break;

        case 9:
            looptime = Date.now() - loopStart;
            looptime1 = Date.now() - lastloop
            lastloop = Date.now()
            console.log("looptime = " + looptime + " = " + looptime1);
            state = 0;
            // toRS(8);      
            break;

        default:
            state = 0;
            break;
    }
}

setInterval(intervalFunc, 100);
