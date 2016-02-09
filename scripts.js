{

var ranges = [
  { divider: 1e36 , suffix: 'L' },
  { divider: 1e33 , suffix: 'K' },
  { divider: 1e30 , suffix: 'J' },
  { divider: 1e27 , suffix: 'I' },
  { divider: 1e24 , suffix: 'H' },
  { divider: 1e21 , suffix: 'G' },
  { divider: 1e18 , suffix: 'F' },
  { divider: 1e15 , suffix: 'E' },
  { divider: 1e12 , suffix: 'D' },
  { divider: 1e9 , suffix: 'C' },
  { divider: 1e6 , suffix: 'B' },
  { divider: 1e3 , suffix: 'A' }
];

var gold = 0;
var goldpt = 0;
var goldmod = 1;
var goldupcost = 10;
 
var miner = 0;
var minercost = 20;
var minerpt = 0;
var minermod = 1;
var minerupcost = 1500;
 
var foreman = 0;
var foremancost = 15;
var foremanpt = 0;
var foremanmod = 1;
var foremanupcost = 25000;

var ship = 1;
var shipcost = 10;
var shippt = 0;
var shipmod = 2;
var shipupcost = 5000000;

//upgrades
var goldbuy = 0;
var goldbuycost = 100;

var level = 1;
var progress = 0;
var it = 0, it2 = 0;
var longtick = 5;

var clicktype = "gold";
var minerclickcost = 400000000;


//initialise canvas
var canvas = oCanvas.create({canvas: "canvas"});
var levelcost = canvas.width;
	
var image1 = canvas.display.image(
{
	x:30, 
	y:30, 
	origin: {x:"center", y:"center"},
	image: "images/defaultship.png",
	height:150,
	width:150
});

var droneArray = [];

var dronesprite = canvas.display.sprite(
{
	x:0,
	y:0,
	origin: {x:32, y:650},
	image: "images/dronesheet.jpg",
	height: 256,
	width: 256,
	generate: true,
	direction: "x",
	duration: 120,
	speed: 1
});

var level_text = canvas.display.text({
	x: 20,
	y: canvas.height - 24,
	origin: { x: "left", y: "bottom" },
	font: "bold 24px sans-serif",
	text: "Level",
	fill: "#000"
});

canvas.addChild(image1);
canvas.addChild(level_text);


//loadGame();
initialiseCosts();

//main game loop, using date based method

var delay = (1000 / 30);
var now, before = new Date();

setInterval( function() 
{	
    now = new Date();
    var elapsedTime = (now.getTime() - before.getTime());
    if(elapsedTime > delay)
	{
        //Recover the motion lost while inactive.
		for (var i = 0; i < elapsedTime/delay; i++)
			tick(false); //without updates to canvas etc...
	}	
	else
		tick(true);
	
    before = new Date();    
}, delay);		

}

function initialiseCosts()
{
	//set first two elements to be visible
	document.getElementById( "goldbutton").style.backgroundColor = "lightgray";
	document.getElementById( "goldbutton").style.visibility = "visible";
	document.getElementById( "gold").style.visibility = "visible";

	//give values to the buttons based off of javascript variables
	document.getElementById( "goldbutton").value = "Click  " + "+ " + goldmod + " gold";
	document.getElementById( "foremanbutton").value = "Foremans  " + " Costs " + foremancost + " miners";
	document.getElementById( "minerbutton").value = "Miners  " + " Costs " + minercost + " gold";
	document.getElementById( "shipbutton").value = "Drones  " + " Costs " + shipcost + " foremen";

	document.getElementById( "goldupgradebutton").value = "Upgrade Clicks  " + " Costs " + goldupcost + " gold";
	document.getElementById( "minerupgradebutton").value = "Upgrade Miners  " + " Costs " + minerupcost + " gold";
	document.getElementById( "foremanupgradebutton").value = "Upgrade Foremen  " + " Costs " + foremanupcost + " gold";
	document.getElementById( "shipupgradebutton").value = "Upgrade Drones  " + " Costs " + shipupcost + " gold";

	//Initialise canvas text
	level_text.text = "Level " + level;

	
}

function checkVisibility()
{
	if (gold >= goldupcost * 0.5)
	{
		document.getElementById( "goldupgradebutton").style.visibility = "visible";
	}
	if (gold >= foremanupcost * 0.5 && document.getElementById( "foremans").style.visibility == "visible")
	{
		document.getElementById( "foremanupgradebutton").style.visibility = "visible";
	}
	if ( gold >= minerupcost * 0.5 && document.getElementById("miners").style.visibility == "visible")
	{
		document.getElementById("minerupgradebutton").style.visibility = "visible";

	}	
	
	if (gold >= shipupcost * 0.5 && document.getElementById("ships").style.visibility == "visible" )
	{
		document.getElementById("shipupgradebutton").style.visibility = "visible";
	}
	
	if ( miner >= foremancost * 0.5)
	{
		document.getElementById( "foremans").style.visibility = "visible";
		document.getElementById("foremanbutton").style.visibility = "visible";
		document.getElementById("minerspt").style.visibility = "visible";

	}
	
	if (foreman >= shipcost * 0.5)
	{
		document.getElementById( "ships").style.visibility = "visible";
		document.getElementById("shipbutton").style.visibility = "visible";
		document.getElementById("foremanspt").style.visibility = "visible";		
		
	}
	
	if (gold >= minercost)
	{
		document.getElementById("miners").style.visibility = "visible";
		document.getElementById("minerbutton").style.visibility = "visible";
		document.getElementById( "goldpt").style.visibility = "visible";
	}
	
	if (ship >= goldbuycost * 0.5 && goldbuy === 0)
	{
		document.getElementById("goldbuy").style.visibility = "visible";
	}
	
	if (foreman >= minerclickcost * 0.5 && clicktype == "gold")
	{
		document.getElementById("minerclick").style.visibility = "visible";
	}
}

function updateAmounts()
{
	document.getElementById( "gold" ).value = formatNumber(gold);	
	document.getElementById( "miners" ).value = formatNumber(miner);	
	document.getElementById( "foremans" ).value = formatNumber(foreman);
	document.getElementById( "ships" ).value = formatNumber(ship);
	
	document.getElementById( "goldpt" ).value = formatNumber(goldpt) + " /sec";	
	document.getElementById( "minerspt" ).value = formatNumber(minerpt) + " /sec";	
	document.getElementById( "foremanspt" ).value = formatNumber(foremanpt) + " /sec";
	document.getElementById( "shipspt" ).value = formatNumber(shippt) + " /sec";
	
	
}

function updateCosts()
{
	document.getElementById( "minerbutton").value = "Miners  " + "Costs " + formatNumber(minercost) + " gold";

	
	if (goldbuy == 1)
	{
		document.getElementById( "foremanbutton").value = "Foremans  " + "Costs " + formatNumber(foremancost) + " gold";
		document.getElementById( "shipbutton").value = "Drones  " + "Costs " + formatNumber(shipcost) + " gold";
	}
	else
	{
		document.getElementById( "foremanbutton").value = "Foremans  " + "Costs " + formatNumber(foremancost) + " miners";
		document.getElementById( "shipbutton").value = "Drones  " + "Costs " + formatNumber(shipcost) + " foreman";
	}
	
	//upgrade costs
	document.getElementById( "goldbutton").value = "Click  " + "+ " + formatNumber(goldmod) + " " + clicktype;
	document.getElementById( "goldupgradebutton").value = "Upgrade Clicks  " +  " Costs " + formatNumber(goldupcost) + " gold";
	document.getElementById( "minerupgradebutton").value = "Upgrade Miners " + formatNumber(minermod) + " Costs " + formatNumber(minerupcost) + " gold";
	document.getElementById( "foremanupgradebutton").value = "Upgrade Foremen " + formatNumber(foremanmod) + " Costs " + formatNumber(foremanupcost) + " gold";
	document.getElementById( "shipupgradebutton").value = "Upgrade Drones " + formatNumber(shipmod) + " Costs " + formatNumber(shipupcost) + " gold";

	
}

function grayButtons()
{
	//units	
	if (gold >= minercost)
		document.getElementById( "minerbutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "minerbutton").style.backgroundColor = "gray";
	
	if (goldbuy == 1)
	{		
		if (gold >= foremancost)
			document.getElementById( "foremanbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "foremanbutton").style.backgroundColor = "gray";
		
		if (gold >= shipcost)
			document.getElementById( "shipbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "shipbutton").style.backgroundColor = "gray";
	}
	else
	{
		if (miner >= foremancost)
			document.getElementById( "foremanbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "foremanbutton").style.backgroundColor = "gray";
		
		if (foreman >= shipcost)
			document.getElementById( "shipbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "shipbutton").style.backgroundColor = "gray";
	}
	
	//upgrades	
	if (gold >= goldupcost)
		document.getElementById( "goldupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "goldupgradebutton").style.backgroundColor = "gray";

	if (gold >= minerupcost)
		document.getElementById( "minerupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "minerupgradebutton").style.backgroundColor = "gray";

	if (gold >= foremanupcost)
		document.getElementById( "foremanupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "foremanupgradebutton").style.backgroundColor = "gray";
	if (gold >= shipupcost)
		document.getElementById( "shipupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "shipupgradebutton").style.backgroundColor = "gray";
	
	if (goldbuy === 0)
	{
		if( ship >= goldbuycost)
			document.getElementById( "goldbuy").style.backgroundColor = "lightgray";		
		else
			document.getElementById( "goldbuy").style.backgroundColor = "gray";	
	}
	
	if (foreman >= minerclickcost)
		document.getElementById( "minerclick").style.backgroundColor = "lightgray";		
	else
		document.getElementById( "minerclick").style.backgroundColor = "gray";	
}

function tick(display)
{
	
	gold += goldpt/50;	
	progress += goldpt/50;
	miner += minerpt/50;
	foreman += foremanpt/50;
	
	goldpt = miner * minermod;
	minerpt = foreman * foremanmod;	
	foremanpt = ship * shipmod;	

	if (progress/levelcost >= 1)
	{
		level += 1;
		progress = 0;
		levelcost *= 2;
		level_text.text = "Level " + level;

	}

	if (display === true)
	{		
		//saveGame();
		

		if (it < longtick)
		{
			it++;
			
		}
		if (it == longtick)
		{
			it = 0;
			grayButtons();
			checkVisibility();
			updateCosts();
			it2++;
		}
		if (it2 == 30)
		{
			it2 = 0;
		}
		
		updateAmounts();
				
		drawScreen();
	}
}

function count() 
{
	if (clicktype == "gold")
	{
		progress += 1*goldmod;
		gold += 1*goldmod;
	}
	else if (clicktype == "miner")
	{
		miner += 1*goldmod;
	}
} 
 
 function buyunit(id)
 {
	if (id == "miner")
		buyminer(goldbuy);
	else if (id == "foreman")
		buyforeman(goldbuy);
	else if (id == "ship")
		buyship(goldbuy);	
 }
function buyminer(goldbuy)
{
	if (gold >= minercost)
	{
		gold -= minercost;
		miner += 1;			
		minercost *= 1.15;
		minercost = Math.round(minercost);
		
		updateAmounts();		
	}
 }
 
function buyforeman(goldbuy)
{
	var currency;
	if (goldbuy == 1)
		currency = gold;
	else
		currency = miner;

	if (currency >= foremancost)
	{
		if (goldbuy == 1)
			gold -= foremancost;		
		else
			miner -= foremancost;
		
		foreman += 1;		
		foremancost *= 1.25;
		foremancost = Math.round(foremancost);
					
		updateAmounts();		
	}

 }
 
 function buyship(goldbuy)
{
	var currency;
	if (goldbuy == 1)
		currency = gold;
	else
		currency = foreman;

	if (currency >= shipcost)
	{
		if (goldbuy == 1)
			gold -= shipcost;		
		else
			foreman -= shipcost;
		
		var prevDrone = Math.floor(Math.log(ship));	
		ship += 1;			
		var newDrone = Math.floor(Math.log(ship));
		
		if (newDrone > prevDrone)
		{
			//add new drone
			var newdrone = dronesprite.clone();
			newdrone.scale(0.25,0.25);
			
			image1.addChild(newdrone);
			droneArray.push(newdrone);
			newdrone.start();
			
			for (var i = 0; i < droneArray.length; i++)
			{
				droneArray[i].rotation = i*360/droneArray.length;			
			}			
		}
		
		
		shipcost *= 1.1;
		shipcost = Math.round(shipcost);
						
		updateAmounts();		
	}

 }
 
function upgrade(id)
{
	if (id == "gold" && gold >= goldupcost)
	{
		gold -= goldupcost;
		goldupcost *= 7.5;
		goldmod *=4;
	}	
	if (id == "miner" && gold >= minerupcost)
	{
		gold -= minerupcost;
		minerupcost *= 3;
		minermod *= 1.3;
		minermod = Math.floor(minermod * 100)/100;
		goldpt = miner * minermod;

	}
	if (id == "foreman" && gold >= foremanupcost)
	{
		gold -= foremanupcost;
		foremanupcost *= 3;
		foremanmod *= 1.3;
		foremanmod = Math.floor(foremanmod * 100)/100;

		minerpt = foreman * foremanmod;
	}
	
	if (id == "ship" && gold >= shipupcost)
	{
		gold -= shipupcost;
		shipupcost *= 2.5;
		shipmod *= 1.3;
		shipmod = Math.floor(shipmod * 100)/100;

		minerpt = ship * shipmod;
	}
	
	if (id == "goldbuy")
	{
		if (goldbuy === 0 && ship >= goldbuycost)
		{
			ship -= goldbuycost;
			goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";
			
			//remove the ships
			while (image1.children.length != 0)
			{
				image1.removeChildAt(0);
			}	
			droneArray.length = 0;
			prevDrone = Math.log(ship);
			for (var x = 0; x < prevDrone; x++)
			{
				//add new drone
				var newdrone = dronesprite.clone();
				newdrone.scale(0.25,0.25);
				
				image1.addChild(newdrone);
				droneArray.push(newdrone);
				newdrone.start();
				
				for (var i = 0; i < droneArray.length; i++)
				{
					droneArray[i].rotation = i*360/droneArray.length;			
				}	
			}

			
		}
		else if (goldbuy == 1)
		{
			goldbuy = 2;
			document.getElementById( "goldbuy" ).value = "Goldbuying units disabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#FFFFFF";
			
		}	
		else if (goldbuy == 2)
		{
			goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";		
		}
	}
	
	if (id == "minerclick")
	{
		clicktype = "miner";
		document.getElementById( "minerclick").style.visibility = "hidden";	
		goldmod *= 10;
	}	
	
	updateAmounts();		
}

// number handling
function formatNumber(n) {
  for (var i = 0; i < ranges.length; i++) 
  {
    if (n >= ranges[i].divider) 
	{
		var temp = (n / ranges[i].divider);
		temp = Math.floor(temp*1000)/1000;
	
	
		//handling numbers like 25k
		if (temp % 1 === 0)
			return temp.toString() + " " + ranges[i].suffix;

		//always display 3 digits after decimal points
		else if ((temp * 1000)%10 === 0)
		{
			if ((temp * 100)%10 === 0)
				return temp.toString() + "00 " + ranges[i].suffix;
			else
				return temp.toString() + "0 " + ranges[i].suffix;
		}
		
		return temp.toString() + " " + ranges[i].suffix;

    }
  }
  var temp = Math.floor(n*10)/10;  
  if ((temp * 10) % 10 === 0)
	  return temp.toString() + ".0";
  
  return temp.toString();
}

// canvas drawing

//ocanvas

function drawExtras()
{	
	//move drones
	for (var i = 0; i < droneArray.length; i++)
		droneArray[i].rotation -= droneArray[i].speed;
	
	//text
	
	/*	
	if (level >= 50)
	{
		ctx.font = "36px Times New Roman";
		ctx.fillText("You did it!",450,50);		
	}*/
}

function drawShip()
{	
	image1.moveTo(-75 + (canvas.width+150)*progress/levelcost, canvas.height/2);
}
function drawScreen()
{
	drawExtras();
	drawShip();
	canvas.redraw();
}

//loading game

/*
function loadGame()
{
	alert("Gold: " + getCookie("gold") + "\n\nCookie: " + document.cookie);
}


// saving game
function saveGame()
{
	level_text.text = "Level " + level + "    saved";

	clearCookie();
	
	var cookieString = "";
	cookieString = setCookie(cookieString, "gold", gold);
	cookieString = setCookie(cookieString, "goldmod", goldmod);
	cookieString = setCookie(cookieString, "miner", miner);
	cookieString = setCookie(cookieString, "minermod", minermod);
	cookieString = setCookie(cookieString, "foreman", foreman);
	cookieString = setCookie(cookieString, "foremanmod", foremanmod);
	cookieString = setCookie(cookieString, "ship", ship);
	cookieString = setCookie(cookieString, "shipmod", shipmod);
	
	document.cookie = cookieString;
}

function clearCookie()
{
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
    	var cookie = cookies[i];
    	var eqPos = cookie.indexOf("=");
    	var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    	document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}*/