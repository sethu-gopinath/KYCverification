import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ===========================
   FIREBASE CONFIG
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
   PHOTO PREVIEW
=========================== */

const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");

photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        preview.src = e.target.result;
        preview.style.display = "block";

    };

    reader.readAsDataURL(file);

});

/* ===========================
   FORM SUBMIT
=========================== */

const form =
document.getElementById("applicationForm");

form.addEventListener(
    "submit",
    submitApplication
);

/* ===========================
   APPLICATION CREATE
=========================== */

async function submitApplication(e) {

    e.preventDefault();

    try {

        const submitBtn =
        document.getElementById("submitBtn");

        submitBtn.classList.add("loading");
        submitBtn.innerText = "Creating Application...";

        const applicationId =
        generateApplicationId();

        const consentLink =
`${window.location.origin}/KYC/consent.html?id=${applicationId}`;
        let photoBase64 = "";

        const file =
        document.getElementById("photo").files[0];

        if (file) {

            photoBase64 =
            await convertToBase64(file);

        }

        const data = {

            applicationId,

            consentLink,

            status: "Created",

            createdAt:
            new Date().toISOString(),

            customer: {

                fullName:
                value("fullName"),

                fatherName:
                value("fatherName"),

                dob:
                value("dob"),

                age:
                value("age"),

                gender:
                value("gender"),

                phone:
                value("phone"),

                altPhone:
                value("altPhone"),

                email:
                value("email"),

                aadhaar:
                value("aadhaar"),

                pan:
                value("pan"),

                occupation:
                value("occupation"),

                annualIncome:
                value("annualIncome"),

                city:
                value("city"),

                state:
                value("state"),

                pincode:
                value("pincode"),

                address:
                value("address")

            },

            policy: {

                insuranceCompany:
                value("insuranceCompany"),

                insuranceType:
                value("insuranceType"),

                productName:
                value("productName"),

                paymentMode:
                value("paymentMode"),

                policyTerm:
                value("policyTerm"),

                premiumAmount:
                value("premiumAmount"),

                sumAssured:
                value("sumAssured"),

                agentName:
                value("agentName"),

                branchName:
                value("branchName"),

                nomineeName:
                value("nomineeName"),

                nomineeRelation:
                value("nomineeRelation")

            },

            photo: photoBase64,

            logs: {

                1: {

                    event:
                    "Application Created",

                    time:
                    new Date().toISOString()

                }

            }

        };

        await set(
            ref(
                db,
                `applications/${applicationId}`
            ),
            data
        );

        showSuccess(
            applicationId,
            consentLink
        );

        form.reset();

        preview.style.display = "none";

        submitBtn.classList.remove("loading");
        submitBtn.innerText =
        "Create Application";

    }

    catch (error) {

        console.error(error);

        alert(
            "Error: " + error.message
        );

        const submitBtn =
        document.getElementById("submitBtn");

        submitBtn.classList.remove("loading");
        submitBtn.innerText =
        "Create Application";
    }

}

/* ===========================
   SUCCESS MODAL
=========================== */

function showSuccess(
    applicationId,
    consentLink
) {

    const modal =
    document.getElementById(
        "successModal"
    );

    document.getElementById(
        "appNumber"
    ).innerText =
    applicationId;

    document.getElementById(
        "generatedLink"
    ).value =
    consentLink;

    modal.classList.add("show");

    document.getElementById(
        "copyBtn"
    ).onclick = () => {

        navigator.clipboard.writeText(
            consentLink
        );

        alert(
            "Consent Link Copied"
        );

    };

    document.getElementById(
        "openBtn"
    ).onclick = () => {

        window.open(
            consentLink,
            "_blank"
        );

    };

}

/* ===========================
   HELPERS
=========================== */

function value(id) {

    return document
        .getElementById(id)
        .value
        .trim();

}

function generateApplicationId() {

    return Math.floor(
        1000000000 +
        Math.random() * 9000000000
    ).toString();

}

function convertToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
            new FileReader();

            reader.onload =
            () => resolve(
                reader.result
            );

            reader.onerror =
            error => reject(error);

            reader.readAsDataURL(file);

        }
    );

}

/* ===========================
   CLOSE MODAL ON OUTSIDE CLICK
=========================== */

window.onclick = function (event) {

    const modal =
    document.getElementById(
        "successModal"
    );

    if (
        event.target === modal
    ) {

        modal.classList.remove(
            "show"
        );

    }

};
