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

//initialise canvas
var fps = 30;

var canvas = oCanvas.create({canvas: "canvas"});

function NewGame()
{
	this.gold = 0;
	this.gold = 0;
	this.goldpt = 0;
	this.goldmod = 1;
	this.goldupcost = 10;
	 
	this.miner = 0;
	this.minercost = 20;
	this.minerpt = 0;
	this.minermod = 1;
	this.minerupcost = 1500;
	 
	this.foreman = 0;
	this.foremancost = 15;
	this.foremanpt = 0;
	this.foremanmod = 1;
	this.foremanupcost = 25000;

	this.ship = 0;
	this.shipcost = 10;
	this.shippt = 0;
	this.shipmod = 2;
	this.shipupcost = 5000000;
	this.prevdrone = -1;

	//upgrades
	this.goldbuy = 0;
	this.goldbuycost = 100;

	this.level = 1;
	this.levelcost = canvas.width;
	this.progress = 0;
	this.it = 0;
	this.it2 = 0;
	this.longtick = 5;

	this.clicktype = "gold";
	this.minerclickcost = 400000000;
}
var Game = new NewGame();

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
	duration: 4 * 1000/fps,
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

var save_text = canvas.display.text({
	x: canvas.width - 20,
	y: canvas.height - 24,
	origin: { x: "right", y: "bottom" },
	font: "bold 24px sans-serif",
	text: "",
	fill: "#000"
});

canvas.addChild(image1);
canvas.addChild(level_text);
canvas.addChild(save_text);

// if save file does not exist, create one in local storage
if (localStorage.getItem('saveObject') === null)
	localStorage.setItem('saveObject', JSON.stringify(Game));

//load file from local storage
Game = JSON.parse(localStorage.getItem('saveObject'));

initialiseCosts();

//main game loop, using date based method
var delay = (1000 / fps);
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
	document.getElementById( "goldbutton").value = "Click  " + "+ " + Game.goldmod + " gold";
	document.getElementById( "foremanbutton").value = "Foremans  " + " Costs " + Game.foremancost + " miners";
	document.getElementById( "minerbutton").value = "Miners  " + " Costs " + Game.minercost + " gold";
	document.getElementById( "shipbutton").value = "Drones  " + " Costs " + Game.shipcost + " foremen";

	document.getElementById( "goldupgradebutton").value = "Upgrade Clicks  " + " Costs " + Game.goldupcost + " gold";
	document.getElementById( "minerupgradebutton").value = "Upgrade Miners  " + " Costs " + Game.minerupcost + " gold";
	document.getElementById( "foremanupgradebutton").value = "Upgrade Foremen  " + " Costs " + Game.foremanupcost + " gold";
	document.getElementById( "shipupgradebutton").value = "Upgrade Drones  " + " Costs " + Game.shipupcost + " gold";

	//Initialise canvas text
	level_text.text = "Level " + Game.level;

	
}

function checkVisibility()
{
	if (Game.gold >= Game.goldupcost * 0.5)
	{
		document.getElementById( "goldupgradebutton").style.visibility = "visible";
	}
	if (Game.gold >= Game.foremanupcost * 0.5 && document.getElementById( "foremans").style.visibility == "visible")
	{
		document.getElementById( "foremanupgradebutton").style.visibility = "visible";
	}
	if ( Game.gold >= Game.minerupcost * 0.5 && document.getElementById("miners").style.visibility == "visible")
	{
		document.getElementById("minerupgradebutton").style.visibility = "visible";

	}	
	
	if (Game.gold >= Game.shipupcost * 0.5 && document.getElementById("ships").style.visibility == "visible" )
	{
		document.getElementById("shipupgradebutton").style.visibility = "visible";
	}
	
	if ( Game.miner >= Game.foremancost * 0.5)
	{
		document.getElementById( "foremans").style.visibility = "visible";
		document.getElementById("foremanbutton").style.visibility = "visible";
		document.getElementById("minerspt").style.visibility = "visible";

	}
	
	if (Game.foreman >= Game.shipcost * 0.5)
	{
		document.getElementById( "ships").style.visibility = "visible";
		document.getElementById("shipbutton").style.visibility = "visible";
		document.getElementById("foremanspt").style.visibility = "visible";		
		
	}
	
	if (Game.gold >= Game.minercost)
	{
		document.getElementById("miners").style.visibility = "visible";
		document.getElementById("minerbutton").style.visibility = "visible";
		document.getElementById( "goldpt").style.visibility = "visible";
	}
	
	if (Game.ship >= Game.goldbuycost * 0.5 && Game.goldbuy === 0)
	{
		document.getElementById("goldbuy").style.visibility = "visible";
	}
	
	if (Game.foreman >= Game.minerclickcost * 0.5 && Game.clicktype == "gold")
	{
		document.getElementById("minerclick").style.visibility = "visible";
	}
}

function updateAmounts()
{
	document.getElementById( "gold" ).value = formatNumber(Game.gold);	
	document.getElementById( "miners" ).value = formatNumber(Game.miner);	
	document.getElementById( "foremans" ).value = formatNumber(Game.foreman);
	document.getElementById( "ships" ).value = formatNumber(Game.ship);
	
	document.getElementById( "goldpt" ).value = formatNumber(Game.goldpt) + " /sec";	
	document.getElementById( "minerspt" ).value = formatNumber(Game.minerpt) + " /sec";	
	document.getElementById( "foremanspt" ).value = formatNumber(Game.foremanpt) + " /sec";
	document.getElementById( "shipspt" ).value = formatNumber(Game.shippt) + " /sec";
	
	
}

function updateCosts()
{
	document.getElementById( "minerbutton").value = "Miners  " + "Costs " + formatNumber(Game.minercost) + " gold";

	
	if (Game.goldbuy == 1)
	{
		document.getElementById( "foremanbutton").value = "Foremans  " + "Costs " + formatNumber(Game.foremancost) + " gold";
		document.getElementById( "shipbutton").value = "Drones  " + "Costs " + formatNumber(Game.shipcost) + " gold";
	}
	else
	{
		document.getElementById( "foremanbutton").value = "Foremans  " + "Costs " + formatNumber(Game.foremancost) + " miners";
		document.getElementById( "shipbutton").value = "Drones  " + "Costs " + formatNumber(Game.shipcost) + " foreman";
	}
	
	//upgrade costs
	document.getElementById( "goldbutton").value = "Click  " + "+ " + formatNumber(Game.goldmod) + " " + Game.clicktype;
	document.getElementById( "goldupgradebutton").value = "Upgrade Clicks  " +  " Costs " + formatNumber(Game.goldupcost) + " gold";
	document.getElementById( "minerupgradebutton").value = "Upgrade Miners " + formatNumber(Game.minermod) + " Costs " + formatNumber(Game.minerupcost) + " gold";
	document.getElementById( "foremanupgradebutton").value = "Upgrade Foremen " + formatNumber(Game.foremanmod) + " Costs " + formatNumber(Game.foremanupcost) + " gold";
	document.getElementById( "shipupgradebutton").value = "Upgrade Drones " + formatNumber(Game.shipmod) + " Costs " + formatNumber(Game.shipupcost) + " gold";

	
}

function grayButtons()
{
	//units	
	if (Game.gold >= Game.minercost)
		document.getElementById( "minerbutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "minerbutton").style.backgroundColor = "gray";
	
	if (Game.goldbuy == 1)
	{		
		if (Game.gold >= Game.foremancost)
			document.getElementById( "foremanbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "foremanbutton").style.backgroundColor = "gray";
		
		if (Game.gold >= Game.shipcost)
			document.getElementById( "shipbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "shipbutton").style.backgroundColor = "gray";
	}
	else
	{
		if (Game.miner >= Game.foremancost)
			document.getElementById( "foremanbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "foremanbutton").style.backgroundColor = "gray";
		
		if (Game.foreman >= Game.shipcost)
			document.getElementById( "shipbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "shipbutton").style.backgroundColor = "gray";
	}
	
	//upgrades	
	if (Game.gold >= Game.goldupcost)
		document.getElementById( "goldupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "goldupgradebutton").style.backgroundColor = "gray";

	if (Game.gold >= Game.minerupcost)
		document.getElementById( "minerupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "minerupgradebutton").style.backgroundColor = "gray";

	if (Game.gold >= Game.minerupcost)
		document.getElementById( "foremanupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "foremanupgradebutton").style.backgroundColor = "gray";
	if (Game.gold >= Game.shipupcost)
		document.getElementById( "shipupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "shipupgradebutton").style.backgroundColor = "gray";
	
	if (Game.goldbuy === 0)
	{
		if( Game.ship >= Game.goldbuycost)
			document.getElementById( "goldbuy").style.backgroundColor = "lightgray";		
		else
			document.getElementById( "goldbuy").style.backgroundColor = "gray";	
	}
	
	if (Game.miner >= Game.minerclickcost)
		document.getElementById( "minerclick").style.backgroundColor = "lightgray";		
	else
		document.getElementById( "minerclick").style.backgroundColor = "gray";	
}

function tick(display)
{
	
	Game.gold += Game.goldpt/50;	
	Game.progress += Game.goldpt/50;
	Game.miner += Game.minerpt/50;
	Game.foreman += Game.foremanpt/50;
	
	Game.goldpt = Game.miner * Game.minermod;
	Game.minerpt = Game.foreman * Game.foremanmod;	
	Game.foremanpt = Game.ship * Game.shipmod;	

	if (Game.progress/Game.levelcost >= 1)
	{
		Game.level += 1;
		Game.progress = 0;
		Game.levelcost *= 2;
		level_text.text = "level " + Game.level;

	}
	
	// auto save the game
	if (Game.it % 500 === 0)
	{
		localStorage.setItem('saveObject', JSON.stringify(Game));
		Game.it2 = 0;
		save_text.text = "Autosaved...";
	}	
	//only update ui when the tab is selected
	if (display === true)
	{		
		if (Game.it < 1000)
			Game.it++;	
		else
			Game.it = 0;
		
		//run ui functions
		if (Game.it % 6 === 0)
		{
			updateCosts();
		}
		if (Game.it % 20 === 0)
		{
			grayButtons();
			checkVisibility();
			save_text.text = "";
		}			
		updateAmounts();			
		drawScreen();
	}
}

function count() 
{
	if (Game.clicktype == "gold")
	{
		Game.progress += 1*Game.goldmod;
		Game.gold += 1*Game.goldmod;
	}
	else if (Game.clicktype == "miner")
	{
		Game.progress += 1*Game.goldmod;
		Game.gold += 1*Game.goldmod;
		
		Game.miner += 0.01*Game.goldmod;
	}
} 
 
 function buyunit(id)
 {
	if (id == "miner")
		buyminer(Game.goldbuy);
	else if (id == "foreman")
		buyforeman(Game.goldbuy);
	else if (id == "ship")
		buyship(Game.goldbuy);	
 }
function buyminer(mode)
{
	if (Game.gold >= Game.minercost)
	{
		Game.gold -= Game.minercost;
		Game.miner += 1;			
		Game.minercost *= 1.15;
		Game.minercost = Math.round(Game.minercost);
		
		grayButtons();		
	}
 }
 
function buyforeman(mode)
{
	var currency;
	if (mode == 1)
		currency = Game.gold;
	else
		currency = Game.miner;

	if (currency >= Game.foremancost)
	{
		if (mode == 1)
			Game.gold -= Game.foremancost;		
		else
			Game.miner -= Game.foremancost;
		
		Game.foreman += 1;		
		Game.foremancost *= 1.25;
		Game.foremancost = Math.round(Game.foremancost);
					
		grayButtons();		
	}

 }
 
 function buyship(mode)
{
	var currency;
	if (mode == 1)
		currency = Game.gold;
	else
		currency = Game.miner;

	if (currency >= Game.shipcost)
	{
		if (mode == 1)
			Game.gold -= Game.shipcost;		
		else
			Game.miner -= Game.shipcost;
		
		Game.prevdrone = Math.floor(Math.log(Game.ship));	
		Game.ship += 1;			
		var newDrone = Math.floor(Math.log(Game.ship));
		
		if (newDrone > Game.prevdrone)
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
		
		
		Game.shipcost *= 1.1;
		Game.shipcost = Math.round(Game.shipcost);
						
		grayButtons();		
	}

 }
 
function upgrade(id)
{
	if (id == "gold" && Game.gold >= Game.goldupcost)
	{
		Game.gold -= Game.goldupcost;
		Game.goldupcost *= 7.5;
		Game.goldmod *=4;
	}	
	if (id == "miner" && Game.gold >= Game.minerupcost)
	{
		Game.gold -= Game.minerupcost;
		Game.minerupcost *= 3;
		Game.minermod *= 1.3;
		Game.minermod = Math.floor(Game.minermod * 100)/100;
		Game.goldpt = Game.miner * Game.minermod;

	}
	if (id == "foreman" && Game.gold >= Game.foremanupcost)
	{
		Game.gold -= Game.foremanupcost;
		Game.foremanupcost *= 3;
		Game.foremanmod *= 1.3;
		Game.foremanmod = Math.floor(Game.foremanmod * 100)/100;

		Game.minerpt = Game.foreman * Game.foremanmod;
	}
	
	if (id == "ship" && Game.gold >= Game.shipupcost)
	{
		Game.gold -= Game.shipupcost;
		Game.shipupcost *= 2.5;
		Game.shipmod *= 1.3;
		Game.shipmod = Math.floor(Game.shipmod * 100)/100;

		Game.minerpt = Game.ship * Game.shipmod;
	}
	
	if (id == "goldbuy")
	{
		if (Game.goldbuy === 0 && Game.ship >= Game.goldbuycost)
		{
			Game.ship -= Game.goldbuycost;
			Game.goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";
			
			//remove the ships
			while (image1.children.length != 0)
			{
				image1.removeChildAt(0);
			}	
			droneArray.length = 0;
			Game.prevdrone = Math.log(Game.ship);
			for (var x = 0; x < Game.prevdrone; x++)
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
		else if (Game.goldbuy == 1)
		{
			Game.goldbuy = 2;
			document.getElementById( "goldbuy" ).value = "Goldbuying units disabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#FFFFFF";
			
		}	
		else if (Game.goldbuy == 2)
		{
			Game.goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";		
		}
	}
	
	if (id == "minerclick")
	{
		Game.clicktype = "miner";
		document.getElementById( "minerclick").style.visibility = "hidden";	
		Game.goldmod *= 10;
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
	image1.moveTo(-75 + (canvas.width+150)*Game.progress/Game.levelcost, canvas.height/2);
}
function drawScreen()
{
	drawExtras();
	drawShip();
	canvas.redraw();
}

function deleteSave()
{
	if (confirm('Are you sure you want to delete your save file? All progress will be lost'))
	{
		localStorage.removeItem('saveObject');
		window.location.reload(true); //true to get new updates, pulls new page from server
	}
}