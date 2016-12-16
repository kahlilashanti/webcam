const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');


function getVideo(){
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(localMediaStream => {
    // console.log(localMediaStream);
    video.src = window.URL.createObjectURL(localMediaStream);//in order for it to work the object has to be converted to a url so we add window.url...etc and then wrap it
    video.play();
   })
   .catch(err => {
     console.error(`CMON MAN!`, err);
   })
  }

  //now we take a frame from the video and paint it on ths screen.
  //create a function for this
  function paintToCanvas(){
    //we need the size of the canvas
    const width = video.videoWidth;
    const height = video.videoHeight;
    //then we console log it to find out what it is - we go to the console and call paintToCanvas(); and we get 640 x 480
    //so we need to make sure that the canvas size is equal to the size of the video coming from our webcam (640 x 480)
    canvas.width = width;
    canvas.height = height;
    //every sixteen seconds we're going to take an image from the camera and put it on the canvas

    return setInterval(() => {
      ctx.drawImage(video, 0, 0, width, height);
      //the way fllters work is they take the pixels out of the canvas, stank them up and then put them back off up in 'dere'
      //let's do that shall we?
      //take the pixels out
      let pixels = ctx.getImageData(0,0, width, height);//using 'let' because it will need to be reused a few times
      //if you console.log(pixels) you'll see millions of pixels broken into arrays. Each pixel is r,g,b,a
      //mess with the pixels
      // pixels = redEffect(pixels);
      // pixels = rgbSplit(pixels);
      // ctx. globalAlpha = 0.1;//this will make you dizzy.  delayed by ten frames
      // pixels = greenScreen(pixels);
      //put them back
      ctx.putImageData(pixels, 0,0);
    }, 16); //this is for every 16 milliseconds
  }

  //now let's figure out how to take a picture

  function takePhoto(){
    //play the snap sound
    snap.currentTime = 0;
    snap.play();

    //take the data out of the canvas so we can use it and download it. man...
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome');
    link.innerHTML = `<img src="${data}" alt="Damn good picture" />`;
    strip.insertBefore(link, strip.firstChild);
  }

  //now we create a function that loops over all the pixels and changes their properties
  //this one makes the pic go red
  function redEffect(pixels){
    for(let i = 0; i< pixels.data.length; i+=4){
      pixels.data[i + 0] =pixels.data[i + 0] + 100;//red
      pixels.data[i + 1] =pixels.data[i + 0] - 50;//green
      pixels.data[i + 2] =pixels.data[i + 0] * 0.5;//blue
    }
    return pixels;
  }

  //this one is called rgb split - separates the r g b
  function rgbSplit(pixels){
    for(let i = 0; i< pixels.data.length; i+=4){
      pixels.data[i -150] =pixels.data[i + 0];//red
      pixels.data[i * 100] =pixels.data[i + 1];//green
      pixels.data[i - 500] =pixels.data[i + 2];//blue
    }
    return pixels;
  }

  //this is the green screen effect

  function greenScreen(pixels){
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) =>{
      levels[input.name] = input.value;
    });

    for (i = 0; i < pixels.data.length; i = i + 4){
      red= pixels.data[i + 0];
      green= pixels.data[i + 1];
      blue= pixels.data[i + 2];
      alpha= pixels.data[i + 3];

      if(red >= levels.rmin
        && green >= levels.gmin
        && blue >= levels.bmin
        && red >= levels.rmax
        && green >= levels.gmax
        && blue>= levels.bmax){
          pixels.data[i + 3] = 0;
        }
    }


  }



  getVideo();

  video.addEventListener('canplay', paintToCanvas);
