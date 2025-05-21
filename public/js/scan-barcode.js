let html5QrcodeScanner;

function startScanner() {
  const qrRegion = document.getElementById("scanner");
  html5QrcodeScanner = new Html5Qrcode("scanner");

  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      const cameraId = cameras[0].id;
      html5QrcodeScanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: 250
        },
        barcode => {
          document.getElementById("scan-result").innerText = `Scanned: ${barcode}`;
          html5QrcodeScanner.stop();
        },
        errorMessage => {
          // Handle scan errors (optional)
        }
      );
    }
  }).catch(err => {
    console.error("Camera error:", err);
  });
}

function stopScanner() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().then(() => {
      html5QrcodeScanner.clear();
    }).catch(err => {
      console.error("Stop error:", err);
    });
  }
}

function handleManual() {
  const barcode = document.getElementById("barcode-input").value.trim();
  if (barcode) {
    document.getElementById("scan-result").innerText = `Manual Entry: ${barcode}`;
  } else {
    document.getElementById("scan-result").innerText = "Please enter a barcode.";
  }
}
