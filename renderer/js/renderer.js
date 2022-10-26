const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');
/* !We CANNOT bring core nodejs modules or other packages here.
We need to expose them from a preload.js which is a support file.*/

// Make sure file is an image
const isFileImage = (file) => {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
};

const alertError = (message) =>
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false, // to not have a close button
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });

const alertSuccess = (message) =>
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });

const loadImage = (e) => {
  // files are pushed in an array called "files", just access the 0 position.
  const file = e.target.files[0];
  if (!isFileImage(file)) {
    alertError('Selecciona una image en format gif, png o jpeg');
    return;
  }
  //   Get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };
  form.style.display = 'block';
  filename.innerText = file.name;
  //   *↓↓↓ Lo siguiente podemos hacerlo gracias al preload.js ↓↓↓
  outputPath.innerText = path.join(os.homedir(), 'documents/App_Dev/electronjs/redimens');
};

// *Send image to main
const sendImage = (e) => {
  e.preventDefault();
  const width = widthInput.value;
  const height = heightInput.value;
  const imagePath = img.files[0].path;

  if (!img.files[0]) {
    alertError('Selecciona una imatge sisplau.');
    return;
  }
  if (width === '' || height === '') {
    alertError('Especifica dimensions sisplau.');
    return;
  }
  // *send to main using ipcRenderer
  ipcRenderer.send('image:resize', {
    imagePath,
    width,
    height,
  });

  // *catch the image done event from main.js and make success message
  ipcRenderer.on('image:done', () =>
    alertSuccess(`Fet! Noves mides: ${widthInput.value} x ${heightInput.value}.`)
  );
};

// !↓↓↓ Event listeners ↓↓↓______________________________________________
// img.addEventListener('change', loadImage)
img.onchange = (e) => loadImage(e);
form.onsubmit = (e) => sendImage(e);
