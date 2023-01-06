// Smithsonian Institution
// Washington, D.C.
// Office of the Chief Information Officer

// Requirements: Data.gov API Key - On-screen input field for API Key

// What does it do? 
// Submits a user entered search string to Smithsonian's Open Access API. 
//  * The API responds with a JSON list of collection objects that are marked as CC0.
//  * Displays the image results in a grid.

// Overview:
// 1. preload() - Load ml5js objectDetector
// 2. setup() - setup canvas and input fields, wait for input.
// 3. getData() - Query the Smithsonian OA API at Data.gov.
// 6. displayObjects() - Displays a flex grid of the Collections Objects and their images. 

// Data.gov - SI Open Access
let api_UrlBase = "https://api.si.edu/openaccess/api/v1.0";
//let api_UrlBase ="https://api.si.edu/openaccess/api/v1.0/category/:cat/search";
let api_endpt_categorySearchPath = "/category/";
let api_endpt_categorySearchType;
let api_endpt_search = "/search";
let api_param_search_word = "&q=";
let api_param_search_visMat = ' AND online_visual_material:true';
let api_param_start = "&start=";
let api_param_start_value = 0;
let api_param_rows = "&rows=";
let api_param_rows_value = 25;  // Refers to the number of object rows. Objects can have multiple images.
let api_param_sort = "&sort=";
let api_param_sort_value;
let api_param_api_key = "?api_key=";
let api_param_api_key_value;
let objects; // collection objects 
let edanId;  // EDAN is the name of the Smithsonian's Central collection object index.

// IDS = Smithsonian Image Delivery Service. image URLs in the JSON can be retreived from IDs.
let idsId;
let idsBaseUrl = 'https://ids.si.edu/ids/deliveryService'; // IDS = Image Delivery System.
let idsUrl;
let image_dataset = [];
let image_width_param = "&max=";
let image_width = 256;
let search;
let url;
let img;

// Create a ObjectDetector method
//let objectDetector;
//let detectObjects;

function preload() {
  // Load ml5.js Object Detection
  // objectDetector = ml5.objectDetector('cocossd'); // cocossd or yolo
  // console.log('Preload Object detection complete.');
}

function setup() {
  searchButton = select("#searchRequestButton");
  searchButton.mousePressed(getData);
  noCanvas();
} 

function resetPage() {
  objects = [];
  image_dataset = [];
  removeElements();
}

function getData() {
  resetPage();
  
  api_param_api_key_value = document.getElementById("apiKey").value;
  search = document.getElementById("searchRequest").value;
  api_param_sort_value = document.getElementById("searchSort").value;

  if (document.getElementById("searchByCategory").value) {
    api_endpt_categorySearchType = document.getElementById("searchByCategory").value;
    url = api_UrlBase 
    + api_endpt_categorySearchPath 
    + api_endpt_categorySearchType
    + api_endpt_search;
  } else {
    url = api_UrlBase + api_endpt_search;
  };

  // Build loadJSON url
  url = url
  +api_param_api_key
  +api_param_api_key_value
  +api_param_start
  +api_param_start_value
  +api_param_rows
  +api_param_rows_value
  +api_param_sort
  +api_param_sort_value
  +api_param_search_word
  +search
  +api_param_search_visMat;


  loadJSON(url,'json',function data(data){objects = data.response.rows;displayObjects();},function error(err){console.log(err);});
} 

function displayObjects() {    

console.log(objects);

  for (let obj = 0; obj < objects.length; obj++) {
  
    // Roll through the collection object media array and save off just the image media.
    let media = objects[obj].content.descriptiveNonRepeating.online_media.media;

      // Create a DOM element for each record. Each Record can contain multiple images.
      collectionRecord = createElement("li");
      collectionRecord.id(objects[obj].id);
      collectionRecord.class("collections-record");
      collectionRecord.parent("collections-records");

      collectionCard = createDiv();
      collectionCard.class("collection-card");
      collectionCard.parent(collectionRecord);
      
      objectCardTitle = createDiv();
      objectCardTitle.class("object-title");
      objectCardTitle.parent(collectionCard);

      objectTitle = createA("https://www.si.edu/object/" + objects[obj].url,objects[obj].title, "_blank");
      objectTitle.parent(objectCardTitle);

      objectSource = createDiv(objects[obj].content.descriptiveNonRepeating.data_source);
      objectSource.class("object-source");
      objectSource.parent(objectCardTitle);

      objectCardImages = createDiv();
      objectCardImages.class("object-images");
      objectCardImages.parent(collectionCard);

      for (let om = 0; om < media.length; om++) {
        if (media[om].type == 'Images') {
          
          objectCardImage = createDiv();
          objectCardImage.class("object-image");
          objectCardImage.parent(objectCardImages);

          // Create a link to SI.edu to display the deatils about the collection object
          objectLink = createA("https://www.si.edu/object/" + objects[obj].url, 
          "", "_blank");
          objectLink.attribute("alt", objects[obj].title);
          objectLink.parent(objectCardImage);

          // ids = Image Delivery Service -> provides the actual image at a idsUrl pattern
          idsUrl = idsBaseUrl + "?id=" + media[om].idsId + image_width_param + image_width;
          
          // Image is within the Link created above, the reference is the SI collection ID
          objectImage = createElement("img");
          objectImage.attribute("src",idsUrl);
          objectImage.parent(objectLink);
        } 
      }
  }
}
