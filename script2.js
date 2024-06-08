mapboxgl.accessToken =
  "pk.eyJ1IjoidGluY29vbGJveSIsImEiOiJjbHRkOTA5bnMwM3hkMnJzaDM3bTZhYnlpIn0.EQm8D9c4C5gNJGnQqKzfDQ";

let map;
let userMarker;
let directions;
let firstLoad = true;
let userCoordinates;

const mapCenterDefault = [-2.24, 53.48];

async function textToSpeech(text) {
  const response = await fetch(
    "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyBhVzIrpaY2b9epIwSjcKyvdnAewpQv6K4",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          text: text,
        },
        voice: {
          languageCode: "vi-VN",
          ssmlGender: "NEUTRAL",
        },
        audioConfig: {
          audioEncoding: "MP3",
        },
      }),
    }
  );

  const data = await response.json();
  const audioContent = data.audioContent;

  const audio = new Audio();
  audio.src = "data:audio/mp3;base64," + audioContent;
  audio.play();
}

function getDirectionsAndSpeak() {
  directions.on("route", function (e) {
    const routes = e.route;
    const route = routes[0];
    const steps = route.legs[0].steps;
    const markerCoordinates = userMarker.getLngLat();
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const instruction = step.maneuver.instruction;
      const stepCoordinates = step.maneuver.location;
      const distance = calculateDistance(markerCoordinates, stepCoordinates);
      if (distance < 50) {
        textToSpeech(instruction);
        break;
      }
    }
  });
}

function calculateDistance(coord1, coord2) {
  const lat1 = coord1[1];
  const lon1 = coord1[0];
  const lat2 = coord2[1];
  const lon2 = coord2[0];

  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lat2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance * 1000;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function successLocation(position) {
  userCoordinates = [position.coords.longitude, position.coords.latitude];
  if (firstLoad) {
    setupMap(userCoordinates);
    firstLoad = false;
  }
  addUserMarker(userCoordinates);
  getDirectionsAndSpeak();
}

function errorLocation() {
  if (firstLoad) {
    setupMap(mapCenterDefault);
    addUserMarker(mapCenterDefault);
    firstLoad = false;
  }
}

function setupMap(center) {
  if (!map) {
    map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: center,
      zoom: 15,
    });

    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav);

    directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      language: "vi",
      unit: "metric",
    });

    map.addControl(directions, "top-left");
  } else {
    map.setCenter(center);
  }

  getDirectionsAndSpeak(center);
}

function addPopupToMarker(marker, popupContent) {
  const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);
  marker.setPopup(popup);
}

function addUserMarker(coordinates) {
  if (userMarker) {
    userMarker.setLngLat(coordinates);
  } else {
    userMarker = new mapboxgl.Marker({ color: "#FF0000" })
      .setLngLat(coordinates)
      .addTo(map);

    const popupContent = "Đây là vị trí của bạn!";
    addPopupToMarker(userMarker, popupContent);
    userMarker.getElement().addEventListener("mouseenter", () => {
      userMarker.togglePopup();
    });
    userMarker.getElement().addEventListener("mouseleave", () => {
      userMarker.togglePopup();
    });
  }
}

// Hàm để đưa bản đồ về vị trí người dùng
function recenterMap() {
  if (userCoordinates) {
    map.setCenter(userCoordinates);
  }
}

setInterval(() => {
  navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true,
  });
}, 5000);

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

// Thêm sự kiện click cho nút "Về Vị Trí Của Tôi"
document
  .getElementById("recenterButton")
  .addEventListener("click", recenterMap);