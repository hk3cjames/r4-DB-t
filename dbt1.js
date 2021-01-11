// input hash from PS, upload to DB-t for querry and calculate checksum h256 to RS for sync
const express = require("express");
var crypto = require("crypto");
const app = express();
const fetch = require("node-fetch");
const { stringify } = require("querystring");
app.use(express.static("dbt"));
app.use(express.json({ limit: "1mb" }));

app.listen(3300, () =>
    console.log(
        "RS1 DBt-0 listening at port 3300" +
        "\n" +
        "connect to RS1 localhost:3500 to :3508"
    )
);

rsGood = [0, 0, 0, 0, 0, 0, 0, 0, 0];
RSip = [
    "http://127.0.0.1:3500/db_t",
    "http://127.0.0.1:3501/db_t",
    "http://127.0.0.1:3502/db_t",
    "http://127.0.0.1:3503/db_t",
    "http://127.0.0.1:3504/db_t",
    "http://127.0.0.1:3505/db_t",
    "http://127.0.0.1:3506/db_t",
    "http://127.0.0.1:3507/db_t",
    "http://127.0.0.1:3508/db_t",
];

dbtID = 1;
dbtCode = 1;
dbtInitialChain = "3aa389a0d3b2755b23b63bc2eb1c5e76329cd43189667ecfd81066bdd101ba89";
dbtChain = "3aa389a0d3b2755b23b63bc2eb1c5e76329cd43189667ecfd81066bdd101ba89";

state = 0;
tick = 0;
phase = 0;
syncId = 1;
loopStart = 0;
lastloop = 0;
inputTotal = 1000000000000000;
inputCycle = 0;
inputHash = "---";
queryTotal = 1000000000000000;
queryCycle = 0;
queryHash = "---";
nextChain = "";

qsKeyOriginal = [];
qsKey = [];
qsName = [];
qsinHash = [];
qsinCount = [];
qsinCountDisp = [];
riTick = []
riHash = []
riId = []
rqTime = []
rqQs = []
rqHash = []
rqTick = []
rqId = []

tsTick = tick
tsHash = "----------------------------------------------------------------"
tsId = "p1000.t1000"
riBuffer = [{tsTick, tsHash, tsId}]
riPointer = 0
qsTime = "Jan 11 2021 21:52:06"
qsId = "qs100"
rqBuffer = [{qsTime, qsId, tsHash, tsTick, tsId}]
rqPointer = 0

for (i = 0; i < 50; i++) {
    riTick[i] = 0;
    riHash[i] = "---";
    riId[i] = 2;
    rqTime[i] = 3;
    rqQs[i] = 4;
    rqHash[i] = "---";
    rqTick[i] = 5;
    rqId[i] = 6;
}

qsId = "RBAS.qs"; // init chain ID for QS
for (i = 0; i < 100; i++) {
    k = 1000 + i;
    j = qsId + k;
    qsName[i] = j; // initial hash names for all qs
    qsKey[i] = crypto.createHash("sha256").update(j).digest("hex");
    qsKeyOriginal[i] = qsKey[i]; // initial key
    qsinCount[i] = 0;
    qsinCountDisp[i] = 0;
    qsinHash = [] = "---";
}

// receive data from dbc
app.post("/db_c", async (req, res) => {
    rxjson = await req.body;
    console.log("dbc input json = ")
    console.log(rxjson);
    hashInput = rxjson.hashToDBt
    console.log(hashInput)
    i = hashInput.length
    inputTotal = inputTotal + i
    for (j=0; j<1; j++)  riBuffer.push(hashInput[j])
  
    console.log("ri buffer = ")
    console.log(riBuffer)
    j = "" + rxjson.dbcChain;
    k = crypto.createHash("sha256").update(j).digest("hex");
    console.log("reply hash link = " + k);
    result = "submitted";
    nextChain = k;
    // console.log(nextChain)
    resJson = { result, nextChain };
    res.json(resJson);
    console.log(resJson);
});

// local dashboard data :- rs:- recent input; rq:-recent query
app.post("/dbtDisplay", async (req, res) => {
    i = riBuffer.length
    for (j = 0; j < i; j++){
        k = i-j-1
        riTick[j] = riBuffer[k].tsTick
        riHash[j] = riBuffer[k].tsHash
        riId[j] = riBuffer[k].tsId
        // console.log('disp i, j, k' + i +', '+ j + ", "+k)
        k++
    }
    recentInput = { riTick, riHash, riId };
    recentQuery = { rqTime, rqQs, rqHash, rqTick, rqId };
    rxjson = req.body;
    resJson = {
        tick,
        dbtCode,
        inputTotal,
        inputCycle,
        queryTotal,
        queryCycle,
        queryHash,
        recentInput,
        recentQuery,
    };
    res.json(resJson);
    // console.log(resJson);
});

async function toRS(i) {
    RSdata = {
        tick,
        dbtID,
        dbtCode,
        dbtChain,
        queryTotal,
        queryCycle,
        queryHash,
    };
    // console.log("to RS json = " + JSON.stringify(RSdata));
    // console.log(RSdata);
    const options = {
        method: "POST",
        timeout: 100,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(RSdata),
    };
    res1 = await fetch(RSip[i], options); //to RS
    RSreply = await res1.json();
    if (i + 1 == syncId) tick = RSreply.tick;
    state = RSreply.phase;
    if (dbtID != syncId) {
        if (state == syntId) state = syncId + 1;
    }
    // console.log("state= " + state + " phase= " + phase);
    dbtChain = RSreply.dbtChain;
    // console.log(dbcChain)
}

async function intervalFunc() {
    // console.log(state);
    switch (state) {
        case 0:
            state++;
            loopStart = Date.now();
            queryCycle = 0;
            for (i = 0; i < 100; i++) {
                qsinCountDisp[i] = qsinCount[i];
                queryCycle = queryCycle + qsinCount[i];
                qsinCount[i] = 0;
                qsinHash[i] = ["---"];
            }
            queryTotal = queryTotal + queryCycle;
            // console.log(
            //     "tick = " +
            //     tick +
            //     ", query total = " +
            //     queryTotal +
            //     "  this cycle " +
            //     queryCycle
            // );
            key = ""+ dbtID + tick;
            queryHash = crypto.createHash("sha256").update(key).digest("hex");
            break;
        case 1:
            state++;
            // toRS(8);     
            break;
        case 2:
            state++;
            // toRS(7);
            break;
        case 3:
            state++;
            // toRS(6);
            break;
        case 4:
            state++;
            // toRS(5);
            break;
        case 5:
            state++;
            // toRS(4);
            break;
        case 6:
            state++;
            // toRS(3);
            break;
        case 7:
            state++;
            // toRS(2);
            break;
        case 8:
            state++;
            // toRS(1);
            break;
        case 9:
            state++;
            toRS(0);
            looptime = Date.now() - loopStart;
            looptime1 = Date.now() - lastloop
            lastloop = Date.now()
            console.log(tick + ", => looptime = " + looptime + " = " + looptime1);
            break;
        case 10:
            state = 0;
            break;
        default:
            state = 0;
            break;
    }
}

setInterval(intervalFunc, 100);
