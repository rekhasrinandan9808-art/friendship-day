document.addEventListener("DOMContentLoaded", () => {
  const cardCube = document.getElementById("cardCube");
  const cardForm = document.getElementById("cardForm");
  
  const toPhotosBtn = document.getElementById("toPhotosBtn");
  const backToGreetingBtn = document.getElementById("backToGreetingBtn");
  const restartBtn = document.getElementById("restartBtn");
  
  const photoInput = document.getElementById("photoUpload");
  const photoGallery = document.getElementById("photoGallery");
  const emptyPhotosMsg = document.getElementById("emptyPhotosMsg");

  let uploadedImages = [];

  // --- Handle Photo Upload Preview ---
  photoInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Max 3 photos
    uploadedImages = [];
    photoGallery.innerHTML = "";

    if (files.length === 0) {
      photoGallery.appendChild(emptyPhotosMsg);
      return;
    }

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgData = event.target.result;
        uploadedImages.push(imgData);

        // Build Polaroid Element
        const frame = document.createElement("div");
        frame.className = "polaroid-frame";
        
        // Alternate tilt angle (-6deg, +6deg, -3deg)
        const angles = [-6, 6, -3];
        frame.style.setProperty("--rot", `${angles[index % 3]}deg`);

        const img = document.createElement("img");
        img.src = imgData;
        img.alt = "Memory Photo";

        frame.appendChild(img);
        photoGallery.appendChild(frame);
      };
      reader.readAsDataURL(file);
    });
  });

  // --- STAGE 1 -> STAGE 2: Form Submit to Greeting (1st Flip) ---
  cardForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const sender = document.getElementById("senderName").value.trim();
    const friend = document.getElementById("friendName").value.trim();

    // Populate Personalized Greeting Text
    document.getElementById("greetingTitle").innerText = `Happy Friendship Day, ${friend}! 🎉`;
    document.getElementById("greetingFrom").innerText = `— With love, ${sender}`;

    // Trigger 1st Flip
    cardCube.className = "card-inner show-greeting";
  });

  // --- STAGE 2 -> STAGE 3: Greeting to Photo Gallery Wall (2nd Flip) ---
  toPhotosBtn.addEventListener("click", () => {
    cardCube.className = "card-inner show-photos";
  });

  // --- STAGE 3 -> STAGE 2: Return to Greeting Message ---
  backToGreetingBtn.addEventListener("click", () => {
    cardCube.className = "card-inner show-greeting";
  });

  // --- Reset Back to Form (Stage 1) ---
  restartBtn.addEventListener("click", () => {
    cardForm.reset();
    photoGallery.innerHTML = "";
    photoGallery.appendChild(emptyPhotosMsg);
    cardCube.className = "card-inner";
  });
});
