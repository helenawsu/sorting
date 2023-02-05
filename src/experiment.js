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
  let img1 = "<img src='assets/red.jpeg'/ height='200'>";
  let img2 = "<img src='assets/orange.jpeg'/ height='200'>";
  let img3 = "<img src='assets/yellow.jpeg'/ height='200'>";
  // the order of images on the screen
  const originalImg = ["<img src='assets/red.jpeg'/ height='200'>","<img src='assets/yellow.jpeg'/ height='200'>","<img src='assets/orange.jpeg'/ height='200'>"];
  let displayOrder = [img1,img3,img2]
  // map/array that maps images to their true order
  const trueOrderArray = [[img1, 0], [img2, 1], [img3, 2]];
  const trueOrder = new Map(trueOrderArray);
  // helper count that determines switch only when two images are selected
  let times_clicked = -1;

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
    console.log("what is imga", imga);
    console.log("dont be null", trueOrder.get(imga));
    console.log(bigger);
    console.log(smaller);

    console.log(displayOrder.indexOf(bigger));
    console.log(displayOrder.indexOf(smaller));
    let clean = removeSelection(displayOrder);
    return !(clean.indexOf(bigger) > clean.indexOf(smaller)) ;
  }
  function removeSelection(imglist) {
    let result = imglist.map((x) => x);;
    for (let i = 0; i < imglist.length; i++){
        if (imglist[i].includes(" id='selected'")) {
          result[i] = result[i].replace(" id='selected'", "");
        }  
    }
    return result;
  }
  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // Welcome screen
  // timeline.push({
  //   type: HtmlKeyboardResponsePlugin,
  //   stimulus: "<p>Welcome to Sorting!<p/>",
  // });

  var trial = {
    type: htmlButtonResponse,
    stimulus:"",
    choices: function() {return displayOrder},
    button_html: '<button class="jspsych-btn">%choice%</button>',
    prompt: "<p>select any two images to compare</p>",
    on_finish: function() {
      // console.log('ORDER IN USE' + displayOrder);
  }
  };


  // determine whether to switch images
  var refresh = {
    timeline: [trial],
    prompt: "<p>refresh node</p>",
    conditional_function: function(){
      if (times_clicked%2 == 0 && times_clicked != 0) {
        // console.log("resetting selection");
        displayOrder = removeSelection(displayOrder);
        // console.log(originalImg);
      }
      times_clicked++;
      // console.log(times_clicked);
      console.log("entering refresh node");
      // get the data from the previous two rial, and check which key was pressed (which images are selected)
      let data1 = jsPsych.data.get().last(1).values()[0];
      let data2 = jsPsych.data.get().last(2).values()[0];
      if (data1.response != null) {
      // console.log("whats this", displayOrder[data1.response]);
      displayOrder[data1.response] = displayOrder[data1.response].replace("<img", "<img id='selected'");
      // console.log("after highlighting", displayOrder[data1.response]);

      }
      let clean = removeSelection(displayOrder);
      if (data2.response != null && times_clicked%2 == 0 && switchOrNot(clean[data1.response], clean[data2.response])) {
      console.log("before change", displayOrder);
      let temp = displayOrder[data1.response];
      displayOrder[data1.response] = displayOrder[data2.response];
      displayOrder[data2.response] = temp;
      }
      
      if(jsPsych.pluginAPI.compareKeys(String(data1.response), '3')){
          
          return false;
      }
      console.log("currently displatyed, ", displayOrder);
      return true;
  }
  };

  //loops trial
  var loopNode = {
    timeline: [refresh],
    loop_function: function(data){
      var data = jsPsych.data.get().last(1).values()[0];
      if(jsPsych.pluginAPI.compareKeys(String(data.response), '3')){
          return false;
      } else {
          return true;
      }
  }
}
timeline.push(loopNode);
  

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}

