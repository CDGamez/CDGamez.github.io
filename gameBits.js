    // Add Firebase
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
    import { getDatabase } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

    const firebaseConfig = {
        apiKey: "AIzaSyAHHriAOEPHNxKyttRWHEabuWR6YLEA768",
        authDomain: "cdgamez-gamebits-test.firebaseapp.com",
        projectId: "cdgamez-gamebits-test",
        storageBucket: "cdgamez-gamebits-test.firebasestorage.app",
        messagingSenderId: "437775021108",
        appId: "1:437775021108:web:6795cfc4898638fd584661",
        measurementId: "G-4KWEH6RX7E",
        databaseURL: "https://cdgamez-gamebits-test-default-rtdb.firebaseio.com/"
     };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const db = getDatabase(app);
    // Declare the price and value left
    let itemPrice = "0";
    let valueLeft = "0";

    function writeGameBit(id, card_number, value, cvv, name) {
      db.ref('gamebits/' + id).set({
        card_number,
        value,
        cvv,
        name
      })
      .then(() => {
        console.log(`Card made!`);
        let hasCard = "true";
      })
      .catch(err => console.error(`Write failed: ${err}`));
    }

    // 4️⃣ Function to read and display all gamebits
    function readGameBitValue(id) {
    db.ref('gamebits/' + id + '/value').on('value', (snapshot) => {
      const value = snapshot.val();
    });
  }

    // 5️⃣ Function to update ONLY the `value`
    function updateCardValue(id, newValue) {
      db.ref('gamebits/' + id).update({
        value: newValue
      })
      .then(() => console.log(`Value updated`))
      .catch(err => console.error(`Update failed: ${err}`));
    }

    //Start the gamebit library

    function generateCard() {
      if (signedIn === true) {
        // Declare Min and Max Values
        const minCard = 1000000000000000;
        const maxCard = 9999999999999999;
        const minCVV = 100;
        const maxCVV = 999;
        // Generate random card number and cvv
        const cardNumber = Math.floor(Math.random() * (maxCard - minCard + 1)) + minCard;
        const cvvNumber = Math.floor(Math.random() * (maxCVV - minCVV + 1)) + minCVV;
        console.log("Card Number and CVV Generated");
        // Make the card
        writeGameBit(userID, cardNumber, 0, cvvNumber, firstName);
      } else {
        console.log("User not signed in");
      }
    }

    function buyPaid (price) {
      if (signedIn === true && hasCard === true) {
        readGameBitValue(userID);
        if (value < price) {
          console.log("Insufficient funds");
        } else {
          console.log("Processing...");
          itemPrice = price;
          valueLeft = itemPrice - value;
          updateCardValue(userID, valueLeft);
          console.log("Item purchased!");
        }
      } else {
        console.log("User not signed in");
      }
    }