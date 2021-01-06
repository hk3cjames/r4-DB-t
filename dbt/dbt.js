state = 0;
wait = 0;
syncphase = 0
loopStart = 0
var syncDisp = [
    "^ . . . . . . . . .",
    ". ^ . . . . . . . .",
    ". . ^ . . . . . . .",
    ". . . ^ . . . . . .",
    ". . . . ^ . . . . .",
    ". . . . . ^ . . . .",
    ". . . . . . ^ . . .",
    ". . . . . . . ^ . .",
    ". . . . . . . . ^ .",
    ". . . . . . . . . ^",
];
var tsHashCountr = []
for (i = 0; i < 1000; i++) { tsHashCountr[i] = i }
const options = {
    method: "POST",
};
async function intervalFunc() {
    document.getElementById("sync").textContent = syncDisp[syncphase];
    syncphase++
    if (syncphase > 9) syncphase = 0
    const d = new Date();
    var str1 = "" + d;
    var timeDisp = str1.substring(4, 24);
    document.getElementById("time").textContent = timeDisp;
    switch (state) {
        case 0:
            state++
            const res = await fetch("/dbtDisplay", options);
            const disp = await res.json();
            console.log(disp);
            document.getElementById("dbtCode").textContent = "RBAS DBt = " + disp.dbtCode
            document.getElementById("tick").textContent = disp.tick;
            const d = new Date();
            var str = "" + d;
            var test = str.substring(4, 24);
            document.getElementById("time").textContent = test;
            document.getElementById("inputTotal").textContent = disp.inputTotal;
            document.getElementById("inputCycle").textContent = disp.inputCycle;
            document.getElementById("queryTotal").textContent = disp.queryTotal;
            document.getElementById("queryCycle").textContent = disp.queryCycle;
            hashDisp = disp.queryHash
            document.getElementById("dbtHash").textContent =
                (hashDisp.substring(0, 32) + "\n" + hashDisp.substring(32, 64));
            for (i = 0; i < 50; i++) {
                k = disp.recentInput.riTick[i]
                l = disp.recentInput.riHash[i]
                m = disp.recentInput.riPs[i]
                n = disp.recentInput.riTs[i]
                document.getElementsByName("recentInput")[i].textContent = 
                k + " " + l + " "+ m + " "+ n
                k = disp.recentQuery.rqTime[i]
                l = disp.recentQuery.rqQs[i]
                m = disp.recentQuery.rqHash[i]
                n = disp.recentQuery.rqTick[i]
                o = disp.recentQuery.rqPs[i]
                p = disp.recentQuery.rqTs[i]
                document.getElementsByName("recentQuery")[i].textContent = 
                k + " " + l + " "+ m + " "+ n+ " "+ o + " "+ p
            }
            wait = 0
            break;

        case 1:
            wait++
            looptime = Date.now() - loopStart
            if (wait > 8) {
                console.log("looptime = " + looptime)
                loopStart = Date.now()
                state = 0
            }
            break;
        default:
            state = 0;
            break
    }

}


setInterval(intervalFunc, 100); 