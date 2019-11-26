//Puzzle
const size = 9 //1,4,9
var sqrt_size = Math.sqrt(tsize);

var mpuzzle = [], tpuzzle = [];
const drawsize=110;
const maxsolutions=15;

var cancount=0;
var maxchecks=100000
var canvaslist = [], mouseover = []

var solutions = [];
var count = 0;
var tsize = size;
var startTime,endTime;
//Puzzle

mpuzzle = stdPuzzle(size);
initHTML() 

solutions = []

//Solve
solve(prep(), 0);


//Output
redraw()


function Puzzle(p) {
  this.puzzle = p;
  this.childs = [];
}

function prep() {
  let p = new Puzzle([["", 0, 0, 0, 0]]);
  tpuzzle = copy(mpuzzle)
  tpuzzle.forEach(part => {
    p.puzzle[0] = part;
    t = new Puzzle(copy(p.puzzle));
    p.childs.push(t);
  });
  return p;
}

function solve(c, i) {
  i++;
  c.childs.forEach(c => {
    if(solutions.length < maxsolutions && count < maxchecks)  {
      fill(c,i);
      if (i <= tsize -1) {
        solve(c, i); 
      } else {
        //if (check(c.puzzle, 1)) {
          solutions.push(c.puzzle);
       // }
      }
    }
  });
}

function fill (p,n) {
    let pt = []
    p.puzzle.forEach( el => { pt.push(el[0]) })
    for (let i = 0; i < tsize; i++) {
      if (pt.indexOf(tpuzzle[i][0]) === -1) {
        for (let r = 0; r < 4; r++) {
          p.puzzle[n] = tpuzzle[i];
          if (check(p.puzzle,n)) {
            t = new Puzzle(copy(p.puzzle)); //1:1 copy
            p.childs.push(t);
          }
          if(r!==3) {p.puzzle[n] = rotate(p.puzzle[n]);}
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


function rotate(piece) {
  piece.push(piece[1]);
  piece.splice(1, 1);
  return piece;
}

function copy(puzzle){
  return JSON.parse(JSON.stringify(puzzle));;
}

function drawtiles() {
  div = document.getElementById('can');
  tsize = 1;  sqrt_size = Math.sqrt(tsize);

  let puzzle = []
  mpuzzle.forEach( p => {puzzle.push([p])})

  puzzle.forEach(p => {
      div.insertAdjacentHTML('beforeend', '<canvas id="can' + cancount +
      '" width="' + (sqrt_size * drawsize) + '" height="' + (sqrt_size * drawsize) + '"></canvas>');
    canvaslist[cancount] = document.getElementById("can" + (cancount));

    canvaslist[cancount].i = cancount;
    canvaslist[cancount].onclick = function(event) {
      if((event.y-this.getBoundingClientRect().y ) < (drawsize/4)) {
        mpuzzle[this.i][1] = next(mpuzzle[this.i][1]);
      }
      if((event.y-this.getBoundingClientRect().y ) > drawsize-(drawsize/4)) {
        mpuzzle[this.i][3] = next(mpuzzle[this.i][3]);
      }
      if((event.x-this.getBoundingClientRect().x ) < (drawsize/4)) {
        mpuzzle[this.i][4] = next(mpuzzle[this.i][4]);
      }
      if((event.x-this.getBoundingClientRect().x ) > drawsize-(drawsize/4)) {
        mpuzzle[this.i][2] = next(mpuzzle[this.i][2]);
      }
      redraw();

      }
       drawPuzzle(p, canvaslist[cancount]);
       cancount++;    
    });
    div.insertAdjacentHTML('beforeend', '<br>');
}

function initHTML() {
  drawtiles();
  tsize = size;
  sqrt_size = Math.sqrt(tsize);
  let div = document.getElementById('can');
  let start = cancount
  for(let i=0; i<maxsolutions; i++){
          div.insertAdjacentHTML('beforeend', '<canvas id="can' + cancount +
      '" width="' + (sqrt_size * drawsize) + '" height="' + (sqrt_size * drawsize) + '"></canvas>');
    canvaslist[cancount] = document.getElementById("can" + (cancount));
    cancount++;
  }
}

function redraw(){
    console.clear;
  let i=0, puzzle = [];
  tsize = 1; count = 0;
  sqrt_size = Math.sqrt(tsize);
  mpuzzle.forEach( p => {puzzle.push([p])})
  puzzle.forEach(p => {      
       drawPuzzle(p, canvaslist[i]);
       i++;
  });

  for(let j=i; j<maxsolutions+i; j++){
    context = canvaslist[j].getContext('2d');
    context.clearRect(0, 0, canvaslist[j].width, canvaslist[j].height);
  }

  tsize = size;
  sqrt_size = Math.sqrt(tsize); 
  solutions = [];
  startTime = new Date();
  solve(prep(), 0);
  endTime = new Date();

  solutions.forEach(p => {       
    if(canvaslist.length > i) { drawPuzzle(p, canvaslist[i]); }
    i++;
   });

  document.getElementById('text').innerHTML = "<p>C:" + count + "  " +
  (endTime - startTime + " ms ") + solutions.length+ " Lösungen " +"</p>"
}

function drawPuzzle(puzzle, can) {
  const color = ["rgb(255,255,255)", "rgb(255,255,0)", "rgb(255,130,0)",
                 "rgb(80,190,80)", "rgb(0,80,255)"];
  let c = can;
  let ctx = c.getContext("2d");
  let s = sqrt_size * drawsize;
  let x = 0;
  let y = 0;

  //Clear
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, s, s);
  ctx.rect(0, 0, s, s);
  ctx.stroke();
  //Grid
  for (let i = 0; i < sqrt_size - 1; i++) {
    ctx.moveTo(0, drawsize + i * drawsize);
    ctx.lineTo(s, drawsize + i * drawsize);
    ctx.stroke();
    ctx.moveTo(drawsize + i * drawsize, 0);
    ctx.lineTo(drawsize + i * drawsize, s);
    ctx.stroke();
  }

  for (let i = 0; i < tsize; i++) {

    ctx.fillStyle = "#000000";
    ctx.font = "30px Arial";
    x = (i % sqrt_size) * drawsize;
    y = Math.floor(i / sqrt_size) * drawsize
    ctx.fillText(puzzle[i][0], 42 + x, y + 59);

    // top
    x = drawsize/2 + (i % sqrt_size) * drawsize;
    y = Math.floor(i / sqrt_size) * drawsize;

    ctx.fillStyle = color[Math.abs(puzzle[i][1])];
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI, false);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    if (puzzle[i][1] < 0) {
      ctx.arc(x, y, 15, 0, 0.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9 + x, 8 + y, 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.arc(x, y, 15, 0.5 * Math.PI, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(+8 + x, 9 + y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // right
    x = drawsize + (i % sqrt_size) * drawsize;
    y = drawsize/2 + Math.floor(i / sqrt_size) * drawsize;

    ctx.fillStyle = color[Math.abs(puzzle[i][2])];
    ctx.beginPath();
    ctx.arc(x, y, 25, 1.5 * Math.PI, 0.5 * Math.PI, true);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    if (puzzle[i][2] < 0) {
      ctx.arc(x, y, 15, Math.PI, 0.5 * Math.PI, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9 + x, -8 + y, 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.arc(x, y, 15, Math.PI, 1.5 * Math.PI, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9 + x, +8 + y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.stroke();

    // bottom
    x = drawsize/2 + (i % sqrt_size) * drawsize;
    y = drawsize + Math.floor(i / sqrt_size) * drawsize;

    ctx.fillStyle = color[Math.abs(puzzle[i][3])];
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI, true);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    if (puzzle[i][3] < 0) {
      ctx.arc(x, y, 15, Math.PI, 1.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(+8 + x, -9 + y, 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.arc(x, y, 15, 1.5 * Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-8 + x, -9 + y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.stroke();

    // left
    x = (i % sqrt_size) * drawsize;
    y = drawsize/2 + Math.floor(i / sqrt_size) * drawsize;
    ctx.fillStyle = color[Math.abs(puzzle[i][4])];
    ctx.beginPath();
    ctx.arc(x, y, 25, 1.5 * Math.PI, 0.5 * Math.PI, false);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "#000000";
    if (puzzle[i][4] < 0) {
      ctx.arc(x, y, 15, 1.5 * Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9 + x, +8 + y, 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.arc(x, y, 15, 0, 0.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9 + x, -8 + y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.stroke();
  }
}

function checkall(puzzle, f = 0) {
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
  if(n < 0) {
    n=-n;
    n++;
    if (n>4) { 
      return 1
    }
    else {
      return n
    }
  }
  else {
    if(n==0){ return Math.floor(Math.random() * 4+1)}
    return -n;
  }
}

function randomPuzzle()
{
  let puzzle = [] 
  c = "abcdefghijklmnopqrstuvwxyz0123456789".split('');
  for(let i=0; i<size; i++){
    puzzle.push([c[i],getRandom(),getRandom(),getRandom(),getRandom()])
  }
  return puzzle;
}

function emptyPuzzle()
{
  let puzzle = [] 
  c = "abcdefghijklmnopqrstuvwxyz0123456789".split('');
  for(let i=0; i<size; i++){
    puzzle.push([c[i],0,0,0,0])
  }
  return puzzle;
}

function stdPuzzle()
{
  let puzzle = [];
  puzzle.push(["a", 1, -4, -2, 3]);
  puzzle.push(["b", -3, 2, 1, -2]);
  puzzle.push(["c", -1, 3, 4, -2]);

  puzzle.push(["d", -1, 4, 3, -4]);
  puzzle.push(["e", -1, 2, 3, -4]);
  puzzle.push(["f", -4, 1, 3, -2]);

  puzzle.push(["g", -3, 4, 1, -2]);
  puzzle.push(["h", -3, 2, 1, -4]);
  puzzle.push(["i", -3, 4, 1, -2]); 
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

