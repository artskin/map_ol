import '../assets/style/ol/ol.css';
import {Map, View} from 'ol';
// import TileLayer from 'ol/layer/Tile';
// import OSM from 'ol/source/OSM';

import {getCenter} from 'ol/extent.js';
import ImageLayer from 'ol/layer/Image.js';
import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';

import {defaults as defaultInteractions,Translate,Draw, Modify, Snap} from 'ol/interaction.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Circle as CircleStyle, Fill,Icon, Stroke, Style} from 'ol/style.js';


import {click, pointerMove, altKeyOnly} from 'ol/events/condition.js';
import Select from 'ol/interaction/Select.js';

import Feature from 'ol/Feature.js';
import {LineString, Point, Polygon} from 'ol/geom.js';
import GeoJSON from 'ol/format/GeoJSON.js';

// Map views always need a projection.  Here we just want to map image
// coordinates directly to map coordinates, so we create a projection that uses
// the image extent in pixels.

var data={}

var extent = [0, 0, 1400, 1288];
var projection = new Projection({
  code: 'xkcd-image',
  units: 'pixels',
  extent: extent
});

var raster = new TileLayer({
  source: new OSM()
});

var source = new VectorSource();
var vector = new VectorLayer({
  source: source,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.5)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  })
});

var map = new Map({
  target: 'map',
  //interactions: defaultInteractions().extend([select]),
  layers: [
    //raster, vector
    new ImageLayer({
      source: new Static({
        url: './img/floor_map2.jpg',
        projection: projection,
        imageExtent: extent
      })
    }),
    new VectorLayer({
      source:new VectorSource({
        url:"data/geoJson.json",//读取图形数据
        format: new GeoJSON(),
        wrapX: false
      }),
      style: new Style({
        image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
          anchor: [0.5, 100],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 1,
          rotation:-90,
          rotateWithView:true,
          scale:0.2,
          src: './img/camera@2x.svg',
        })),
        stroke: new Stroke({
          width: 1,
          color: [255, 0, 0, 1]
        }),
        fill: new Fill({
          color: [0, 0, 255, 0.3]
        })
      })
    }),
    vector
  ],
  view: new View({
    projection: projection,
    center: getCenter(extent),
    zoom: 2,
    maxZoom: 8
  })
});

//给区域添加点击事件
var select = null; // ref to currently selected interaction

// select interaction working on "click"
var selectClick = new Select();

map.addInteraction(selectClick);


selectClick.on('select', function(e) {
  var groupID = e.selected[0].values_.groupID;
  
  
  console.log(groupID)
});

var modify = new Modify({source: source});
map.addInteraction(modify);

var draw, snap; // global so we can remove them later

$("#type li").click(function(){
  removeAction()
  $(this).addClass("selected");
  var typeVal = $(this).children("i").attr("id");
  console.log(typeVal)
  addInteractions(typeVal)
})

function addInteractions(typeVal) {
  draw = new Draw({
    source: source,
    type: typeVal,
    //geometryName:"group1"
  });
  map.addInteraction(draw);

  snap = new Snap({source: source});
  map.addInteraction(snap);

  draw.on('drawend', function(e){
    console.log("完成后",e)
    removeAction();
    saveDraw(e.target.mode_,e.target.sketchCoords_)
  });
}

function removeAction(){
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  $("#type li").removeClass("selected");
}

function saveDraw(Dtype,Arr) {
  store.set(Dtype,Arr);
  // localforage.setItem(Dtype, Arr).then(function(value) {
  //   console.log(value[0]);// This will output `1`.
  // }).catch(function(err) {
  //   console.log(err);// This code runs if there were any errors
  // });
}
