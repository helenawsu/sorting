/**
 * @title Sorting
 * @description sort the images from one to six
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";
import htmlButtonResponse from '@jspsych/plugin-html-button-response';

import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import { initJsPsych } from "jspsych";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych();
  const timeline = [];

  // images display in html
  let img1 = "<img src='assets/blue.jpeg'/ height='150'>";
  let img2 = "<img src='assets/cyan.jpeg'/ height='150'>";
  let img3 = "<img src='assets/green.jpeg'/ height='150'>";
  let img4 = "<img src='assets/magenta.jpeg'/ height='150'>";
  let img5 = "<img src='assets/red.jpeg'/ height='150'>";
  let img6 = "<img src='assets/yellow.jpeg'/ height='150'>";

  // the order of images on the screen
  let displayOrder = [img1,img2,img3,img4,img5,img6]
  let num_img = 6
  // map/array that maps images to their true order
  const trueOrderArray = [[img1, 0], [img2, 1], [img3, 2],[img4, 3], [img5, 4], [img6, 5]];
  const trueOrder = new Map(trueOrderArray);
  // helper count that determines switch only when two images are selected
  let times_clicked = -1;
  let times_switched = 0;
  let switch_attempted = false;

  // return true only if the the selected images are in the wrong order
  function switchOrNot(imga, imgb) {
    if (trueOrder.get(imga) > trueOrder.get(imgb)) {
      var bigger = imga;
      var smaller = imgb;
    }
    else {
      var bigger = imgb;
      var smaller = imga;
    }
    let clean = removeSelection(displayOrder);
    return !(clean.indexOf(bigger) > clean.indexOf(smaller)) ;
  }

  //remove the class "selection" in raw html
  function removeSelection(imglist) {
    let result = imglist.map((x) => x);;
    for (let i = 0; i < imglist.length; i++){
        if (imglist[i].includes(" id='selected'")) {
          result[i] = result[i].replace(" id='selected'", "");
        }  
    }
    return result;
  }
  //initialize array, note side effect of pushing "finish" at the end of function
  function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    array.push("finish");
    return array;
  }
  

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  //Welcome screen
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: function() {
      displayOrder = shuffle(displayOrder);
      return"<p>Welcome to Sorting!<p/>";
    }  });

  var trial = {
    type: htmlButtonResponse,
    stimulus:"",
    choices: function() {
      return displayOrder;
    },
    button_html: '<button class="jspsych-btn">%choice%</button>',
    prompt: "<p>select any two images to compare, or click finish if you are done sorting.</p>",
    on_finish: function() {
  }
  };


  // determine whether to switch images
  var refresh = {
    timeline: [trial],
    prompt: "<p>refresh node</p>",
    conditional_function: function(){
      if (times_clicked%2 == 0 && times_clicked != 0) {
        displayOrder = removeSelection(displayOrder);
      }
      times_clicked++;
      // get the data from the previous two rial, and check which key was pressed (which images are selected)
      let data1 = jsPsych.data.get().last(1).values()[0];
      let data2 = jsPsych.data.get().last(2).values()[0];
      //highlights the image by giving the image a "selected" id
      if (data1.response != null && displayOrder[data1.response] != undefined) {
      if (displayOrder[data1.response].includes(" id='selected'")){
        console.log("tries to remove");
        //removes highlight if clicked another time
        displayOrder[data1.response] = displayOrder[data1.response].replace(" id='selected'", "");
        switch_attempted = false;
      } else {
        displayOrder[data1.response] = displayOrder[data1.response].replace("<img", "<img id='selected'");
        switch_attempted = true;
      }
      if ( times_clicked % 2 == 0 && switch_attempted) {
        console.log("switch ++", times_switched);
        times_switched++;
      }
      }
      let clean = removeSelection(displayOrder);
      if (data2.response != null && times_clicked%2 == 0 && switchOrNot(clean[data1.response], clean[data2.response])) {
      let temp = displayOrder[data1.response];
      displayOrder[data1.response] = displayOrder[data2.response];
      displayOrder[data2.response] = temp;
      }
      if(jsPsych.pluginAPI.compareKeys(String(data1.response), '6')){
          console.log(data1.response);
          return false;
      }
      return true;
  }
  };

  //loops trial
  var loopNode = {
    timeline: [refresh],
    loop_function: function(data){
      var data = jsPsych.data.get().last(1).values()[0];
      if(jsPsych.pluginAPI.compareKeys(String(data.response), String(num_img))){
          return false;
      } else {
          return true;
      }
  }
}
timeline.push(loopNode);

//finish screen, displays true order
var finish = {
  type: HtmlKeyboardResponsePlugin,
  prompt: function() {return "You made "+ String(times_switched)+ " swtiches in total"},
  stimulus: function() {
    displayOrder.pop();
    let finalDisplay = ["true order revealed...", "<br>"];
    console.log(displayOrder.forEach(element=>trueOrder.get(element)));
    removeSelection(displayOrder).forEach(element=>finalDisplay.push(element, trueOrder.get(element)+1));
    return finalDisplay;
  },
}
timeline.push(finish);
  

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}

