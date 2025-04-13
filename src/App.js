import { MapContainer, TileLayer, GeoJSON, useMap  } from 'react-leaflet'
import statesData from './data/us-states';
import L from 'leaflet';
import './App.css';

function getColor(d) {
  return d > 1000 ? '#800026' :
         d > 500  ? '#BD0026' :
         d > 200  ? '#E31A1C' :
         d > 100  ? '#FC4E2A' :
         d > 50   ? '#FD8D3C' :
         d > 20   ? '#FEB24C' :
         d > 10   ? '#FED976' :
                    '#FFEDA0';
}

function InfoControl() {
  const map = useMap();

  const info = L.control();

  info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info'); // Create a div with a class "info"
    this.update();
    return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML =
      '<h4>US Population Density</h4>' +
      (props
        ? '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
        : 'Hover over a state');
  };

  info.addTo(map);
  map._infoControl = info; // Store the info control in the map instance

  return null; // React Leaflet components must return null when adding controls
}

// Function to add the legend control
function LegendControl() {
  const map = useMap();

  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 10, 20, 50, 100, 200, 500, 1000];

    // Loop through density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);

  return null; // React Leaflet components must return null when adding controls
}

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
  });

  layer.bringToFront();
  const map = e.target._map;
  const infoControl = map._infoControl;
  if (infoControl) {
    infoControl.update(layer.feature.properties);
  }
}

function style(feature) {
  return {
      fillColor: getColor(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
  };
}

function resetHighlight(e) {
  var layer = e.target;
  if (layer.feature) {
    e.target._map.eachLayer((geoLayer) => {
      if (geoLayer instanceof L.GeoJSON) {
        geoLayer.resetStyle(layer);
      }
    });
  }
  const map = e.target._map;
  const infoControl = map._infoControl;
  if (infoControl) {
    infoControl.update();
  }
}

function zoomToFeature(e) {
  var layer = e.target;
  if (layer.feature) {
    const map = e.target._map;
    map.fitBounds(e.target.getBounds());
    
  }
}

function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
  });
}

function App() {

  return (
    <MapContainer center={[37.8, -96]} zoom={4} scrollWheelZoom={false} style={{ height: "600px", marginTop: "40px", marginBottom: "40px" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <Marker position={[51.505, -0.09]} icon={customIcon}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker> */}
      <GeoJSON data={statesData} style={style} onEachFeature={onEachFeature} />
      <InfoControl />
      <LegendControl />
    </MapContainer>
  );
}

export default App;
