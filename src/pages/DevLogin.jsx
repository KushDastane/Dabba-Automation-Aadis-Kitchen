import { useState } from "react";
import { auth } from "../firebase/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { signOut } from "firebase/auth";

export default function DevLogin() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);

 const sendOtp = async () => {
   try {
     if (!window.recaptchaVerifier) {
       window.recaptchaVerifier = new RecaptchaVerifier(
         auth,
         "recaptcha-container",
         {
           size: "normal", // IMPORTANT: not invisible
         }
       );
     }

     const confirmationResult = await signInWithPhoneNumber(
       auth,
       phone,
       window.recaptchaVerifier
     );

     setConfirmation(confirmationResult);
     alert("OTP sent (use test OTP)");
   } catch (err) {
     console.error(err);
     alert(err.message);
   }
 };


  const verifyOtp = async () => {
    await confirmation.confirm(code);
    alert("Logged in successfully");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <input
        className="border p-2"
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button className="bg-green-600 text-white px-4 py-2" onClick={sendOtp}>
        Send OTP
      </button>

      {confirmation && (
        <>
          <input
            className="border p-2"
            placeholder="Enter OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2"
            onClick={verifyOtp}
          >
            Verify OTP
          </button>

          <button
            className="bg-red-600 text-white px-4 py-2"
            onClick={async () => {
              await signOut(auth);
              alert("Logged out");
              window.location.reload();
            }}
          >
            Logout
          </button>
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
}
