mapboxgl.accessToken =
  "pk.eyJ1IjoidGluY29vbGJveSIsImEiOiJjbHRkOTA5bnMwM3hkMnJzaDM3bTZhYnlpIn0.EQm8D9c4C5gNJGnQqKzfDQ";

let map;
let userMarker;
const mapCenterDefault = [-2.24, 53.48];

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

function successLocation(position) {
  const userCoordinates = [position.coords.longitude, position.coords.latitude];
  setupMap(userCoordinates);
  addUserMarker(userCoordinates);
}

function errorLocation() {
  setupMap(mapCenterDefault);
  addUserMarker(mapCenterDefault);
}

function setupMap(center) {
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: center,
    zoom: 15,
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav);

  var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    language: "vi",
    unit: "metric",
  });

  map.addControl(directions, "top-left");
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
