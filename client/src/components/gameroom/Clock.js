import React, { useEffect } from "react";

import "./clock.css";
export default function Clock() {
  /* 나중에 시간되면 시계 돌아가도록 수정하기!
  var hourH = document.getElementById("hour");
  var minH = document.getElementById("min");
  var secH = document.getElementById("sec");

  var Hands = document.getElementsByClassName("hand");

  useEffect(() => {
    toggleBtn.addEventListener("click", function () {
      if (body.className == "blue") {
        body.setAttribute("class", "pink");
        toggleBtn.setAttribute("class", "pink");
        indicator.setAttribute("class", "pink");
        clock.setAttribute("class", "pink");
      } else if (body.className == "pink") {
        body.setAttribute("class", "blue");
      }
    });
  }, []);
  function setTime() {
    var date = new Date();
    const [hr, min, sec] = [
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ];

    rotate(hourH, hr * 30 + min * 0.5 + sec * (1 / 180));
    rotate(minH, min * 6 + sec * 0.1);
    rotate(secH, min * 360 + sec * 6);
  }
  //setInterval(setTime, 1000);
  function rotate(e, x) {
    e.style.transform = "rotate(" + x + "deg)";
  }

  var toggleBtn = document.getElementById("toggle");
  var indicator = document.getElementById("indicator");
  var body = document.querySelector("body");
  var clock = document.getElementById("clock");
  var center = document.querySelector(":after");
*/
  return (
    <>
      <div id="toggle" class="blue">
        <div id="indicator" class="blue">
          {" "}
        </div>
      </div>
      <div id="clock" class="blue">
        <div id="pin"> </div>
        <div id="hour" class="hand">
          {" "}
        </div>
        <div id="min" class="hand">
          {" "}
        </div>
        <div id="sec" class="hand">
          {" "}
        </div>
      </div>
    </>
  );
}
