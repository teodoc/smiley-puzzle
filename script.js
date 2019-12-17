//Puzzle
const size = parseInt(getUrlParam('size',9)); //1,4,9
var sqrt_size = Math.sqrt(tsize);

var mpuzzle = [], tpuzzle = [];
const drawsize=parseInt(getUrlParam('ds',100));
const maxsolutions=parseInt(getUrlParam('max',200));

var cancount=0;
var maxchecks=10000000
var canvaslist = [], mouseover = []

var solutions = [];
var count = 0;
var time = 0;
var tsize = size;

//Puzzle
mpuzzle = getUrlParam("puzzle",0);
if (mpuzzle) {
  mpuzzle = JSON.parse(atob(mpuzzle));
}
else {
  mpuzzle = stdPuzzle();
}

init();

main();


function Puzzle(p) {
  this.puzzle = p;
  this.childs = [];
}

function prep() {
  let p = new Puzzle([]);
  tpuzzle = compress(mpuzzle);
  compress(mpuzzle,false).forEach(part => { 
    p.puzzle[0] = part;
    t = new Puzzle(copy(p.puzzle));
    p.childs.push(t);
  });
  return p;
}

function solve(c, i=0) {
  i++;
  c.childs.forEach(c => {
    if(solutions.length < maxsolutions && count < maxchecks)  {
      fill(c,i);
      if (i <= tsize -1) {
        solve(c, i); 
      } else {
        solutions.push(c.puzzle);        
      }
    }
  });
  c.puzzle = null;
}

function fill (p,n) {
    let pt = [], next, c;
    p.puzzle.forEach( el => { pt.push(el[0]) })
    for (let i = 0; i < tpuzzle.length; i++) {
      if (pt.indexOf(tpuzzle[i][0]) === -1) {
        next = true;
      }
      else if (tpuzzle[i][0].length > 1){
        c=0;
        for(let j=0; j<p.puzzle.length-1; j++) {
          if(p.puzzle[j][0] === tpuzzle[i][0]) {
            c++;
          }
        }
        next = (c < tpuzzle[i][0].length) ? true : false
      }
      else {
        next = false;
      }

      if (next)  {
        p.puzzle[n] = tpuzzle[i];
        if (check(p.puzzle,n)) {
          t = new Puzzle(copy(p.puzzle)); //1:1 copy
          p.childs.push(t);
        }
      }
    }
  }

function check(puzzle, n) {
  count++;
  let a = 0, b = 0,l=puzzle.length;

  //top
  a=n-sqrt_size;
  a = a >= 0 ? puzzle[a][3] : 0;
  b= puzzle[n][1];
  if (a !== 0 && b !== 0) {
    if ((a + b) != 0) { return false; }
  }

  //left
  a=n-1;
  a = ((a >= 0) && (n%sqrt_size !=0)) ? puzzle[a][2] : 0;
  b= puzzle[n][4];
  if (a !== 0 && b !== 0) {
    if ((a + b) != 0) { return false; }
  }
  
  //bottom
  a=n+sqrt_size;
  a = a < l ? puzzle[a][1] : 0;
  b= puzzle[n][3];
  if (a !== 0 && b !== 0) {
    if ((a + b) != 0) { return false; }
  }

  //right
  a=n+1;
  a = ((a < l)  && (n%sqrt_size !=sqrt_size)) ? puzzle[a][4] : 0;
  b= puzzle[n][2];
  if (a !== 0 && b !== 0) {
    if ((a + b) != 0) { return false; }
  }
  return true;
}


function rotatePiece(piece) {
  piece.push(piece[1]);
  piece.splice(1, 1);
  return piece;
}

function copy(puzzle){
  return JSON.parse(JSON.stringify(puzzle));;
}

function compress(puzzle,rotate=true) {
  let mp = copy(puzzle);
  let p = [];

  if(rotate) {
    mp.forEach(part => {
      for (let r = 0; r < 4; r++) {
        part = rotatePiece(part);
        p.push(copy(part));
     }
    });
  }
  else {
    p=mp;
  }

  for(let i=0; i<p.length; i++) {
    for(let j=0; j<p.length; j++) {
      if(p[i][0] !== p[j][0] && p[i][1] === p[j][1] &&
         p[i][2] === p[j][2] && p[i][3] === p[j][3] && 
         p[i][4] === p[j][4] && p[i][0] !== "-") {
        if (p[i][0].indexOf(p[j][0]) === -1){
          p[i][0] =  p[i][0] + p[j][0];
          p[i][0] = [...new Set(p[i][0])].sort().join("");
        }
        p[j][0] = "-";        
      }
    }
    p = p.filter(a => a[0] !== "-");

  }
  return p;
}

function init() {
  div = document.getElementById('header');
  tsize = 1;  sqrt_size = Math.sqrt(tsize);

  let puzzle = []
  mpuzzle.forEach( p => {puzzle.push([p])})

  puzzle.forEach(p => {
    div.insertAdjacentHTML('beforeend', '<canvas id="can' + cancount +
                           '" width="' + (sqrt_size * drawsize) + 
                           '" height="' + (sqrt_size * drawsize) + '"></canvas>');
    canvaslist[cancount] = document.getElementById("can" + (cancount));

    canvaslist[cancount].i = cancount;
    canvaslist[cancount].onclick = function(event) {
      if((event.y-this.getBoundingClientRect().y ) < ((drawsize+30)/3)) {
        mpuzzle[this.i][1] = next(mpuzzle[this.i][1]);
      }
      if((event.y-this.getBoundingClientRect().y ) > (drawsize+30)-((drawsize+30)/3)) {
        mpuzzle[this.i][3] = next(mpuzzle[this.i][3]);
      }
      if((event.x-this.getBoundingClientRect().x ) < ((drawsize+30)/3)) {
        mpuzzle[this.i][4] = next(mpuzzle[this.i][4]);
      }
      if((event.x-this.getBoundingClientRect().x ) > (drawsize+30)-((drawsize+30)/3)) {
        mpuzzle[this.i][2] = next(mpuzzle[this.i][2]);
      }
      tsize = 1;
      drawPuzzle(p, canvaslist[this.i]);
      tsize = size; sqrt_size = Math.sqrt(tsize); 
      main();
    }
    drawPuzzle(p, canvaslist[cancount]);
    cancount++;    
  });

  div.insertAdjacentHTML('beforeend', '<br>');
  tsize = size; sqrt_size = Math.sqrt(tsize); 
}

function main(){

  count = 0;  
  solutions = [];

  startTime = new Date();
  solve(prep());
  endTime = new Date();  time = endTime-startTime;

  createCanvases();

  drawHeader();
  drawSolutions();
}

function createCanvases() {
  tsize = size;
  sqrt_size = Math.sqrt(tsize);
  let div = document.getElementById('solutions');
  let padding = Math.floor(15*drawsize/100);

  cancount = mpuzzle.length;
  document.getElementById('solutions').innerHTML = '';

  for(let i=0; i<solutions.length; i++){
    div.insertAdjacentHTML('beforeend', '<canvas style="padding:'+padding+'px;"' +
                           'id="can' + cancount + '" width="' + (sqrt_size * drawsize) + 
                           '" height="' + (sqrt_size * drawsize) + '"></canvas>');
    canvaslist[cancount] = document.getElementById("can" + (cancount));
    cancount++;
  }
}


function drawHeader() {
  let link = "index.html?puzzle="+btoa(JSON.stringify(mpuzzle))+"&size="+size;
  let pluslink = "index.html?puzzle="+btoa(JSON.stringify(addPiece()))+"&size="+size;
  let minuslink = "index.html?puzzle="+btoa(JSON.stringify(removePiece()))+"&size="+size;
  let rndlink = "index.html?puzzle="+btoa(JSON.stringify(randomPuzzle()))+"&size="+size;
  let emptylink = "index.html?puzzle="+btoa(JSON.stringify(emptyPuzzle()))+"&size="+size;
  let resetlink = "index.html?puzzle="+btoa(JSON.stringify(stdPuzzle()))+"&size=9";

  document.getElementById('text').innerHTML = "<p>C:" + count + "  " +
    (time + " ms ") + solutions.length+ " Lösungen </p><p>" +
    "<a href="+link+" class='link-button'>Puzzle Link</a>" +
    "<a href="+pluslink+" class='link-button'>+</a>" +
    "<a href="+minuslink+" class='link-button'>-</a>" +
    "<a href="+rndlink+" class='link-button'>Zufall</a>" +
    "<a href="+emptylink+" class='link-button'>Leer</a>" +
    "<a href="+resetlink+" class='link-button'>Reset</a></p>";
}

function drawSolutions() {
  i=mpuzzle.length;
  solutions.forEach(p => {       
    if(canvaslist.length > i) { drawPuzzle(p, canvaslist[i]); }
    i++;
  });
}

function drawPuzzle(puzzle, can) {
  const color = ["rgb(240,240,240)", "rgb(255,255,0)", "rgb(255,130,0)",
                 "rgb(80,190,80)", "rgb(0,80,255)"];
  let ctx = can.getContext("2d");
  let s = drawsize/100; //scale
  let x = 0;
  let y = 0;

  //Clear
  ctx.lineWidth = Math.floor(1*s)
  
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, sqrt_size * drawsize, sqrt_size * drawsize);
  ctx.rect(0, 0, sqrt_size * drawsize, sqrt_size * drawsize);
  ctx.stroke();

  //Grid
  for (let i = 0; i < sqrt_size - 1; i++) {
    ctx.moveTo(0, drawsize + i * drawsize);
    ctx.lineTo(sqrt_size * drawsize, drawsize + i * drawsize);
    ctx.stroke();
    ctx.moveTo(drawsize + i * drawsize, 0);
    ctx.lineTo(drawsize + i * drawsize, sqrt_size * drawsize);
    ctx.stroke();
  }

  for (let i = 0; i < tsize; i++) {

    ctx.fillStyle = "#000000";
    ctx.font = Math.floor((30-puzzle[i][0].length*3)*s)+"px Arial";
    x = (i % sqrt_size) * drawsize;
    y = Math.floor(i / sqrt_size) * drawsize
    ctx.fillText(puzzle[i][0], 41*s + x-puzzle[i][0].length*2, y + 59*s);

    // top
    x = drawsize/2 + (i % sqrt_size) * drawsize;
    y = Math.floor(i / sqrt_size) * drawsize;

    ctx.fillStyle = color[Math.abs(puzzle[i][1])];
    ctx.beginPath();
    ctx.arc(x, y, 24*s, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    if (puzzle[i][1] < 0) {
      ctx.arc(x, y, 15*s, 0, 0.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9*s + x, 8*s + y, 4*s, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.arc(x, y, 15*s, 0.5 * Math.PI, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(+8*s + x, 9*s + y, 4*s, 0, 2 * Math.PI);
      ctx.fill();
    }

    // right
    x = drawsize + (i % sqrt_size) * drawsize;
    y = drawsize/2 + Math.floor(i / sqrt_size) * drawsize;

    ctx.fillStyle = color[Math.abs(puzzle[i][2])];
    ctx.beginPath();
    ctx.arc(x, y, 24*s, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    if (puzzle[i][2] < 0) {
      ctx.arc(x, y, 15*s, 0.5 * Math.PI, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9*s + x, -8*s + y, 4*s, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.arc(x, y, 15*s, Math.PI, 1.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9*s + x, +8*s + y, 4*s, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.stroke();

    // bottom
    x = drawsize/2 + (i % sqrt_size) * drawsize;
    y = drawsize + Math.floor(i / sqrt_size) * drawsize;

    ctx.fillStyle = color[Math.abs(puzzle[i][3])];
    ctx.beginPath();
    ctx.arc(x, y, 24*s, Math.PI, 2*Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    if (puzzle[i][3] < 0) {
      ctx.arc(x, y, 15*s, Math.PI, 1.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(+8*s + x, -9*s + y, 4*s, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.arc(x, y, 15*s, 1.5 * Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-8*s + x, -9*s + y, 4*s, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.stroke();

    // left
    x = (i % sqrt_size) * drawsize;
    y = drawsize/2 + Math.floor(i / sqrt_size) * drawsize;
    ctx.fillStyle = color[Math.abs(puzzle[i][4])];
    ctx.beginPath();
    ctx.arc(x, y, 24*s, 1.5 * Math.PI, 0.5 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "#000000";
    if (puzzle[i][4] < 0) {
      ctx.arc(x, y, 15*s, 1.5 * Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9*s + x, +8*s + y, 4*s, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.arc(x, y, 15*s, 0, 0.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9*s + x, -8*s + y, 4*s, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.stroke();
  }
}

function checkAll(puzzle, f = 0) {
  count++;
  let a = 0, b = 0,l=puzzle.length;
  for (let i = 0; i < sqrt_size; i++) {
    for (let j = 0; j < sqrt_size - 1; j++) {
      a=j + i * sqrt_size;  b=1 + j + i * sqrt_size;
      if(a < l) {a = puzzle[a][2]} else {a = 0;}
      if(b < l) {b = puzzle[b][4]} else {b = 0;}
      if (a !== 0 && b !== 0 && f === 0) {
        if ((a + b) != 0) { return false; }
      }
      a=j * sqrt_size + i; b=(j + 1) * sqrt_size + i;
      if(a < l) {a = puzzle[a][3]} else {a = 0;}
      if(b < l) {b = puzzle[b][1]} else {b = 0;}
      if (a !== 0 && b !== 0 && f === 0) {
        if ((a + b) != 0) { return false; }
      }
    }
  }
  return true;
}


function next(n) {
  if(n <= 0) {
    n=-n;
    n++;
    if (n>4) { 
      return 0
    }
    else {
      return n
    }
  }
  else {
    return -n;
  }
}

function randomPuzzle()
{
  let puzzle = [] 
  c = "abcdefghijklmnopqrstuvwxyz0123456789".split('');
  for(let i=0; i<mpuzzle.length; i++){
    puzzle.push([c[i],getRandom(),getRandom(),getRandom(),getRandom()])
  }
  return puzzle;
}

function emptyPuzzle()
{
  let puzzle = [] 
  let c = "abcdefghijklmnopqrstuvwxyz0123456789".split('');
  for(let i=0; i<mpuzzle.length; i++){
    puzzle.push([c[i],0,0,0,0])
  }
  return puzzle;
}

function stdPuzzle()
{
  let puzzle = [];
  let c = "abcdefghijklmnopqrstuvwxyz0123456789".split('');
  puzzle.push(["a", 1, -4, -2, 3]);
  puzzle.push(["b", -3, 2, 1, -2]);
  puzzle.push(["c", -1, 3, 4, -2]);

  puzzle.push(["d", -1, 4, 3, -4]);
  puzzle.push(["e", -1, 2, 3, -4]);
  puzzle.push(["f", -4, 1, 3, -2]);

  puzzle.push(["g", -3, 4, 1, -2]);
  puzzle.push(["h", -3, 2, 1, -4]);
  puzzle.push(["i", 4, 1, -2, -3]); 

  for (let i=puzzle.length; i<size; i++){
    puzzle.push([c[i],0,0,0,0])
  }

  return puzzle;
}

function addPiece() {
  let puzzle = copy(mpuzzle);
  let c = "abcdefghijklmnopqrstuvwxyz0123456789".split('');
  puzzle.push([c[puzzle.length],0,0,0,0]);

  return puzzle
}

function removePiece() {
  let puzzle = copy(mpuzzle);
  puzzle.pop();
  return puzzle;
}

function getRandom() {
  if(Math.floor(Math.random()*2)==0){
  return Math.floor(Math.random() * 4+1);
  }
  else {
  return -Math.floor(Math.random() * 4+1);
  }
}

function getUrlParam(parameter, defaultvalue){
  var urlparameter = defaultvalue;
  if(window.location.href.indexOf(parameter) > -1){
      urlparameter = getUrlVars()[parameter];
      }
  return urlparameter;
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}