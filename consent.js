import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    update
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ===========================
   FIREBASE
=========================== */

const firebaseConfig = {

    apiKey: "AIzaSyDzR0mlf1QpaGxEJ_rwErxZvgU899n8WGE",

    authDomain: "insuranceconsentapp.firebaseapp.com",

    databaseURL:
    "https://insuranceconsentapp-default-rtdb.firebaseio.com",

    projectId: "insuranceconsentapp",

    storageBucket:
    "insuranceconsentapp.firebasestorage.app",

    messagingSenderId:
    "198248114444",

    appId:
    "1:198248114444:web:b0faa3925805bbe8f48129"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ===========================
   GLOBALS
=========================== */

let applicationData = null;
let applicationId = null;

let cameraStream = null;
let mediaRecorder = null;
let recordedChunks = [];

let faceStream = null;
let faceVerified = false;

const pages =
document.querySelectorAll(".page");

/* ===========================
   INIT
=========================== */

window.addEventListener(
    "load",
    init
);

async function init(){

    const params =
    new URLSearchParams(
        window.location.search
    );

    applicationId =
    params.get("id");

    if(!applicationId){

        alert(
            "Application ID Missing"
        );

        return;
    }

    await loadApplication();
}

/* ===========================
   LOAD DATA
=========================== */

async function loadApplication(){

    try{

        const snapshot =
        await get(
            ref(
                db,
                `applications/${applicationId}`
            )
        );

        if(!snapshot.exists()){

            alert(
                "Application Not Found"
            );

            return;
        }

        applicationData =
        snapshot.val();

        populateData();

    }
    catch(error){

        console.error(error);

        alert(
            "Unable to load application"
        );
    }

}

/* ===========================
   POPULATE DATA
=========================== */

function populateData(){

    document.getElementById(
        "customerPhoto"
    ).src =
    applicationData.photo || "";

    const c =
    applicationData.customer;

    document.getElementById(
        "personalDetails"
    ).innerHTML = `

    <div class="details-row">
        <span class="details-label">Full Name</span>
        <span>${c.fullName || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">Age</span>
        <span>${c.age || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">Gender</span>
        <span>${c.gender || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">Phone</span>
        <span>${c.phone || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">Email</span>
        <span>${c.email || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">Address</span>
        <span>${c.address || ""}</span>
    </div>
    `;

    const p =
    applicationData.policy;

    document.getElementById(
        "policyDetails"
    ).innerHTML = `

    <div class="details-row">
        <span class="details-label">
            Insurance Company
        </span>
        <span>${p.insuranceCompany || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">
            Insurance Type
        </span>
        <span>${p.insuranceType || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">
            Product Name
        </span>
        <span>${p.productName || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">
            Premium Amount
        </span>
        <span>${p.premiumAmount || ""}</span>
    </div>

    <div class="details-row">
        <span class="details-label">
            Sum Assured
        </span>
        <span>${p.sumAssured || ""}</span>
    </div>
    `;
}

/* ===========================
   PAGE NAVIGATION
=========================== */

window.nextPage =
function(pageNo){

    pages.forEach(
        p => p.classList.remove(
            "active"
        )
    );

    document.getElementById(
        `page${pageNo}`
    ).classList.add(
        "active"
    );

    updateProgress(pageNo);
}

function updateProgress(pageNo){

    const percentage =
    (pageNo / 9) * 100;

    document.getElementById(
        "progressBar"
    ).style.width =
    percentage + "%";
}

/* ===========================
   STATUS & LOGS
=========================== */

async function updateStatus(status){

    await update(
        ref(
            db,
            `applications/${applicationId}`
        ),
        {
            status
        }
    );
}

async function addLog(event){

    const logKey =
    Date.now();

    await update(
        ref(
            db,
            `applications/${applicationId}/logs`
        ),
        {
            [logKey]:{
                event,
                time:
                new Date().toISOString()
            }
        }
    );
}

/* ===========================
   LANGUAGE
=========================== */

window.selectLanguage =
async function(language){

    await update(
        ref(
            db,
            `applications/${applicationId}`
        ),
        {
            selectedLanguage:
            language
        }
    );

    await updateStatus(
        "Language Selected"
    );

    await addLog(
        `Language Selected - ${language}`
    );

    nextPage(2);
}

/* ===========================
   CAMERA
=========================== */

window.grantCamera =
async function(){

    try{

        cameraStream =
        await navigator.mediaDevices
        .getUserMedia({
            video:true,
            audio:true
        });

        document.getElementById(
            "cameraPreview"
        ).srcObject =
        cameraStream;

        await updateStatus(
            "Camera Granted"
        );

        await addLog(
            "Camera Permission Granted"
        );

        setTimeout(()=>{

            nextPage(3);

        },1500);

    }
    catch(error){

        alert(
            "Camera Permission Denied"
        );

        console.error(error);
    }

}

/* ===========================
   LOCATION
=========================== */

window.captureLocation =
function(){

    navigator.geolocation
    .getCurrentPosition(

        async(position)=>{

            await update(
                ref(
                    db,
                    `applications/${applicationId}`
                ),
                {
                    location:{
                        latitude:
                        position.coords.latitude,

                        longitude:
                        position.coords.longitude
                    }
                }
            );

            await updateStatus(
                "Location Captured"
            );

            await addLog(
                "Location Captured"
            );

            nextPage(4);

startFaceCamera();
        },

        ()=>{

            alert(
                "Location Permission Denied"
            );

        }

    );
}
// CAMERA AND LOCATION ACCESS

window.requestPermissions = async function () {

    try {

        cameraStream =
        await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        document.getElementById(
            "cameraPreview"
        ).srcObject = cameraStream;

        document.getElementById(
            "cameraStatus"
        ).innerHTML =
        "✓ Camera Granted";

        document.getElementById(
            "cameraStatus"
        ).className =
        "status success";

    }
    catch(error){

        document.getElementById(
            "cameraStatus"
        ).innerHTML =
        "✗ Camera Denied";

        document.getElementById(
            "cameraStatus"
        ).className =
        "status error";

        return;
    }

    navigator.geolocation.getCurrentPosition(

        async(position)=>{

            await update(
                ref(
                    db,
                    `applications/${applicationId}`
                ),
                {
                    location:{
                        latitude:
                        position.coords.latitude,
                        longitude:
                        position.coords.longitude
                    }
                }
            );

            document.getElementById(
                "locationStatus"
            ).innerHTML =
            "✓ Location Granted";

            document.getElementById(
                "locationStatus"
            ).className =
            "status success";

            await updateStatus(
                "Camera & Location Granted"
            );

            await addLog(
                "Camera & Location Granted"
            );

            setTimeout(()=>{

                nextPage(4);

                startFaceCamera();

            },1000);

        },

        ()=>{

            document.getElementById(
                "locationStatus"
            ).innerHTML =
            "✗ Location Denied";

            document.getElementById(
                "locationStatus"
            ).className =
            "status error";
        }

    );

}
/* ===========================
   PERSONAL
=========================== */

window.acceptPersonal =
async function(){

    await updateStatus(
        "Personal Accepted"
    );

    await addLog(
        "Personal Details Accepted"
    );

    nextPage(6);
}

/* ===========================
   POLICY
=========================== */

window.acceptPolicy =
async function(){

    await updateStatus(
        "Policy Accepted"
    );

    await addLog(
        "Policy Details Accepted"
    );

    nextPage(7);
}

/* ===========================
   DECLARATION
=========================== */

window.acceptDeclaration =
async function(){

    await updateStatus(
        "Declaration Accepted"
    );

    await addLog(
        "Declaration Accepted"
    );

    nextPage(8);
}

/* ===========================
   REJECT
=========================== */

window.rejectApplication =
async function(reason){

    await updateStatus(
        reason
    );

    await addLog(
        reason
    );

    alert(
        "Application Rejected"
    );

    location.reload();
}

/* ===========================
   VIDEO RECORDING
=========================== */

window.startRecording =
async function(){

    try{

        const statusDiv =
        document.getElementById(
            "recordingStatus"
        );

        const stream =
        await navigator.mediaDevices
        .getUserMedia({
            video:true,
            audio:true
        });

        document.getElementById(
            "recordVideo"
        ).srcObject =
        stream;

        recordedChunks = [];

        mediaRecorder =
        new MediaRecorder(stream);

        mediaRecorder.ondataavailable =
        e => {

            if(e.data.size > 0){

                recordedChunks.push(
                    e.data
                );
            }

        };

        mediaRecorder.start();

        statusDiv.innerHTML =
        "Recording... 10 Seconds";

        let seconds = 10;

        const timer =
        setInterval(()=>{

            seconds--;

            statusDiv.innerHTML =
            `Recording... ${seconds}s`;

        },1000);

        setTimeout(async()=>{

            clearInterval(timer);

            mediaRecorder.stop();

            statusDiv.innerHTML =
            "Recording Completed";

            await saveVideoInfo();

            nextPage(9);

        },10000);

    }
    catch(error){

        console.error(error);

        alert(
            "Unable to access camera"
        );
    }

}

/* ===========================
   SAVE VIDEO INFO
=========================== */

async function saveVideoInfo(){

    await update(
        ref(
            db,
            `applications/${applicationId}`
        ),
        {
            videoConsent:{
                recordedAt:
                new Date().toISOString(),

                duration:
                "10 Seconds"
            },

            status:
            "Completed"
        }
    );

    await addLog(
        "Video Consent Recorded"
    );

    await addLog(
        "Application Completed"
    );

    document.getElementById(
        "finalApplicationNumber"
    ).innerHTML =

    `Application Number :
    <strong>${applicationId}</strong>`;
}

// face comparision.
async function startFaceCamera() {

    try {

        faceStream =
        await navigator.mediaDevices.getUserMedia({
            video: true
        });

        document.getElementById(
            "faceVideo"
        ).srcObject = faceStream;

    }
    catch(error){

        console.error(error);

        alert(
            "Unable to access camera"
        );
    }
}

window.verifyFace =
async function(){
console.log("Application Data:", applicationData);
    try{

        const resultBox =
        document.getElementById(
            "faceResult"
        );

        resultBox.innerHTML =
        "Capturing Selfie...";

        const video =
        document.getElementById(
            "faceVideo"
        );

        const canvas =
        document.getElementById(
            "faceCanvas"
        );

        const ctx =
        canvas.getContext("2d");

        canvas.width =
        video.videoWidth;

        canvas.height =
        video.videoHeight;

        ctx.drawImage(
            video,
            0,
            0
        );
        const selfieBase64 =
canvas.toDataURL(
    "image/jpeg",
    0.9
);
        const selfieBlob =
        await new Promise(resolve =>
            canvas.toBlob(
                resolve,
                "image/jpeg"
            )
        );

        resultBox.innerHTML =
        "Comparing Faces...";

        const imageResponse =
        await fetch(
            applicationData.photo
        );

        const referenceBlob =
        await imageResponse.blob();

        const formData =
        new FormData();

        formData.append(
            "reference_image",
            referenceBlob,
            "reference.jpg"
        );

        formData.append(
            "live_image",
            selfieBlob,
            "selfie.jpg"
        );

        const response =
        await fetch(
            "http://127.0.0.1:8000/compare-face",
            {
                method:"POST",
                body:formData
            }
        );

        const data =
        await response.json();

        if(!data.success){

            resultBox.innerHTML =
            "Verification Failed";

            return;
        }

        const score =
        Number(data.face_score);

        if(score >= 40){

            faceVerified = true;

            resultBox.innerHTML =
            `✅ Face Matched (${score}%)`;

            document.getElementById(
                "continueBtn"
            ).style.display =
            "block";
await update(
    ref(
        db,
        `applications/${applicationId}`
    ),
    {
        faceVerification:{
            verified:true,
            score:score,
            status:data.status,
            verifiedAt:
            new Date().toISOString()
        },

        selfieImage:selfieBase64
    }
);

            await addLog(
                `Face Matched ${score}%`
            );

        }
        else{

            faceVerified = false;

            document.getElementById(
                "continueBtn"
            ).style.display =
            "none";

            resultBox.innerHTML =
            `❌ Face Does Not Match (${score}%)`;

            await addLog(
                `Face Failed ${score}%`
            );
        }

    }
    catch(error){

        console.error(error);

        document.getElementById(
            "faceResult"
        ).innerHTML =
        "Face Verification Failed";
    }
}