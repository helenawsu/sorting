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
  const img1 = "<img src = 'assets/red.jpeg'/ height='200'>";
  const img2 = "<img src = 'assets/orange.jpeg'/ height='200'>";
  const img3 = "<img src = 'assets/yellow.jpeg'/ height='200'>"
  // the order of images on the screen
  var displayOrder = [img1,img3,img2];
  // map/array that maps images to their true order
  const trueOrderArray = [[img1, 0], [img2, 1], [img3, 2]];
  const trueOrder = new Map(trueOrderArray);
  // helper boolean that determines when to swtich image order
  var change = true;
  
  // helper method that concatentate displayImg to one single string
  function orderToHtml(o) {
    var string = "";
    for (var i = 0; i < o.length; i++) {
      string += o[i];
    } 
    return string;
  }

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
    if (displayOrder.indexOf(bigger) > displayOrder.indexOf(smaller)) {
      return false;
    }
    else{
      return true
    }
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

  // var trial1 = {
  //   type: htmlButtonResponse,
  //   stimulus: orderToHtml(order),
  //   choices: ['1', '2', '3', 'exit'],
  //   prompt: "<p>select any two images to compare, first time</p>"
  // };
  var trial = {
    type: htmlButtonResponse,
    stimulus: function() {return orderToHtml(displayOrder)},
    choices: ['1', '2', '3', 'exit'],
    prompt: "<p>select any two images to compare</p>",
    on_finish: function() {
      console.log('ORDER IN USE' + displayOrder);
  }
  };

  // timeline.push(trial1);

  // determine whether to switch images
  var refresh = {
    timeline: [trial],
    prompt: "<p>refresh node</p>",
    conditional_function: function(){
      console.log("entering refresh node");
      // get the data from the previous two rial, and check which key was pressed (which images are selected)
      var data1 = jsPsych.data.get().last(1).values()[0];
      var data2 = jsPsych.data.get().last(2).values()[0];
      if (data2.response != null && change && switchOrNot(displayOrder[data1.response], displayOrder[data2.response])) {
      // console.log("data2", data2);
      console.log("before change", displayOrder);
      var temp = displayOrder[data1.response];
      displayOrder[data1.response] = displayOrder[data2.response];
      displayOrder[data2.response] = temp;
      console.log("after change", displayOrder);
      }
      change = !change;
      if(jsPsych.pluginAPI.compareKeys(String(data1.response), '3')){
          
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
