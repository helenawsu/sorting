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
  const img1 = "<img src = 'assets/1.jpeg'/ height='300'>";
  const img2 = "<img src = 'assets/2.jpeg'/ height='300'>";
  const img3 = "<img src = 'assets/3.jpeg'/ height='300'>"
  var order = [img1,img2,img3];

  function orderToHtml(o) {
    var string = "";
    for (var i = 0; i < o.length; i++) {
      string += o[i];
    } 
    return string;
  }

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // Welcome screen
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: "<p>Welcome to Sorting!<p/>",
  });

  var trial = {
    type: htmlButtonResponse,
    stimulus: orderToHtml(order),
    
    choices: ['1', '2', '3', 'exit'],
    prompt: "<p>select any two images to compare</p>"
  };
  
  var refresh = {
    timeline: [trial],
    prompt: "<p>refresh node</p>",
    conditional_function: function(){
      // get the data from the previous trial,
      // and check which key was pressed
      var data1 = jsPsych.data.get().last(1).values()[0];
      var data2 = jsPsych.data.get().last(2).values()[0];
      console.log("before change", order);
      var temp = order[data1.response];
      order[data1.response] = order[data2.response];
      order[data2.response] = temp;
      console.log("temp", temp);
      console.log("after change", order);

      if(jsPsych.pluginAPI.compareKeys(String(data1.response), '3')){
          
          return false;
      }
      return true;
  }
  };
  var loopNode = {
    timeline: [trial, refresh],
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
